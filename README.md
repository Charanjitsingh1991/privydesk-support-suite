# 🎯 PRIVYDESK

**Professional Multi-Tenant SaaS Helpdesk & Customer Support Platform**

A modern, feature-rich customer support platform built with React, TypeScript, and Supabase. PRIVYDESK provides comprehensive ticket management, live chat, email archiving, team collaboration, and AI-powered insights.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)

---

## ✨ Features

### 🎫 Ticket Management
- Create, assign, and track support tickets
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (Open, In Progress, Waiting, Resolved, Closed)
- File attachments and rich text support
- Internal notes and customer-visible messages
- SLA tracking and due dates

### 💬 Live Chat Widget
- Embeddable chat widget for websites
- Real-time messaging with Supabase Realtime
- Pre-chat forms and offline messages
- Agent assignment (manual or round-robin)
- Conversation to ticket conversion
- Business hours configuration

### 🤖 AI-Powered Features
- Automatic ticket categorization
- Sentiment analysis
- Smart tag extraction
- Response suggestions
- Powered by Lovable AI Gateway (Gemini/GPT)

### 📧 Email Integration
- Email archive and import
- IMAP/POP3 support
- Email to ticket conversion
- Attachment handling
- Thread tracking

### 👥 Team Management
- Role-based access control (Super Admin, Admin, Agent, Client)
- Team invitations via email
- Agent availability tracking
- Performance analytics per agent

### 📊 Analytics & Reporting
- Real-time dashboard metrics
- Ticket volume trends
- Response time analytics
- Customer satisfaction (CSAT) surveys
- Agent performance reports
- Custom date range filtering

### 🔒 Security Features
- Row Level Security (RLS) with Supabase
- Multi-factor authentication (2FA)
- OTP and Magic Link authentication
- IP blocking and rate limiting
- Content moderation and flagging
- Security audit logs
- Session management

### 📱 Mobile & PWA
- Fully responsive design
- Progressive Web App (PWA) support
- Offline functionality
- Mobile-optimized UI
- Bottom navigation for mobile
- Install prompt for native-like experience

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/privydesk.git
cd privydesk

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

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **React Router v6** - Client-side routing
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Edge Functions (Deno)
  - Storage
- **Lovable AI Gateway** - AI integrations

### DevOps
- **GitHub Actions** - CI/CD (optional)
- **Hostinger** - Production hosting
- **Playwright** - E2E testing
- **Vitest** - Unit testing

---

## 📁 Project Structure

```
privydesk/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication
│   │   ├── dashboard/      # Dashboard views
│   │   ├── tickets/        # Ticket management
│   │   ├── widget/         # Chat widget
│   │   ├── layout/         # Layout components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities
│   │   ├── api-client.ts   # API wrapper with retry logic
│   │   ├── error-handler.ts # Global error handling
│   │   ├── logger.ts       # Logging utility
│   │   └── performance-monitor.ts # Performance tracking
│   ├── pages/              # Route pages
│   ├── contexts/           # React contexts
│   ├── types/              # TypeScript types
│   └── integrations/       # External integrations
├── supabase/
│   ├── functions/          # Edge Functions
│   └── config.toml         # Supabase config
├── public/                 # Static assets
├── tests/                  # Test files
├── DEPLOYMENT.md           # Deployment guide
├── PROJECT_BLUEPRINT.md    # Architecture docs
└── SUPABASE_MIGRATION.sql  # Database schema
```

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint

# Testing
npm run test            # Run unit tests
npm run test:watch      # Watch mode for tests
npm run test:e2e        # Run E2E tests (Playwright)

# Database
supabase start          # Start local Supabase
supabase db reset       # Reset local database
supabase gen types typescript  # Generate TypeScript types
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_ENABLE_ANALYTICS=false
VITE_APP_VERSION="1.0.0"
```

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Hostinger.

### Quick Deploy

```bash
# Build for production
npm run build

# Upload dist/ folder to your hosting provider
# Ensure .htaccess is configured for SPA routing
```

---

## 📖 Documentation

- **[Project Blueprint](./PROJECT_BLUEPRINT.md)** - Complete architecture documentation
- **[Deployment Guide](./DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[Database Schema](./SUPABASE_MIGRATION.sql)** - Complete database structure

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lovable AI](https://lovable.dev/) - AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

## 📞 Support

- **Documentation**: [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/privydesk/issues)
- **Email**: support@yourdomain.com

---

**Built with ❤️ for better customer support**
