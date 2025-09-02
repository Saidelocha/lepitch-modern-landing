import { Resend } from 'resend'
import { ProspectQualification } from './business'
import { logger } from '@/lib/logger'

interface UserInfo {
  nom?: string
  prenom?: string
  telephone?: string
  email?: string
  problematique?: string
}

interface AIMetadata {
  warningsReceived: number
  closedByAI: boolean
  seriousnessScore: 'high' | 'medium' | 'low'
  lastWarningReason?: string
}

interface EmailChatSession {
  id: string
  messages: Array<{ text: string; isBot: boolean; timestamp?: Date }> // Typed for better compatibility
  userInfo: UserInfo
  stage: string
  aiMetadata?: AIMetadata
  qualification?: ProspectQualification // Nouvelle section qualification
}

interface LeadNotificationData {
  session: EmailChatSession
  completedAt: Date
}

export const sendLeadNotification = async (data: LeadNotificationData) => {
  logger.email('sendLeadNotification called', { sessionId: data.session.id }, {
    prospectName: data.session.userInfo.nom,
    hasQualification: !!data.session.qualification,
    messagesCount: data.session.messages.length,
    stage: data.session.stage,
    hasAIMetadata: !!data.session.aiMetadata
  })

  if (!process.env['RESEND_API_KEY']) {
    logger.warn('RESEND_API_KEY not configured - email notification skipped', { sessionId: data.session.id })
    return { success: false, error: 'Email service not configured' }
  }

  if (!process.env['LEAD_NOTIFICATION_EMAIL']) {
    logger.warn('LEAD_NOTIFICATION_EMAIL not configured - email notification skipped', { sessionId: data.session.id })
    return { success: false, error: 'Destination email not configured' }
  }

  logger.email('Email configuration validated, creating Resend client', { sessionId: data.session.id })
  const resend = new Resend(process.env['RESEND_API_KEY'])

  const { session, completedAt } = data
  const { userInfo, messages, aiMetadata, qualification } = session

  // Format conversation history with better context
  const conversationHistory = messages.length > 0
    ? messages
        .filter(msg => msg.text && msg.text.trim().length > 0) // Filter empty messages
        .map((msg) => {
          const timestamp = new Date(msg.timestamp || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          const role = msg.isBot ? '🤖 Assistante de Léo' : '👤 Prospect'
          return `[${timestamp}] ${role}: ${msg.text}`
        })
        .join('\n\n')
    : 'Formulaire complété directement sans conversation préalable'

  // Calculate conversation duration (handle empty messages for new questionnaire format)
  const duration = messages.length > 1
    ? Math.round(((messages[messages.length - 1]?.timestamp || new Date()).getTime() - (messages[0]?.timestamp || new Date()).getTime()) / 60000)
    : 5 // Default 5 minutes for questionnaire

  // Generate quality indicators from qualification system
  const qualityIndicator = qualification ? {
    score: qualification.grade,
    color: qualification.grade === 'A+' || qualification.grade === 'A' ? '#059669' : 
           qualification.grade === 'B' ? '#d97706' : '#dc2626',
    emoji: qualification.grade === 'A+' ? '🟢' : 
           qualification.grade === 'A' ? '🟢' : 
           qualification.grade === 'B' ? '🟡' : '🔴',
    text: qualification.grade === 'A+' ? 'EXCEPTIONNEL' : 
          qualification.grade === 'A' ? 'EXCELLENT' : 
          qualification.grade === 'B' ? 'BON' : 
          qualification.grade === 'C' ? 'MOYEN' : 'FAIBLE',
    priority: qualification.priority,
    callbackDelay: qualification.callbackDelay,
    globalScore: qualification.globalScore
  } : { score: 'A', color: '#059669', emoji: '🟢', text: 'EXCELLENT', priority: 'HIGH', callbackDelay: 'Dans les 24 heures', globalScore: 85 }

  const aiWarnings = aiMetadata?.warningsReceived || 0
  const closedByAI = aiMetadata?.closedByAI || false

  try {
    logger.email('About to send email with Resend API', { sessionId: session.id }, {
      from: 'Le Pitch Qu\'il Vous Faut <notifications@lepitchquilvousfaut.fr>',
      to: process.env['LEAD_NOTIFICATION_EMAIL']!,
      emailType: closedByAI ? 'Lead Fermé par IA' : 'Nouveau Lead Chat',
      prospectName: userInfo.nom || 'Prospect',
      qualityText: qualityIndicator.text,
      qualityScore: qualityIndicator.score,
      resendClientReady: !!resend
    })
    
    const result = await resend.emails.send({
      from: 'Le Pitch Qu\'il Vous Faut <notifications@lepitchquilvousfaut.fr>',
      to: process.env['LEAD_NOTIFICATION_EMAIL']!,
      subject: `${qualityIndicator.emoji} ${closedByAI ? 'Lead Fermé par IA' : 'Nouveau Lead Chat'}: ${userInfo.nom || 'Prospect'} - ${qualityIndicator.text} (${qualityIndicator.score})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, ${closedByAI ? '#dc2626, #991b1b' : '#4f46e5, #7c3aed'}); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${closedByAI ? '🚫 Lead Fermé par IA' : '🎯 Nouveau Lead Chat'}</h1>
            <p style="color: ${closedByAI ? '#fecaca' : '#e0e7ff'}; margin: 10px 0 0 0;">${closedByAI ? 'Conversation interrompue automatiquement' : 'Conversation complétée avec succès'}</p>
          </div>

          ${!closedByAI ? `
          <!-- Indicateur de Qualité IA -->
          <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 20px; border-left: 6px solid ${qualityIndicator.color};">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
              <span style="font-size: 24px; margin-right: 10px;">${qualityIndicator.emoji}</span>
              <h2 style="color: ${qualityIndicator.color}; margin: 0; font-size: 20px;">QUALITÉ PROSPECT: ${qualityIndicator.text}</h2>
            </div>
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 5px 0;">🤖 Analyse automatique par IA</p>
              ${aiWarnings > 0 ? `<p style="margin: 5px 0; color: #f59e0b;">⚠️ ${aiWarnings} avertissement(s) reçu(s)</p>` : ''}
              ${aiMetadata?.lastWarningReason ? `<p style="margin: 5px 0; color: #6b7280; font-style: italic;">Dernier avertissement: ${aiMetadata.lastWarningReason}</p>` : ''}
            </div>
          </div>` : ''}

          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">📋 Informations du Prospect</h2>
            
            <div style="margin: 20px 0;">
              <p style="margin: 8px 0;"><strong style="color: #4f46e5;">👤 Nom:</strong> ${userInfo.nom || 'Non renseigné'}</p>
              <p style="margin: 8px 0;"><strong style="color: #4f46e5;">📞 Téléphone:</strong> <a href="tel:${userInfo.telephone}" style="color: #059669; text-decoration: none;">${userInfo.telephone || 'Non renseigné'}</a></p>
              <p style="margin: 8px 0;"><strong style="color: #4f46e5;">📅 Date:</strong> ${completedAt.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p style="margin: 8px 0;"><strong style="color: #4f46e5;">⏱️ Durée conversation:</strong> ${duration} minutes</p>
              ${!closedByAI ? `<p style="margin: 8px 0;"><strong style="color: #4f46e5;">🤖 Score IA:</strong> <span style="color: ${qualityIndicator.color}; font-weight: bold;">${qualityIndicator.text}</span></p>` : ''}
            </div>

            ${!closedByAI ? `
            <h3 style="color: #1f2937; margin: 30px 0 15px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">🎯 Problématique & Besoins</h3>
            <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; border-radius: 4px;">
              <p style="margin: 0; line-height: 1.6; color: #374151;">${userInfo.problematique || 'Non spécifiée'}</p>
              ${qualification && typeof qualification === 'object' && qualification !== null && 'factors' in qualification ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                  <h4 style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">🔍 Analyse détaillée :</h4>
                  ${(qualification as { factors: { urgency?: string } }).factors.urgency ? `<p style="margin: 5px 0; font-size: 14px; color: #374151;"><strong>Urgence:</strong> ${(qualification as { factors: { urgency: string } }).factors.urgency}</p>` : ''}
                  ${(qualification as { factors: { timeline?: string } }).factors.timeline ? `<p style="margin: 5px 0; font-size: 14px; color: #374151;"><strong>Timeline:</strong> ${(qualification as { factors: { timeline: string } }).factors.timeline}</p>` : ''}
                  ${(qualification as { factors: { engagement?: string } }).factors.engagement ? `<p style="margin: 5px 0; font-size: 14px; color: #374151;"><strong>Engagement:</strong> ${(qualification as { factors: { engagement: string } }).factors.engagement}</p>` : ''}
                  ${(qualification as { factors: { clarity?: string } }).factors.clarity ? `<p style="margin: 5px 0; font-size: 14px; color: #374151;"><strong>Clarté du besoin:</strong> ${(qualification as { factors: { clarity: string } }).factors.clarity}</p>` : ''}
                </div>
              ` : ''}
            </div>` : `
            <h3 style="color: #dc2626; margin: 30px 0 15px 0; border-bottom: 1px solid #fca5a5; padding-bottom: 5px;">🚫 Raison de la Fermeture</h3>
            <div style="background: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; border-radius: 4px;">
              <p style="margin: 0; line-height: 1.6; color: #991b1b;">Conversation fermée automatiquement par l'IA - Prospect non qualifié ou comportement inapproprié</p>
              ${aiMetadata?.lastWarningReason ? `<p style="margin: 10px 0 0 0; line-height: 1.6; color: #991b1b; font-style: italic;">Dernier motif: ${aiMetadata.lastWarningReason}</p>` : ''}
            </div>`}
          </div>

          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">💬 Historique de la Conversation</h2>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; font-size: 14px; line-height: 1.6; max-height: 400px; overflow-y: auto; border: 1px solid #e5e7eb;">
              ${messages.length > 0 ? `
                <div style="color: #6b7280; font-size: 12px; margin-bottom: 15px; text-align: center; font-style: italic;">
                  Conversation de ${duration} minutes • ${messages.filter(msg => !msg.isBot).length} message(s) du prospect
                </div>
                <div style="white-space: pre-line; font-family: system-ui, -apple-system, sans-serif;">
${conversationHistory}
                </div>
              ` : `
                <div style="text-align: center; color: #6b7280; font-style: italic; padding: 20px;">
                  ${conversationHistory}
                </div>
              `}
            </div>
          </div>

          ${!closedByAI ? `
          <div style="background: linear-gradient(135deg, ${qualityIndicator.color}, ${qualityIndicator.color === '#059669' ? '#047857' : qualityIndicator.color === '#d97706' ? '#c2410c' : '#b91c1c'}); padding: 25px; border-radius: 12px; text-align: center;">
            <h3 style="color: white; margin: 0 0 10px 0;">🚀 Actions Recommandées</h3>
            <p style="color: ${qualityIndicator.color === '#059669' ? '#d1fae5' : qualityIndicator.color === '#d97706' ? '#fed7aa' : '#fecaca'}; margin: 0 0 15px 0;">
              ${qualityIndicator.score === 'high' ? 'PRIORITÉ HAUTE - Rappeler dans les 24h' : 
                qualityIndicator.score === 'medium' ? 'PRIORITÉ MOYENNE - Rappeler dans les 2-3 jours' : 
                'PRIORITÉ FAIBLE - Évaluer la pertinence avant rappel'}
            </p>
            <a href="tel:${userInfo.telephone}" style="display: inline-block; background: white; color: ${qualityIndicator.color}; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 5px;">📞 Appeler Maintenant</a>
          </div>` : `
          <div style="background: linear-gradient(135deg, #6b7280, #4b5563); padding: 25px; border-radius: 12px; text-align: center;">
            <h3 style="color: white; margin: 0 0 10px 0;">ℹ️ Informations</h3>
            <p style="color: #d1d5db; margin: 0 0 15px 0;">Ce prospect a été automatiquement éliminé par l'IA. Aucun rappel nécessaire.</p>
            <div style="display: inline-block; background: #374151; color: white; padding: 12px 24px; border-radius: 8px; font-weight: bold;">🤖 Traité par IA</div>
          </div>`}

          <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px;">
            <p>Email généré automatiquement par Le Pitch Qu'il Vous Faut</p>
            <p>Session ID: ${session.id}</p>
          </div>
        </div>
      `,
      // Version texte pour les clients email qui ne supportent pas HTML
      text: `
${closedByAI ? '🚫 LEAD FERMÉ PAR IA' : '🎯 NOUVEAU LEAD CHAT'}

📋 INFORMATIONS:
- Nom: ${userInfo.nom || 'Non renseigné'}
- Téléphone: ${userInfo.telephone || 'Non renseigné'}
${userInfo.email ? `- Email: ${userInfo.email}` : ''}
- Date: ${completedAt.toLocaleDateString('fr-FR')}
- Durée: ${duration} minutes
${!closedByAI ? `- Qualité: ${qualityIndicator.text} (${qualityIndicator.score})` : ''}
${!closedByAI && qualification ? `- Score Global: ${qualityIndicator.globalScore}/100` : ''}
${!closedByAI && qualification ? `- Priorité: ${qualityIndicator.priority}` : ''}
${!closedByAI && qualification ? `- Rappel: ${qualityIndicator.callbackDelay}` : ''}
${aiWarnings > 0 ? `- Avertissements: ${aiWarnings}` : ''}

${!closedByAI ? `🎯 PROBLÉMATIQUE:
${userInfo.problematique || 'Non spécifiée'}

${qualification ? `📈 ANALYSE QUALIFICATION:
- Besoin Business: ${qualification.businessNeedScore}/100
- Urgence: ${qualification.urgencyScore}/100
- Budget: ${qualification.budgetIndicator}/100
- Sérieux: ${qualification.seriousnessScore}/100

📝 RECOMMANDATION:
${qualification.details.overallRecommendation}` : ''}` : `🚫 RAISON DE FERMETURE:
Conversation fermée automatiquement par l'IA - Prospect non qualifié
${aiMetadata?.lastWarningReason ? `Dernier motif: ${aiMetadata.lastWarningReason}` : ''}`}

💬 CONVERSATION:
${conversationHistory}

${!closedByAI && qualification ? `🚀 ACTION: ${qualification.approach}` : 
  !closedByAI ? `🚀 ACTION: PRIORITÉ ${qualityIndicator.priority} - ${qualityIndicator.callbackDelay}` : 
  'ℹ️ AUCUNE ACTION REQUISE - Prospect éliminé automatiquement'}

Session ID: ${session.id}
      `
    })

    logger.email('Lead notification email sent successfully', { sessionId: session.id }, {
      messageId: result.data?.id,
      prospectName: userInfo.nom,
      emailDestination: process.env['LEAD_NOTIFICATION_EMAIL'],
      wasClosedByAI: closedByAI,
      qualityGrade: qualityIndicator.score
    })
    return { success: true, messageId: result.data?.id }

  } catch (error) {
    logger.error('Failed to send lead notification email', { sessionId: session.id }, {
      error: error instanceof Error ? error.message : 'Unknown error',
      prospectName: userInfo.nom,
      wasClosedByAI: closedByAI
    })
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}