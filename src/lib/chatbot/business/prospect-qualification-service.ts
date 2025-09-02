import { QuestionnaireResponse } from '../chat'
import { EnhancedBusinessExtractor } from './enhanced-business-extractor'

interface BusinessExtractionResult {
  qualityScore: number
  extractedInfo?: Record<string, unknown>
  completeness: number
  confidenceScores?: Record<string, number>
  [key: string]: unknown
}

export interface ProspectQualification {
  // Scores par critère (0-100)
  businessNeedScore: number      // Clarté du besoin exprimé
  urgencyScore: number           // Niveau d'urgence
  budgetIndicator: number        // Indicateur budgétaire (temps investissement)
  experienceScore: number        // Expérience coaching précédente
  seriousnessScore: number       // Sérieux de la démarche
  
  // Score global
  globalScore: number            // Score final (0-100)
  grade: 'A+' | 'A' | 'B' | 'C' | 'D'
  
  // Recommandations
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  callbackDelay: string          // "Immédiat", "24h", "3 jours", etc.
  approach: string               // Approche commerciale recommandée
  
  // Détails pour l'email
  details: {
    businessNeedAnalysis: string
    urgencyAnalysis: string
    budgetAnalysis: string
    experienceAnalysis: string
    seriousnessAnalysis: string
    overallRecommendation: string
  }
}

export class EnhancedProspectQualificationService {
  
  private readonly businessKeywords = [
    'client', 'clients', 'investisseur', 'investisseurs', 'présentation', 'présentations',
    'pitch', 'équipe', 'commercial', 'commerciale', 'vente', 'ventes', 'projet', 'projets',
    'startup', 'entreprise', 'business', 'difficile', 'stress', 'problème', 'problèmes',
    'améliorer', 'développer', 'manager', 'formation', 'compétence', 'compétences',
    'communication', 'confiance', 'performance', 'objectif', 'objectifs', 'challenge',
    'besoin', 'aide', 'accompagnement', 'progresser', 'apprendre', 'conseil',
    'professionnel', 'professionnelle', 'travail', 'emploi', 'carrière', 'évolution',
    'leadership', 'management', 'négociation', 'convaincre', 'persuader', 'impact',
    'résultat', 'résultats', 'efficacité', 'stratégie', 'vision', 'opportunité',
    'marché', 'concurrence', 'innovation', 'solution', 'expertise', 'expérience',
    'talent', 'motivation', 'succès', 'réussite', 'excellence', 'qualité'
  ]

  private readonly urgencyKeywords = [
    'urgent', 'rapidement', 'vite', 'immédiat', 'immédiatement', 'bientôt', 'prochainement',
    'maintenant', 'aujourd\'hui', 'demain', 'semaine', 'mois', 'délai', 'échéance',
    'deadline', 'important', 'priorité', 'crucial', 'essentiel', 'nécessaire'
  ]

  private readonly seriousnessIndicators = [
    'professionnel', 'sérieux', 'concret', 'précis', 'détaillé', 'spécifique',
    'contexte', 'situation', 'expérience', 'déjà', 'essayé', 'testé', 'analysé',
    'réfléchi', 'étudié', 'recherché', 'budget', 'investissement', 'temps',
    'ressources', 'équipe', 'collaboration', 'partenariat', 'long terme'
  ]

  evaluateProspect(responses: QuestionnaireResponse[], aiMetadata?: {
    warningsReceived: number
    closedByAI: boolean
    [key: string]: unknown
  }): ProspectQualification {
    // Utiliser l'EnhancedBusinessExtractor pour une analyse plus poussée
    const combinedText = responses.map(r => r.answer).join(' ')
    const extraction = EnhancedBusinessExtractor.extractBusinessInfo(combinedText, {}) as unknown as BusinessExtractionResult
    
    const businessNeedScore = this.evaluateBusinessNeedWithExtraction(responses, extraction)
    const urgencyScore = this.evaluateUrgency(responses)
    const budgetIndicator = this.evaluateBudgetIndicator(responses)
    const experienceScore = this.evaluateExperience(responses)
    const seriousnessScore = this.evaluateSeriousness(responses, aiMetadata, extraction)
    
    const globalScore = this.calculateGlobalScore({
      businessNeed: businessNeedScore,
      urgency: urgencyScore,
      budget: budgetIndicator,
      experience: experienceScore,
      seriousness: seriousnessScore
    })

    const grade = this.calculateGrade(globalScore)
    const priority = this.calculatePriority(globalScore, urgencyScore)
    const callbackDelay = this.calculateCallbackDelay(priority, urgencyScore)
    const approach = this.generateApproach(globalScore, businessNeedScore)
    
    return {
      businessNeedScore,
      urgencyScore,
      budgetIndicator,
      experienceScore,
      seriousnessScore,
      globalScore,
      grade,
      priority,
      callbackDelay,
      approach,
      details: {
        businessNeedAnalysis: this.analyzeBusinessNeedWithExtraction(responses, extraction),
        urgencyAnalysis: this.analyzeUrgency(responses),
        budgetAnalysis: this.analyzeBudget(responses),
        experienceAnalysis: this.analyzeExperience(responses),
        seriousnessAnalysis: this.analyzeSeriousness(responses, aiMetadata, extraction),
        overallRecommendation: this.generateOverallRecommendation(globalScore, grade, priority)
      }
    }
  }

  private evaluateBusinessNeedWithExtraction(responses: QuestionnaireResponse[], extraction: BusinessExtractionResult): number {
    const step1 = responses.find(r => r.stepId === 1)?.answer || ''
    const step2 = responses.find(r => r.stepId === 2)?.answer || ''
    const combinedText = `${step1} ${step2}`.toLowerCase()
    
    let score = 0
    
    // Utiliser l'extraction pour améliorer l'évaluation
    if ((extraction.qualityScore as number) > 0.7) {
      score += 40 // Bonus pour extraction de haute qualité
    }
    
    // Analyse de la longueur et du détail
    const lengthScore = Math.min(combinedText.length / 10, 30) // Max 30 points pour longueur
    score += lengthScore
    
    // Analyse du vocabulaire business
    const businessMatches = this.businessKeywords.filter(keyword => 
      combinedText.includes(keyword)
    ).length
    const vocabularyScore = Math.min(businessMatches * 3, 30) // Max 30 points pour vocabulaire
    score += vocabularyScore
    
    // Bonus pour extraction d'informations structurées
    const extractedInfo = extraction.extractedInfo as Record<string, unknown> | undefined
    if (extractedInfo) {
      if (extractedInfo['need']) score += 15
      if (extractedInfo['timeline']) score += 10
      if (extractedInfo['urgency']) score += 5
    }
    
    return Math.min(score, 100)
  }

  private evaluateUrgency(responses: QuestionnaireResponse[]): number {
    const step3 = responses.find(r => r.stepId === 3)?.answer || '' // Urgence
    const step4 = responses.find(r => r.stepId === 4)?.answer || '' // Délai
    const step1 = responses.find(r => r.stepId === 1)?.answer || ''
    
    let urgencyScore = 0
    
    // Analyse de la réponse à la question d'urgence
    if (step3.toLowerCase().includes('oui')) {
      urgencyScore += 50
    } else if (step3.toLowerCase().includes('non')) {
      urgencyScore += 10
    }
    
    // Analyse du délai de démarrage
    if (step4.toLowerCase().includes('plus brefs délais')) {
      urgencyScore += 40
    } else if (step4.toLowerCase().includes('dans la semaine')) {
      urgencyScore += 30
    } else if (step4.toLowerCase().includes('dans le mois')) {
      urgencyScore += 20
    } else if (step4.toLowerCase().includes('un jour')) {
      urgencyScore += 5
    }
    
    // Analyse des mots-clés d'urgence dans la description
    const urgencyMatches = this.urgencyKeywords.filter(keyword => 
      step1.toLowerCase().includes(keyword)
    ).length
    urgencyScore += Math.min(urgencyMatches * 2, 10)
    
    return Math.min(urgencyScore, 100)
  }

  private evaluateBudgetIndicator(responses: QuestionnaireResponse[]): number {
    const step6 = responses.find(r => r.stepId === 6)?.answer || '' // Temps d'investissement
    
    // Analyse de l'investissement temps comme indicateur budgétaire
    if (step6.includes('+de 15h')) {
      return 100 // Excellent indicateur budgétaire
    } else if (step6.includes('15h')) {
      return 80  // Bon indicateur budgétaire
    } else if (step6.includes('6h')) {
      return 60  // Indicateur budgétaire moyen
    } else if (step6.includes('3h')) {
      return 40  // Indicateur budgétaire faible
    }
    
    return 30 // Pas d'indication claire
  }

  private evaluateExperience(responses: QuestionnaireResponse[]): number {
    const step5 = responses.find(r => r.stepId === 5)?.answer || '' // Expérience coaching
    
    // L'expérience précédente est un plus mais pas critique
    if (step5.toLowerCase().includes('oui')) {
      return 70 // Expérience précédente positive
    } else if (step5.toLowerCase().includes('non')) {
      return 90 // Pas d'expérience = potentiel d'amélioration plus grand
    }
    
    return 50 // Pas d'indication claire
  }

  private evaluateSeriousness(responses: QuestionnaireResponse[], aiMetadata?: {
    warningsReceived: number
    closedByAI: boolean
    [key: string]: unknown
  }, extraction?: BusinessExtractionResult): number {
    let seriousnessScore = 80 // Base positive
    
    // Pénalités basées sur l'IA
    if (aiMetadata?.warningsReceived && typeof aiMetadata.warningsReceived === 'number' && aiMetadata.warningsReceived > 0) {
      seriousnessScore -= aiMetadata.warningsReceived * 15
    }
    
    if (aiMetadata?.closedByAI) {
      seriousnessScore = 0 // Fermé par IA = pas sérieux
    }
    
    // Bonus pour extraction de qualité
    if (extraction?.qualityScore && extraction.qualityScore > 0.8) {
      seriousnessScore += 15
    }
    
    // Analyse du vocabulaire sérieux
    const step1 = responses.find(r => r.stepId === 1)?.answer || ''
    const step2 = responses.find(r => r.stepId === 2)?.answer || ''
    const combinedText = `${step1} ${step2}`.toLowerCase()
    
    const seriousMatches = this.seriousnessIndicators.filter(indicator => 
      combinedText.includes(indicator)
    ).length
    seriousnessScore += Math.min(seriousMatches * 3, 20)
    
    // Bonus pour les réponses détaillées
    if (combinedText.length > 200) {
      seriousnessScore += 10
    }
    
    return Math.max(0, Math.min(seriousnessScore, 100))
  }

  private calculateGlobalScore(scores: {
    businessNeed: number,
    urgency: number,
    budget: number,
    experience: number,
    seriousness: number
  }): number {
    // Pondération des critères
    const weights = {
      businessNeed: 0.35,    // 35% - Le plus important
      urgency: 0.25,         // 25% - Urgence commerciale
      seriousness: 0.20,     // 20% - Sérieux de la démarche
      budget: 0.15,          // 15% - Capacité d'investissement
      experience: 0.05       // 5% - Expérience précédente
    }
    
    return Math.round(
      scores.businessNeed * weights.businessNeed +
      scores.urgency * weights.urgency +
      scores.seriousness * weights.seriousness +
      scores.budget * weights.budget +
      scores.experience * weights.experience
    )
  }

  private calculateGrade(globalScore: number): 'A+' | 'A' | 'B' | 'C' | 'D' {
    if (globalScore >= 90) return 'A+'
    if (globalScore >= 80) return 'A'
    if (globalScore >= 70) return 'B'
    if (globalScore >= 60) return 'C'
    return 'D'
  }

  private calculatePriority(globalScore: number, urgencyScore: number): 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' {
    if (globalScore >= 85 && urgencyScore >= 70) return 'URGENT'
    if (globalScore >= 75) return 'HIGH'
    if (globalScore >= 60) return 'MEDIUM'
    return 'LOW'
  }

  private calculateCallbackDelay(priority: string, urgencyScore: number): string {
    switch (priority) {
      case 'URGENT':
        return urgencyScore >= 80 ? 'Immédiat' : 'Dans les 2 heures'
      case 'HIGH':
        return 'Dans les 24 heures'
      case 'MEDIUM':
        return 'Dans les 2-3 jours'
      case 'LOW':
        return 'Dans la semaine'
      default:
        return 'À évaluer'
    }
  }

  private generateApproach(globalScore: number, businessNeedScore: number): string {
    if (globalScore >= 85) {
      return 'Appel direct avec proposition de créneau dans la journée. Prospect très qualifié, besoin clair et urgent.'
    }
    
    if (globalScore >= 75) {
      return 'Appel de qualification avec proposition de rendez-vous rapide. Bon prospect avec besoin identifié.'
    }
    
    if (globalScore >= 60) {
      return 'Appel de qualification pour clarifier le besoin avant proposition. Prospect à développer.'
    }
    
    if (businessNeedScore < 40) {
      return 'Email de qualification préalable pour mieux comprendre le besoin avant appel.'
    }
    
    return 'Évaluer la pertinence avant tout contact. Prospect à faible potentiel.'
  }

  // Méthodes d'analyse détaillée pour l'email avec extraction
  private analyzeBusinessNeedWithExtraction(responses: QuestionnaireResponse[], extraction: BusinessExtractionResult): string {
    const step1 = responses.find(r => r.stepId === 1)?.answer || ''
    const step2 = responses.find(r => r.stepId === 2)?.answer || ''
    
    if ((extraction.qualityScore as number) > 0.8) {
      return `Besoin professionnel clairement exprimé avec extraction de haute qualité (score: ${Math.round((extraction.qualityScore as number) * 100)}%)`
    }
    
    if (step1.length < 20) {
      return 'Besoin exprimé de manière très succincte, nécessite clarification'
    }
    
    const businessMatches = this.businessKeywords.filter(keyword => 
      `${step1} ${step2}`.toLowerCase().includes(keyword)
    ).length
    
    if (businessMatches >= 5) {
      return 'Besoin professionnel clairement exprimé avec vocabulaire approprié'
    } else if (businessMatches >= 2) {
      return 'Besoin professionnel identifié mais manque de précision'
    } else {
      return 'Besoin flou ou non-professionnel, nécessite requalification'
    }
  }

  private analyzeUrgency(responses: QuestionnaireResponse[]): string {
    const step3 = responses.find(r => r.stepId === 3)?.answer || ''
    const step4 = responses.find(r => r.stepId === 4)?.answer || ''
    
    if (step3.toLowerCase().includes('oui') && step4.includes('plus brefs délais')) {
      return 'Besoin urgent avec demande de démarrage immédiat'
    } else if (step3.toLowerCase().includes('oui')) {
      return 'Besoin déclaré urgent mais délai de démarrage flexible'
    } else if (step4.includes('dans la semaine')) {
      return 'Pas urgent mais disponible rapidement'
    } else {
      return 'Pas d\'urgence déclarée, projet à moyen terme'
    }
  }

  private analyzeBudget(responses: QuestionnaireResponse[]): string {
    const step6 = responses.find(r => r.stepId === 6)?.answer || ''
    
    if (step6.includes('+de 15h')) {
      return 'Excellent indicateur budgétaire, prêt à investir significativement'
    } else if (step6.includes('15h')) {
      return 'Bon indicateur budgétaire, investissement sérieux envisagé'
    } else if (step6.includes('6h')) {
      return 'Indicateur budgétaire moyen, investissement modéré'
    } else if (step6.includes('3h')) {
      return 'Indicateur budgétaire faible, budget limité probable'
    } else {
      return 'Indicateur budgétaire non déterminé'
    }
  }

  private analyzeExperience(responses: QuestionnaireResponse[]): string {
    const step5 = responses.find(r => r.stepId === 5)?.answer || ''
    
    if (step5.toLowerCase().includes('oui')) {
      return 'Expérience coaching précédente, connaît la valeur de l\'accompagnement'
    } else if (step5.toLowerCase().includes('non')) {
      return 'Pas d\'expérience coaching, potentiel d\'amélioration élevé'
    } else {
      return 'Expérience coaching non précisée'
    }
  }

  private analyzeSeriousness(responses: QuestionnaireResponse[], aiMetadata?: {
    warningsReceived: number
    closedByAI: boolean
    [key: string]: unknown
  }, extraction?: BusinessExtractionResult): string {
    if (aiMetadata?.closedByAI) {
      return `Conversation fermée par IA - Comportement non professionnel (${aiMetadata.warningsReceived} avertissements)`
    }
    
    if (aiMetadata?.warningsReceived && typeof aiMetadata.warningsReceived === 'number' && aiMetadata.warningsReceived > 0) {
      return `Quelques écarts détectés (${aiMetadata.warningsReceived} avertissements) mais conversation menée à terme`
    }
    
    if (extraction && (extraction.qualityScore as number) > 0.8) {
      return `Démarche très sérieuse avec extraction de haute qualité (score: ${Math.round((extraction.qualityScore as number) * 100)}%)`
    }
    
    const step1 = responses.find(r => r.stepId === 1)?.answer || ''
    const step2 = responses.find(r => r.stepId === 2)?.answer || ''
    const combinedLength = `${step1} ${step2}`.length
    
    if (combinedLength > 200) {
      return 'Démarche très sérieuse, réponses détaillées et professionnelles'
    } else if (combinedLength > 100) {
      return 'Démarche sérieuse, réponses appropriées'
    } else {
      return 'Démarche correcte mais réponses succinctes'
    }
  }

  private generateOverallRecommendation(globalScore: number, grade: string, priority: string): string {
    if (globalScore >= 90) {
      return `Prospect EXCEPTIONNEL (${grade}) - Priorité ${priority}. Appel immédiat recommandé avec proposition de créneau dans la journée. Toutes les conditions sont réunies pour un succès commercial.`
    }
    
    if (globalScore >= 80) {
      return `Très bon prospect (${grade}) - Priorité ${priority}. Contact dans les 24h avec proposition de rendez-vous rapide. Besoin identifié et sérieux de la démarche confirmés.`
    }
    
    if (globalScore >= 70) {
      return `Bon prospect (${grade}) - Priorité ${priority}. Contact sous 2-3 jours avec approche consultative. Qualification supplémentaire recommandée avant proposition.`
    }
    
    if (globalScore >= 60) {
      return `Prospect moyen (${grade}) - Priorité ${priority}. Contact sous une semaine avec email de qualification préalable. Besoin à clarifier avant investissement temps.`
    }
    
    return `Prospect faible (${grade}) - Priorité ${priority}. Évaluer la pertinence avant tout contact. Peut nécessiter une approche éducative ou être décliné.`
  }
}

// Export singleton
export const enhancedProspectQualificationService = new EnhancedProspectQualificationService()