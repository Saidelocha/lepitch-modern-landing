import { z } from 'zod'
import { CollectedInfo } from '../chat'
import { getEnhancedEncryptionService } from '../security'
import { EnhancedBusinessExtractor } from './enhanced-business-extractor'
import { logger } from '@/lib/logger'

// Schema de validation pour les données du formulaire
export const surveySchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  contactMethod: z.enum(['email', 'telephone'], {
    message: 'Veuillez choisir un moyen de contact'
  }),
  contact: z.string().min(1, 'Ce champ est requis'),
  urgency: z.enum(['urgent', 'non-urgent'], {
    message: 'Veuillez indiquer le niveau d\'urgence'
  }),
  timeline: z.enum(['immédiat', 'semaine', 'mois', 'flexible'], {
    message: 'Veuillez indiquer votre timeline'
  }),
  commitment: z.enum(['3h', '6h', '15h', '15h+'], {
    message: 'Veuillez indiquer votre engagement temps'
  })
})

export type SurveyData = z.infer<typeof surveySchema>

// Interface pour les données stockées
interface StoredSurveyData {
  data: SurveyData
  timestamp: Date
  conversationContext: string
  analysis?: {
    qualityScore: number
    extractedInfo?: Record<string, unknown>
    completeness: number
    confidenceScores?: Record<string, number>
    [key: string]: unknown
  } // Résultat de l'analyse business
}

// Stockage temporaire des données de formulaire (en mémoire pour ce MVP)
// En production, utiliser Redis ou une base de données
const surveyDataStorage = new Map<string, StoredSurveyData>()

/**
 * Enhanced Survey Handler - Integrates with modular business extraction
 */
export class EnhancedSurveyHandler {
  /**
   * Sauvegarde les données du formulaire avec analyse business intégrée
   */
  static async saveSurveyData(
    sessionId: string, 
    data: SurveyData, 
    conversationContext: string = ''
  ): Promise<{ success: boolean; error?: string; analysis?: {
    qualityScore: number
    extractedInfo?: Record<string, unknown>
    completeness: number
    confidenceScores?: Record<string, number>
    [key: string]: unknown
  } }> {
    try {
      // Validation des données
      const validatedData = surveySchema.parse(data)
      
      // Analyse business du contexte conversationnel
      const businessAnalysis = conversationContext 
        ? EnhancedBusinessExtractor.extractBusinessInfo(conversationContext)
        : null
      
      // Chiffrement des données personnelles avec le service amélioré
      const encryptedContact = getEnhancedEncryptionService().encrypt(validatedData.contact)
      
      // Stockage sécurisé avec analyse
      surveyDataStorage.set(sessionId, {
        data: {
          ...validatedData,
          contact: encryptedContact
        },
        timestamp: new Date(),
        conversationContext,
        analysis: businessAnalysis as any || { qualityScore: 0, completeness: 0 }
      })
      
      logger.survey('Enhanced survey data saved', { sessionId }, {
        hasBusinessAnalysis: !!businessAnalysis,
        analysisQuality: businessAnalysis?.qualityScore || 0,
        dataFields: Object.keys(validatedData)
      })
      
      return { 
        success: true, 
        analysis: businessAnalysis as any
      }
    } catch (error) {
      logger.error('Error saving enhanced survey data', { sessionId }, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        hasData: !!data,
        hasEncryptionKey: !!process.env['CHAT_ENCRYPTION_KEY'],
        encryptionKeyLength: process.env['CHAT_ENCRYPTION_KEY']?.length || 0
      })
      
      if (error instanceof z.ZodError) {
        logger.error('Zod validation errors', { sessionId }, { issues: error.issues })
        return { 
          success: false, 
          error: 'Validation échouée: ' + error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        }
      }
      
      // Erreur spécifique pour les problèmes de chiffrement
      if (error instanceof Error && error.message.includes('encryption')) {
        logger.error('Encryption error detected', { sessionId }, { errorMessage: error.message })
        return {
          success: false,
          error: 'Erreur de chiffrement: ' + error.message
        }
      }
      
      return { 
        success: false, 
        error: 'Erreur de sauvegarde: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
      }
    }
  }

  /**
   * Récupère et déchiffre les données du formulaire avec analyse
   */
  static async getSurveyData(sessionId: string): Promise<{
    success: boolean
    data?: SurveyData & { 
      conversationContext?: string
      analysis?: {
        qualityScore: number
        extractedInfo?: Record<string, unknown>
        completeness: number
        confidenceScores?: Record<string, number>
        [key: string]: unknown
      }
    }
    error?: string
  }> {
    try {
      const storedData = surveyDataStorage.get(sessionId)
      
      if (!storedData) {
        return { success: false, error: 'Aucune donnée trouvée pour cette session' }
      }
      
      // Déchiffrement des données personnelles
      const decryptedContact = getEnhancedEncryptionService().decrypt(storedData.data.contact)
      
      return {
        success: true,
        data: {
          ...storedData.data,
          contact: decryptedContact,
          conversationContext: storedData.conversationContext,
          analysis: storedData.analysis
        } as any
      }
    } catch (error) {
      logger.error('Error getting enhanced survey data', { sessionId }, { 
        error: error instanceof Error ? error.message : String(error) 
      })
      return { 
        success: false, 
        error: 'Erreur lors de la récupération des données'
      }
    }
  }

  /**
   * Supprime les données du formulaire après traitement
   */
  static async clearSurveyData(sessionId: string): Promise<void> {
    surveyDataStorage.delete(sessionId)
    logger.survey('Enhanced survey data cleared', { sessionId })
  }

  /**
   * Vérifie si les données du formulaire existent pour une session
   */
  static hasSurveyData(sessionId: string): boolean {
    return surveyDataStorage.has(sessionId)
  }

  /**
   * Convertit les données du formulaire au format CollectedInfo avec analyse business
   */
  static surveyToCollectedInfo(
    data: SurveyData, 
    conversationContext?: string,
    businessAnalysis?: {
      qualityScore: number
      extractedInfo?: Record<string, unknown>
      completeness: number
      confidenceScores?: Record<string, number>
      [key: string]: unknown
    }
  ): CollectedInfo {
    const baseInfo: CollectedInfo = {
      name: data.nom,
      contactPreference: data.contactMethod,
      contactInfo: data.contact,
      urgency: data.urgency === 'urgent',
      timeline: data.timeline,
      commitment: data.commitment,
      problematique: conversationContext || 'Collecté via formulaire intégré'
    }

    // Enrichir avec l'analyse business si disponible
    if (businessAnalysis?.extractedInfo) {
      return {
        ...baseInfo,
        ...businessAnalysis.extractedInfo,
        // Garder les données du formulaire comme prioritaires
        name: baseInfo.name,
        contactPreference: baseInfo.contactPreference,
        contactInfo: baseInfo.contactInfo
      } as any
    }

    return baseInfo
  }

  /**
   * Génère un résumé de qualification enrichi avec l'analyse business
   */
  static generateEnhancedQualificationSummary(
    data: SurveyData, 
    conversationContext?: string,
    businessAnalysis?: {
      qualityScore: number
      extractedInfo?: Record<string, unknown>
      completeness: number
      confidenceScores?: Record<string, number>
      [key: string]: unknown
    }
  ): {
    grade: string
    score: number
    factors: Record<string, string>
    recommendation: string
    reasoning: string
    businessInsights?: {
      qualityScore: number
      extractedTerms: string[]
      confidenceScores: Record<string, number>
    }
  } {
    // Calcul du score de base basé sur les données du formulaire
    let score = 60 // Score de base
    
    // Facteur urgence
    if (data.urgency === 'urgent') {
      score += 15
    }
    
    // Facteur timeline
    if (data.timeline === 'immédiat') {
      score += 15
    } else if (data.timeline === 'semaine') {
      score += 10
    } else if (data.timeline === 'mois') {
      score += 5
    }
    
    // Facteur engagement temps
    if (data.commitment === '15h+') {
      score += 15
    } else if (data.commitment === '15h') {
      score += 10
    } else if (data.commitment === '6h') {
      score += 5
    }
    
    // Bonus business analysis
    let businessInsights
    if (businessAnalysis) {
      businessInsights = {
        qualityScore: businessAnalysis.qualityScore,
        extractedTerms: Object.keys(businessAnalysis.confidenceScores || {}),
        confidenceScores: businessAnalysis.confidenceScores || {}
      }

      // Bonus pour qualité de l'analyse business
      if (businessAnalysis.qualityScore > 0.8) {
        score += 10
      } else if (businessAnalysis.qualityScore > 0.6) {
        score += 5
      }

      // Bonus pour complétude de l'extraction
      if (businessAnalysis.completeness > 0.7) {
        score += 5
      }
    }
    
    // Bonus si conversation riche
    if (conversationContext && conversationContext.length > 100) {
      score += 5
    }
    
    // Détermination du grade
    let grade = 'C'
    if (score >= 90) grade = 'A+'
    else if (score >= 85) grade = 'A'
    else if (score >= 75) grade = 'B'
    else if (score >= 65) grade = 'C'
    else grade = 'D'
    
    const result: any = {
      grade,
      score,
      factors: {
        urgency: data.urgency === 'urgent' ? 'Urgent' : 'Planifiable',
        timeline: data.timeline,
        engagement: data.commitment,
        clarity: conversationContext && conversationContext.length > 50 ? 'Détaillée' : 'Standard',
        businessQuality: businessAnalysis ? 
          (businessAnalysis.qualityScore > 0.7 ? 'Excellente' : 
           businessAnalysis.qualityScore > 0.5 ? 'Bonne' : 'Basique') : 'Non analysée'
      },
      recommendation: grade === 'A+' || grade === 'A' ? 'Contact prioritaire immédiat' :
                     grade === 'B' ? 'Contact dans les 24-48h' :
                     'Contact sous 3-5 jours',
      reasoning: `Prospect qualifié via formulaire intégré avec analyse business - ${data.urgency}, timeline: ${data.timeline}, engagement: ${data.commitment}${businessAnalysis ? `, qualité business: ${Math.round(businessAnalysis.qualityScore * 100)}%` : ''}`
    }

    if (businessInsights) {
      result.businessInsights = businessInsights
    }

    return result
  }

  /**
   * Validation et sanitisation côté serveur avec analyse business
   */
  static validateAndSanitize(rawData: Record<string, unknown>): { 
    success: boolean
    data?: SurveyData
    error?: string 
  } {
    try {
      // Sanitisation de base
      const sanitizedData = {
        nom: String(rawData['nom'] || '').trim().substring(0, 100),
        contactMethod: rawData['contactMethod'],
        contact: String(rawData['contact'] || '').trim().substring(0, 255),
        urgency: rawData['urgency'],
        timeline: rawData['timeline'],
        commitment: rawData['commitment']
      }
      
      // Validation avec Zod
      const validatedData = surveySchema.parse(sanitizedData)
      
      // Validation supplémentaire pour l'email
      if (validatedData.contactMethod === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const isValidEmail = emailRegex.test(validatedData.contact)
        logger.survey('Email validation check', {}, {
          contactMethod: 'email',
          isValid: isValidEmail,
          emailLength: validatedData.contact.length
        })
        if (!isValidEmail) {
          return { success: false, error: `Format d'email invalide: "${validatedData.contact}"` }
        }
      }
      
      // Validation supplémentaire pour le téléphone
      if (validatedData.contactMethod === 'telephone') {
        const phoneRegex = /^[\d\s\+\-\(\)\.]{10,}$/
        const isValidPhone = phoneRegex.test(validatedData.contact)
        logger.survey('Phone validation check', {}, {
          contactMethod: 'telephone',
          isValid: isValidPhone,
          phoneLength: validatedData.contact.length
        })
        if (!isValidPhone) {
          return { success: false, error: `Format de téléphone invalide: "${validatedData.contact}"` }
        }
      }
      
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const detailedErrors = error.issues.map((e: any) => {
          const field = e.path?.join?.('.') || 'unknown'
          return `${field}: ${e.message}`
        })
        
        logger.survey('Zod validation errors', {}, {
          issues: error.issues,
          formattedErrors: detailedErrors,
          hasReceivedData: !!rawData
        })
        
        return { 
          success: false, 
          error: `Erreurs de validation: ${detailedErrors.join('; ')}`
        }
      }
      
      logger.error('Survey validation - unexpected error', {}, {
        error: error instanceof Error ? error.message : 'Unknown error',
        hasReceivedData: !!rawData
      })
      
      return { success: false, error: 'Données invalides - format incorrect' }
    }
  }

  /**
   * Nettoie les données expirées (appel périodique recommandé)
   */
  static cleanupExpiredData(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000))
    
    surveyDataStorage.forEach((storedData, sessionId) => {
      if (storedData.timestamp < cutoffTime) {
        surveyDataStorage.delete(sessionId)
        logger.survey('Cleaned up expired survey data', { sessionId }, {
          maxAgeHours,
          expiredTime: storedData.timestamp.toISOString()
        })
      }
    })
  }

  /**
   * Statistiques sur les formulaires soumis avec insights business
   */
  static getEnhancedStats(): {
    totalSubmissions: number
    submissionsByUrgency: Record<string, number>
    submissionsByTimeline: Record<string, number>
    submissionsByCommitment: Record<string, number>
    businessAnalysisStats: {
      withAnalysis: number
      averageQualityScore: number
      topExtractedTerms: Array<{ term: string; count: number }>
    }
  } {
    const stats = {
      totalSubmissions: surveyDataStorage.size,
      submissionsByUrgency: { urgent: 0, 'non-urgent': 0 },
      submissionsByTimeline: { 'immédiat': 0, 'semaine': 0, 'mois': 0, 'flexible': 0 },
      submissionsByCommitment: { '3h': 0, '6h': 0, '15h': 0, '15h+': 0 },
      businessAnalysisStats: {
        withAnalysis: 0,
        averageQualityScore: 0,
        topExtractedTerms: [] as Array<{ term: string; count: number }>
      }
    }
    
    let totalQualityScore = 0
    const termCounts = new Map<string, number>()
    
    surveyDataStorage.forEach((storedData) => {
      const data = storedData.data
      stats.submissionsByUrgency[data.urgency as keyof typeof stats.submissionsByUrgency]++
      stats.submissionsByTimeline[data.timeline as keyof typeof stats.submissionsByTimeline]++
      stats.submissionsByCommitment[data.commitment as keyof typeof stats.submissionsByCommitment]++
      
      // Stats d'analyse business
      if (storedData.analysis) {
        stats.businessAnalysisStats.withAnalysis++
        totalQualityScore += storedData.analysis.qualityScore || 0
        
        // Compter les termes extraits
        if (storedData.analysis.extractedInfo) {
          Object.keys(storedData.analysis.confidenceScores || {}).forEach(term => {
            termCounts.set(term, (termCounts.get(term) || 0) + 1)
          })
        }
      }
    })
    
    // Calculer la moyenne de qualité
    if (stats.businessAnalysisStats.withAnalysis > 0) {
      stats.businessAnalysisStats.averageQualityScore = totalQualityScore / stats.businessAnalysisStats.withAnalysis
    }
    
    // Top termes extraits
    stats.businessAnalysisStats.topExtractedTerms = Array.from(termCounts.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    return stats
  }

  // Méthodes de compatibilité avec l'ancien SurveyHandler
  static generateQualificationSummary = EnhancedSurveyHandler.generateEnhancedQualificationSummary
  static getStats = EnhancedSurveyHandler.getEnhancedStats
}

// Export singleton pour compatibilité
export const enhancedSurveyHandler = new EnhancedSurveyHandler()

// Export des types et du schema pour utilisation externe
export type { StoredSurveyData }