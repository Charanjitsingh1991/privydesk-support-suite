# PrivyDesk - Development Setup Guide

Welcome to the PrivyDesk development team! This guide will help you get your local development environment set up.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [Testing](#testing)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (recommended) or your preferred IDE

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "ms-vscode.vscode-typescript-next",
    "supabase.supabase-vscode"
  ]
}
```

### Required Accounts
- **GitHub** - For code access
- **Supabase** - For database access (ask team lead for invite)
- **Cloudflare** - For deployment via Cloudflare Pages

---

## Initial Setup

### 1. Clone Repository
```bash
# Clone the repo
git clone https://github.com/Charanjitsingh1991/privydesk-support-suite.git

# Navigate to project
cd privydesk-support-suite

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `.env` file in the root directory:

```env
# Supabase Configuration (ask team lead for these values)
VITE_SUPABASE_PROJECT_ID="mgnuddfytlbtgprckzto"
VITE_SUPABASE_URL="https://mgnuddfytlbtgprckzto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key-here"

# Optional: Local Development
VITE_DEV_MODE="true"
```

**⚠️ Important:** Never commit `.env` file to Git. It's already in `.gitignore`.

### 3. Verify Setup
```bash
# Start development server
npm run dev

# Should open http://localhost:8080
```

If you see the PrivyDesk homepage, you're all set! 🎉

---

## Project Structure

```
privydesk-support-suite/
├── public/                 # Static assets
│   ├── og-image.svg       # Social sharing image
│   ├── logo.svg           # Logo file
│   ├── sitemap.xml        # SEO sitemap
│   └── robots.txt         # SEO robots file
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── home/         # Homepage components
│   │   ├── layout/       # Layout components (Header, Footer)
│   │   ├── security/     # Security features
│   │   ├── SEO/          # SEO components
│   │   ├── team/         # Team management
│   │   ├── tickets/      # Ticket system
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Third-party integrations
│   │   └── supabase/     # Supabase client & types
│   ├── pages/            # Page components (routes)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── supabase/
│   └── migrations/       # Database migration files
├── .env                  # Environment variables (not in Git)
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies
├── tailwind.config.ts   # Tailwind CSS config
├── tsconfig.json        # TypeScript config
└── vite.config.ts       # Vite bundler config
```

### Key Directories

**`src/components/`** - All React components
- Organized by feature/domain
- Each component should be self-contained
- Include tests in same folder (`.test.tsx`)

**`src/pages/`** - Route components
- One file per route
- Named after the route (e.g., `Dashboard.tsx` → `/dashboard`)

**`src/hooks/`** - Custom React hooks
- Reusable logic
- Start with `use` prefix (e.g., `useAuth.ts`)

**`src/integrations/supabase/`** - Database layer
- `client.ts` - Supabase client instance
- `types.ts` - Auto-generated database types

---

## Development Workflow

### Daily Workflow

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes & test**
   ```bash
   npm run dev  # Start dev server
   npm run lint # Check code quality
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push & create PR**
   ```bash
   git push origin feature/your-feature-name
   # Then create Pull Request on GitHub
   ```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new ticket filter
fix: resolve authentication bug
docs: update API documentation
style: format code with prettier
refactor: restructure ticket components
test: add unit tests for auth
chore: update dependencies
```

### Branch Naming

```
feature/ticket-filters
fix/auth-redirect-bug
docs/api-documentation
refactor/ticket-system
```

---

## Code Standards

### TypeScript

```typescript
// ✅ Good - Explicit types
interface User {
  id: string;
  email: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  return supabase.from('users').select('*').eq('id', id).single();
}

// ❌ Bad - Implicit any
function getUser(id) {
  return supabase.from('users').select('*').eq('id', id).single();
}
```

### React Components

```typescript
// ✅ Good - Functional component with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {label}
    </button>
  );
}

// ❌ Bad - No types, unclear props
export function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Styling with Tailwind

```typescript
// ✅ Good - Tailwind utility classes
<div className="flex items-center gap-4 p-6 bg-black rounded-lg">
  <h1 className="text-2xl font-bold text-white">Title</h1>
</div>

// ❌ Bad - Inline styles
<div style={{ display: 'flex', padding: '24px', background: '#000' }}>
  <h1 style={{ fontSize: '24px', color: '#fff' }}>Title</h1>
</div>
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `TicketList.tsx`)
- Hooks: `camelCase.ts` (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.ts` (e.g., `ticket.ts`)

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Common Tasks

### Adding a New Page

1. Create page component in `src/pages/`
   ```typescript
   // src/pages/NewPage.tsx
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. Add route in `src/App.tsx`
   ```typescript
   <Route path="/new-page" element={<NewPage />} />
   ```

3. Add to sitemap (`public/sitemap.xml`)

### Adding a Database Table

1. Create migration file in `supabase/migrations/`
   ```sql
   -- 20260201_new_table.sql
   CREATE TABLE new_table (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. Apply migration in Supabase Dashboard

3. Regenerate types
   ```bash
   npx supabase gen types typescript --project-id mgnuddfytlbtgprckzto > src/integrations/supabase/types.ts
   ```

### Adding a New Component

1. Create component file
   ```typescript
   // src/components/ui/NewComponent.tsx
   interface NewComponentProps {
     title: string;
   }

   export function NewComponent({ title }: NewComponentProps) {
     return <div>{title}</div>;
   }
   ```

2. Export from index (if creating component library)
   ```typescript
   // src/components/ui/index.ts
   export { NewComponent } from './NewComponent';
   ```

3. Use in pages
   ```typescript
   import { NewComponent } from '@/components/ui/NewComponent';
   ```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages
npm update

# Update major versions (careful!)
npm install package-name@latest
```

---

## Troubleshooting

### "Module not found" errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors after database changes

```bash
# Regenerate Supabase types
npx supabase gen types typescript --project-id mgnuddfytlbtgprckzto > src/integrations/supabase/types.ts
```

### Port already in use

```bash
# Kill process on port 8080
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8080 | xargs kill -9
```

### Supabase connection issues

1. Check `.env` file has correct credentials
2. Verify Supabase project is not paused
3. Check network connection
4. Try logging out and back in to Supabase

### Build errors

```bash
# Clean build
rm -rf dist
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

---

## Getting Help

### Resources
- **Documentation**: See `/docs` folder
- **API Reference**: `API_DOCUMENTATION.md`
- **Deployment**: `DEPLOYMENT_GUIDE.md`
- **Team Chat**: [Your team chat link]

### Who to Ask
- **General Questions**: Team lead
- **Database Issues**: Backend team
- **UI/UX Questions**: Design team
- **Deployment**: DevOps team

### Reporting Bugs
1. Check if issue already exists on GitHub
2. Create new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

---

## Next Steps

Now that you're set up:

1. ✅ Explore the codebase
2. ✅ Read through existing components
3. ✅ Pick up your first task from the backlog
4. ✅ Ask questions - we're here to help!

**Welcome to the team! 🚀**

---

**Last Updated:** February 1, 2026
**Maintained by:** Development Team
