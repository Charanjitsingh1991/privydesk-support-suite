# 🎯 PrivyDesk

<div align="center">

![PrivyDesk Logo](public/logo.svg)

**AI-Powered Customer Support Platform**

Transform your customer support with intelligent automation, omnichannel communication, and real-time analytics.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[🚀 Live Demo](https://privydesk.com) • [📖 Documentation](Documentation/) • [🐛 Report Bug](https://github.com/Charanjitsingh1991/privydesk-support-suite/issues) • [✨ Request Feature](https://github.com/Charanjitsingh1991/privydesk-support-suite/issues)

</div>

---

## 🌟 Why PrivyDesk?

- **5-30x Cheaper** than Zendesk/Freshdesk - No per-agent pricing
- **AI-Powered** - Sentiment analysis, auto-categorization, smart routing
- **Modern Stack** - Built with React 18, TypeScript, and Supabase
- **Real-Time** - Live updates, instant notifications, WebSocket connections
- **Enterprise-Ready** - SSO, custom domains, audit logs, 99.9% uptime
- **Open Source** - Transparent, customizable, community-driven

---

## ✨ Features

### 🎫 Ticket Management
- **Smart Ticketing** - Create, assign, track with priority levels
- **AI Auto-Categorization** - Automatic ticket classification
- **SLA Management** - Track response and resolution times
- **Custom Fields** - Extensible ticket properties
- **Bulk Actions** - Manage multiple tickets efficiently

### 💬 Live Chat System
- **Real-Time Messaging** - WebSocket-powered instant chat
- **Embeddable Widget** - Add to any website
- **Smart Routing** - Intelligent agent assignment
- **Canned Responses** - Quick replies for common questions
- **Chat-to-Ticket** - Convert conversations to tickets

### 🤖 AI-Powered Features
- **Sentiment Analysis** - Detect customer emotion in real-time
- **Auto-Categorization** - AI-powered ticket classification
- **Smart Routing** - Route to best-suited agents
- **Response Suggestions** - AI-generated reply recommendations
- **Priority Detection** - Automatic priority assignment

### 📧 Email Integration
- **IMAP/SMTP Support** - Connect existing email accounts
- **Email-to-Ticket** - Automatic ticket creation
- **Thread Tracking** - Maintain conversation context
- **Attachment Handling** - Automatic file extraction
- **Email Templates** - Branded responses

### 👥 Team Collaboration
- **Role-Based Access** - Admin, Agent, Viewer roles
- **Team Mentions** - @mention teammates
- **Internal Notes** - Private team communication
- **Performance Metrics** - Individual and team analytics
- **Shift Scheduling** - Manage team availability

### 📊 Analytics & Reporting
- **Real-Time Dashboard** - Live metrics and KPIs
- **Custom Reports** - Build custom analytics views
- **Performance Metrics** - Response time, resolution time, CSAT
- **Trend Analysis** - Historical data visualization
- **Export Data** - CSV, PDF, Excel exports

### 🔒 Enterprise Features
- **Single Sign-On (SSO)** - Google, Microsoft, Okta, SAML
- **Custom Domains** - White-label with your domain
- **Advanced Security** - 2FA, IP whitelisting, encryption
- **Audit Logs** - Complete activity tracking
- **Data Export** - GDPR-compliant data portability

### 📱 Mobile & PWA
- **Fully Responsive** - Works on all devices
- **Progressive Web App** - Install as native app
- **Offline Support** - Work without internet
- **Push Notifications** - Real-time alerts

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([free tier available](https://supabase.com))
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Charanjitsingh1991/privydesk-support-suite.git
cd privydesk-support-suite

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your Supabase credentials
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Start development server
npm run dev
```

Visit `http://localhost:8080` to see the application.

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migrations in Supabase SQL Editor:
   - `supabase/migrations/20260131_blog_posts.sql`
   - `supabase/migrations/20260131_platform_support.sql`
   - All other migration files in order
3. Seed blog posts (optional):
   - `supabase/migrations/20260131_seed_blog_posts.sql`

See [Documentation/guides/SUPABASE_SETUP.md](Documentation/guides/SUPABASE_SETUP.md) for detailed instructions.

---

## 🏗️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 5.4** - Build tool and dev server
- **TailwindCSS 3.4** - Utility-first styling
- **Framer Motion 12.29** - Animations
- **React Router 6.30** - Client-side routing
- **TanStack Query 5.83** - Server state management
- **React Hook Form 7.61** - Form handling
- **Zod 3.25** - Schema validation

### Backend & Database
- **Supabase 2.93** - Backend as a Service
  - PostgreSQL 15+ database
  - Authentication (JWT)
  - Real-time subscriptions (WebSockets)
  - Edge Functions (Deno)
  - Storage (S3-compatible)

### Build & Development
- **Vite** - Lightning-fast HMR
- **ESLint 9.32** - Code linting
- **Vitest 3.2** - Unit testing
- **Playwright 1.58** - E2E testing
- **TypeScript** - Strict mode enabled

### DevOps & Deployment
- **Cloudflare Pages** - Hosting with wildcard subdomain support
- **GitHub Actions** - CI/CD
- **Sentry** - Error tracking (optional)
- **Google Analytics** - Analytics (optional)

---

## 📁 Project Structure

```
privydesk-support-suite/
├── Documentation/              # 📚 All project documentation
│   ├── api/                   # API reference docs
│   │   ├── API_REFERENCE.md
│   │   └── COMPLETE_API_DOCUMENTATION.md
│   ├── architecture/          # System design docs
│   │   ├── AUTHENTICATION.md
│   │   └── PROJECT_BLUEPRINT.md
│   ├── guides/                # Setup and usage guides
│   │   ├── DEPLOYMENT.md
│   │   ├── DEVELOPMENT_SETUP.md
│   │   ├── SUPABASE_SETUP.md
│   │   ├── BLOG_SETUP.md
│   │   ├── SEO_OPTIMIZATION_GUIDE.md
│   │   └── VIDEO_GENERATION.md
│   └── PROJECT_OVERVIEW.md    # Complete project guide
├── public/                    # Static assets
│   ├── icons/                # PWA icons
│   ├── og-image.svg          # Social sharing image
│   ├── logo.svg              # Brand logo
│   ├── sitemap.xml           # SEO sitemap
│   └── robots.txt            # SEO crawler config
├── src/
│   ├── components/           # React components
│   │   ├── auth/            # Authentication
│   │   ├── home/            # Homepage components
│   │   ├── layout/          # Headers, footers
│   │   ├── security/        # Security features
│   │   ├── SEO/             # SEO components
│   │   ├── team/            # Team management
│   │   ├── tickets/         # Ticket system
│   │   └── ui/              # Reusable UI
│   ├── features/            # Feature modules
│   │   ├── ai/             # AI features
│   │   └── enterprise/     # Enterprise features
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # Third-party integrations
│   │   └── supabase/       # Supabase client
│   ├── pages/               # Route components
│   ├── tests/               # Test files
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app
│   └── main.tsx             # Entry point
├── supabase/
│   └── migrations/          # Database migrations
├── scripts/                 # Build/deploy scripts
└── tests/                   # E2E tests
```

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:8080)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Testing
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report

# Database
npm run supabase:types   # Generate TypeScript types
npm run supabase:link    # Link to Supabase project
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"

# Optional: AI Features
VITE_OPENAI_API_KEY="sk-..."
```

---

## 🚢 Deployment

### Deploy to Cloudflare Pages

1. Go to Cloudflare Dashboard → Workers & Pages → Create
2. Connect your GitHub repository
3. Configure: Framework = None, Build command = `npm run build`, Output = `dist`
4. Add environment variables from `.env.production`
5. Deploy

### Manual Deployment

```bash
# Build for production
npm run build

# Upload dist/ folder to your hosting provider
# Ensure proper routing configuration for SPA
```

See [Documentation/guides/DEPLOYMENT.md](Documentation/guides/DEPLOYMENT.md) for detailed deployment instructions.

---

## 📖 Documentation

### Essential Guides
- **[Project Overview](Documentation/PROJECT_OVERVIEW.md)** - Complete project guide from start to finish
- **[API Documentation](Documentation/api/COMPLETE_API_DOCUMENTATION.md)** - Full API reference for developers
- **[Development Setup](Documentation/guides/DEVELOPMENT_SETUP.md)** - Onboarding guide for new developers
- **[Deployment Guide](Documentation/guides/DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[Project Blueprint](Documentation/architecture/PROJECT_BLUEPRINT.md)** - System architecture and design

### Additional Resources
- **[Supabase Setup](Documentation/guides/SUPABASE_SETUP.md)** - Database configuration
- **[SEO Guide](Documentation/guides/SEO_OPTIMIZATION_GUIDE.md)** - SEO implementation details
- **[Authentication](Documentation/architecture/AUTHENTICATION.md)** - Auth system documentation

---

## 💰 Pricing

### Starter - $29/month
- 5 agents included
- 1,000 tickets/month
- Basic features
- Email support

### Professional - $79/month
- 20 agents included
- 10,000 tickets/month
- AI features
- Priority support
- API access

### Enterprise - $199-499/month
- Unlimited agents
- Unlimited tickets
- All features
- SSO, custom domains
- Dedicated support

**No per-agent pricing** - Save 5-30x compared to Zendesk/Freshdesk!

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 📊 Project Status

- ✅ **Core Features**: Complete
- ✅ **AI Features**: Complete
- ✅ **Enterprise Features**: Complete
- ✅ **Performance Optimization**: Complete
- ✅ **SEO Optimization**: Complete
- ✅ **Testing Infrastructure**: Complete
- ✅ **Documentation**: Complete
- 🚀 **Status**: Production Ready

---

## 🗺️ Roadmap

### Q1 2026 ✅
- ✅ AI sentiment analysis
- ✅ Auto-categorization
- ✅ SSO integration
- ✅ Custom domains

### Q2 2026
- 📱 Mobile apps (iOS/Android)
- 🌍 Multi-language support
- 📹 Video chat support
- 🔌 Marketplace for integrations

### Q3 2026
- 🤖 Advanced AI chatbot builder
- 📊 Advanced reporting
- ⚙️ Custom workflows
- 🎨 Theme customization

### Q4 2026
- 🎙️ Voice support
- 🖥️ Screen sharing
- 👥 Co-browsing
- 🔄 Advanced automation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide](https://lucide.dev/) - Icons

---

## 📞 Support

- **Documentation**: [Documentation/](Documentation/)
- **Issues**: [GitHub Issues](https://github.com/Charanjitsingh1991/privydesk-support-suite/issues)
- **Email**: support@privydesk.com
- **Website**: [privydesk.com](https://privydesk.com)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

<div align="center">

**Built with ❤️ by the PrivyDesk Team**

[Website](https://privydesk.com) • [Documentation](Documentation/) • [GitHub](https://github.com/Charanjitsingh1991/privydesk-support-suite)

</div>
