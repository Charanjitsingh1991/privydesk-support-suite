# Contributing to PrivyDesk

First off, thank you for considering contributing to PrivyDesk! It's people like you that make PrivyDesk such a great tool.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Numbered steps to reproduce the behavior
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable
- **Environment**:
  - OS: [e.g., Windows 11, macOS 13]
  - Browser: [e.g., Chrome 120, Firefox 121]
  - PrivyDesk Version: [e.g., 2.0.0]

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title** and description
- **Use case**: Why this enhancement would be useful
- **Proposed solution**: How you envision it working
- **Alternatives**: Any alternative solutions you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## 🔧 Development Setup

See [Documentation/guides/DEVELOPMENT_SETUP.md](Documentation/guides/DEVELOPMENT_SETUP.md) for detailed setup instructions.

**Quick Start:**
```bash
git clone https://github.com/Charanjitsingh1991/privydesk-support-suite.git
cd privydesk-support-suite
npm install
cp .env.example .env
# Update .env with your Supabase credentials
npm run dev
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript strict mode
- No `any` types unless absolutely necessary
- Proper type definitions for all functions

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // implementation
}

// ❌ Bad
function getUser(id: any): any {
  // implementation
}
```

### React Components

- Use functional components with hooks
- One component per file
- Props interface defined above component

```typescript
// ✅ Good
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
```

### Styling

- Use Tailwind CSS utility classes
- Follow Aplio design system (dark theme, lime green accents)
- Mobile-first responsive design

```typescript
// ✅ Good
<div className="flex items-center gap-4 p-6 bg-black rounded-lg">
  <h1 className="text-2xl font-bold text-white">Title</h1>
</div>

// ❌ Bad - inline styles
<div style={{ display: 'flex', padding: '24px' }}>
  <h1 style={{ fontSize: '24px' }}>Title</h1>
</div>
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `TicketList.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.ts` (e.g., `ticket.ts`)

### Import Order

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@supabase/supabase-js';

// 3. Local components
import { Button } from '@/components/ui/button';
import { TicketList } from '@/components/tickets/TicketList';

// 4. Utilities and helpers
import { formatDate } from '@/utils/formatDate';

// 5. Types
import type { Ticket } from '@/types/ticket';

// 6. Styles (if any)
import './styles.css';
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Writing Tests

```typescript
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

## 📋 Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add sentiment analysis to tickets
fix: resolve authentication redirect bug
docs: update API documentation
style: format code with prettier
refactor: restructure ticket components
test: add unit tests for auth hooks
chore: update dependencies
```

## 🔒 Security

### Reporting Security Vulnerabilities

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, email us at: **security@privydesk.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We'll respond within 48 hours and work with you to resolve the issue.

### Security Best Practices

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize outputs to prevent XSS
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Follow OWASP security guidelines

## 🎨 Design Guidelines

### UI/UX Principles

- **Dark theme only** - Black background with lime green accents
- **Consistent spacing** - Use Tailwind spacing scale
- **Responsive design** - Mobile-first approach
- **Accessibility** - WCAG 2.1 AA compliance
- **Loading states** - Show feedback for all actions
- **Error handling** - Clear, helpful error messages

### Component Library

Use shadcn/ui components for consistency:
- Button, Input, Select, Checkbox, etc.
- Dialog, Popover, Dropdown Menu
- Toast notifications
- Data tables

## 📚 Documentation

### Code Documentation

- Document complex algorithms
- Add JSDoc comments for public functions
- Explain WHY, not just WHAT
- Keep comments up-to-date

```typescript
/**
 * Calculates the sentiment score of a ticket message
 * @param message - The ticket message content
 * @returns Sentiment score between -1 (negative) and 1 (positive)
 */
export function analyzeSentiment(message: string): number {
  // Implementation
}
```

### Updating Documentation

When making changes, update relevant documentation:
- README.md - For major features
- API documentation - For API changes
- Guides - For setup/deployment changes
- Architecture docs - For system design changes

## 🚀 Release Process

1. **Version bump** - Update version in `package.json`
2. **Update CHANGELOG.md** - Document changes
3. **Create release branch** - `release/v2.1.0`
4. **Test thoroughly** - Run all tests
5. **Create GitHub release** - Tag and release notes
6. **Deploy to production** - Follow deployment guide

## 💬 Communication

### Where to Ask Questions

- **GitHub Discussions**: General questions and discussions
- **GitHub Issues**: Bug reports and feature requests
- **Email**: support@privydesk.com for private inquiries

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions
- No harassment or discrimination

## 🏆 Recognition

Contributors will be:
- Listed in CHANGELOG.md for their contributions
- Mentioned in release notes
- Added to our contributors page (coming soon)

## 📄 License

By contributing to PrivyDesk, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Your contributions make PrivyDesk better for everyone. We appreciate your time and effort!

**Questions?** Open a discussion or email us at support@privydesk.com

---

<div align="center">

**Happy Contributing! 🚀**

[Website](https://privydesk.com) • [Documentation](Documentation/) • [GitHub](https://github.com/Charanjitsingh1991/privydesk-support-suite)

</div>
