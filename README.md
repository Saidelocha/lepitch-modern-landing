# Le Pitch Qu'il Vous Faut

Landing page moderne avec chatbot IA intégré, construite avec Next.js 14, TypeScript strict et architecture sécurisée.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode, exactOptionalPropertyTypes)
- **Styling**: Tailwind CSS v3
- **AI Integration**: OpenRouter API
- **Email**: Resend
- **Validation**: Zod + custom security layers
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel-ready

## 🏗️ Architecture

### Core Features
- **Chatbot IA** avec qualification de prospects automatisée
- **Système de sécurité** multi-couches (rate limiting, chiffrement AES-256)
- **Validation robuste** des entrées utilisateur
- **Performance optimisée** (lazy loading, code splitting)
- **SEO complet** (structured data, meta tags)

### Security Features
- Chiffrement end-to-end des données chat
- Rate limiting intelligent par IP/session
- Validation stricte des patterns d'input
- Protection contre injection et XSS
- Logging sécurisé avec masquage automatique

## 📁 Structure du Projet

```
src/
├── app/
│   ├── api/
│   │   ├── chat/               # API chatbot IA
│   │   ├── survey/             # Soumission formulaires  
│   │   └── security/           # Monitoring sécurité
│   ├── layout.tsx              # Layout avec SEO
│   └── page.tsx                # Landing page
├── components/
│   ├── sections/               # Sections homepage
│   ├── conversion/             # Chat, popups, CTAs
│   └── ui/                     # Composants réutilisables
├── lib/
│   ├── chatbot/
│   │   ├── security/           # Sécurité multi-couches
│   │   ├── validation/         # Validation robuste
│   │   ├── performance/        # Cache & rate limiting
│   │   └── chat-engine.ts      # Moteur principal IA
│   └── constants.ts            # Configuration
├── hooks/                      # Hooks React custom
└── types/                      # Types TypeScript
```

## ⚡ Quick Start

```bash
# Installation
npm install

# Configuration environnement (voir section suivante)
cp .env.example .env.local

# Développement
npm run dev
```

## 🔧 Variables d'Environnement

```bash
# .env.local
RESEND_API_KEY=re_your_key_here
LEAD_NOTIFICATION_EMAIL=your@email.com
OPENROUTER_API_KEY=sk-or-v1-your_key
CHAT_ENCRYPTION_KEY=64_char_hex_key
NEXT_PUBLIC_CHAT_ENABLED=true
LOG_LEVEL=info
```

## 📝 Scripts

```bash
npm run dev          # Développement (port 3333)
npm run build        # Build production
npm run type-check   # Vérification TypeScript strict
npm run lint         # ESLint + Prettier
npm run test         # Tests Vitest
```

## 🔒 Sécurité & Validation

### Modules Sécurité
```typescript
// Chiffrement AES-256
src/lib/chatbot/security/encryption-service.ts

// Rate limiting intelligent  
src/lib/chatbot/rate-limiter.ts

// Validation patterns sécurisée
src/lib/chatbot/validation/security-pattern-matcher.ts

// Monitoring temps réel
src/lib/chatbot/security/security-monitor.ts
```

### Features Sécurité
- **Validation stricte** : Regex patterns, sanitization, Zod schemas
- **Rate limiting** : Par IP, session, endpoint avec fenêtres glissantes
- **Chiffrement** : AES-256 pour données sensibles 
- **Monitoring** : Détection anomalies, alertes automatiques
- **Logging sécurisé** : Masquage données sensibles, niveaux structurés

## 📊 Performance & SEO

### Optimisations
- **Bundle size** : <100KB initial JS
- **Core Web Vitals** : LCP <2.5s, FID <100ms, CLS <0.1
- **Images** : WebP/AVIF, lazy loading, responsive
- **SEO** : Structured data, meta tags, sitemap
- **A11y** : WCAG 2.1 AA compliant

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# 1. Connecter repo GitHub à Vercel
# 2. Configurer variables environnement dans dashboard
# 3. Déploiement automatique sur push
```

### Variables Production
```bash
RESEND_API_KEY=production_key
OPENROUTER_API_KEY=production_key  
CHAT_ENCRYPTION_KEY=secure_64_hex_key
LEAD_NOTIFICATION_EMAIL=prod@domain.com
NODE_ENV=production
```

## 💻 TypeScript Configuration

```json
// tsconfig.json - Configuration stricte
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## 🛡️ Code Quality

- **TypeScript strict mode** activé
- **ESLint** + Prettier configuration
- **Pas de `any` types** - types explicites partout
- **Error boundaries** React
- **Validation runtime** avec Zod
- **Patterns de sécurité** OWASP compliant

---

**Stack moderne • Architecture sécurisée • Performance optimisée**