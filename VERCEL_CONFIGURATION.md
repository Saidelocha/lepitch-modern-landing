# Configuration Vercel - Variables d'Environnement

## Variables d'Environnement Requises

Votre application nécessite les variables d'environnement suivantes sur Vercel :

### 1. CHAT_MASTER_SECRET (OBLIGATOIRE)
**Description** : Clé de chiffrement principale pour sécuriser les données du chat
**Valeur générée** : `7827cb1e0dd4643a50589db4ee5af9221c8531200f6af1475825eb0ab041efec`
**Format** : Minimum 32 caractères, idéalement 64 caractères hexadécimaux
**Criticité** : CRITIQUE - L'application ne démarrera pas sans cette variable en production

### 2. CHAT_ENCRYPTION_KEY
**Description** : Clé de chiffrement secondaire pour les données sensibles
**Format** : 64 caractères alphanumériques
**Exemple** : Générer avec : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. RESEND_API_KEY (Optionnel)
**Description** : Clé API pour l'envoi d'emails via Resend
**Obtenir** : https://resend.com/api-keys

### 4. OPENROUTER_API_KEY (Optionnel)
**Description** : Clé API pour l'IA du chatbot
**Obtenir** : https://openrouter.ai/keys

## Comment Configurer sur Vercel

1. **Aller dans les Settings du projet Vercel**
   - https://vercel.com/dashboard
   - Sélectionner votre projet
   - Aller dans "Settings" → "Environment Variables"

2. **Ajouter les variables**
   - Cliquer sur "Add New"
   - Nom : `CHAT_MASTER_SECRET`
   - Valeur : `7827cb1e0dd4643a50589db4ee5af9221c8531200f6af1475825eb0ab041efec`
   - Environnements : ✅ Production, ✅ Preview, ✅ Development
   - Cliquer sur "Save"

3. **Redéployer l'application**
   - Aller dans "Deployments"
   - Cliquer sur les 3 points "..." du dernier déploiement
   - Sélectionner "Redeploy"
   - Confirmer

## Variables Supplémentaires Recommandées

```env
# Email
LEAD_NOTIFICATION_EMAIL=votre-email@example.com

# Chat
NEXT_PUBLIC_CHAT_ENABLED=true

# Logging
LOG_LEVEL=warn
```

## Sécurité

⚠️ **IMPORTANT** : 
- Ne jamais commiter ces valeurs dans le code
- Utiliser des clés différentes pour chaque environnement
- Régénérer les clés régulièrement
- Stocker les clés dans un gestionnaire de mots de passe sécurisé

## Génération de Nouvelles Clés

Pour générer de nouvelles clés sécurisées :

```bash
# Clé de 64 caractères hexadécimaux (recommandé)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Clé de 48 caractères base64
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Clé alphanumérique de 64 caractères
node -e "console.log(require('crypto').randomBytes(48).toString('base64url').substring(0, 64))"
```

## Vérification

Pour vérifier que les variables sont bien configurées :

1. Aller dans les logs Vercel : "Functions" → "Logs"
2. Chercher le message : "🔒 Secure encryption system initialized"
3. Si erreur, vérifier : "CRITICAL: CHAT_MASTER_SECRET required in production"

## Support

En cas de problème :
1. Vérifier que toutes les variables sont bien définies
2. Vérifier qu'il n'y a pas d'espaces avant/après les valeurs
3. Redéployer après chaque modification des variables