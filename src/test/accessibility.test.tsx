import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

/**
 * Accessibility tests for core UI components
 * These tests verify that components meet basic accessibility requirements
 */

describe('Accessibility Tests', () => {
  describe('Button Accessibility', () => {
    it('has correct role', () => {
      const { getByRole } = render(<Button>Click me</Button>);
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('is focusable', () => {
      const { getByRole } = render(<Button>Click me</Button>);
      const button = getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('can be disabled and not focusable', () => {
      const { getByRole } = render(<Button disabled>Click me</Button>);
      const button = getByRole('button');
      expect(button).toBeDisabled();
    });

    it('supports aria-label', () => {
      const { getByRole } = render(<Button aria-label="Close dialog">×</Button>);
      expect(getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
    });

    it('supports aria-pressed for toggle buttons', () => {
      const { getByRole } = render(<Button aria-pressed="true">Toggle</Button>);
      const button = getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Form Input Accessibility', () => {
    it('associates label with input', () => {
      const { getByLabelText } = render(
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
        </div>
      );
      
      const input = getByLabelText('Email');
      expect(input).toBeInTheDocument();
    });

    it('supports aria-describedby for error messages', () => {
      const { getByLabelText } = render(
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" aria-describedby="email-error" />
          <span id="email-error">Invalid email address</span>
        </div>
      );
      
      const input = getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('supports aria-invalid for invalid inputs', () => {
      const { getByLabelText } = render(
        <Input aria-label="Email" aria-invalid="true" />
      );
      
      const input = getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports required attribute', () => {
      const { getByLabelText } = render(
        <Input aria-label="Required field" required />
      );
      
      const input = getByLabelText('Required field');
      expect(input).toBeRequired();
    });
  });

  describe('Badge Accessibility', () => {
    it('is not focusable by default (decorative)', () => {
      const { container } = render(<Badge>New</Badge>);
      const badge = container.firstChild;
      expect(badge).not.toHaveAttribute('tabIndex');
    });

    it('supports aria-label for screen readers', () => {
      const { getByLabelText } = render(<Badge aria-label="New notification">New</Badge>);
      expect(getByLabelText('New notification')).toBeInTheDocument();
    });
  });

  describe('Color Contrast', () => {
    it('applies high contrast classes for primary button', () => {
      const { container } = render(<Button variant="default">Primary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('applies high contrast classes for destructive button', () => {
      const { container } = render(<Button variant="destructive">Delete</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });
  });

  describe('Focus Management', () => {
    it('button shows focus outline', () => {
      const { container } = render(<Button>Focus me</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('focus-visible');
    });

    it('input shows focus outline', () => {
      const { container } = render(<Input aria-label="Text input" />);
      const input = container.querySelector('input');
      expect(input?.className).toContain('focus-visible');
    });
  });

  describe('Semantic HTML', () => {
    it('button uses semantic button element', () => {
      const { container } = render(<Button>Click</Button>);
      expect(container.querySelector('button')).toBeInTheDocument();
    });

    it('input uses semantic input element', () => {
      const { container } = render(<Input aria-label="Input" />);
      expect(container.querySelector('input')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('button is triggered by click', async () => {
      const onClick = vi.fn();
      const { getByRole } = render(<Button onClick={onClick}>Click</Button>);
      
      const button = getByRole('button');
      button.click();
      expect(onClick).toHaveBeenCalled();
    });

    it('disabled button ignores click events', () => {
      const onClick = vi.fn();
      const { getByRole } = render(<Button disabled onClick={onClick}>Click</Button>);
      
      const button = getByRole('button');
      button.click();
      
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});

describe('ARIA Landmarks', () => {
  it('main content should be identifiable', () => {
    const { getByRole } = render(
      <main role="main" aria-label="Main content">
        <h1>Page Title</h1>
      </main>
    );
    
    expect(getByRole('main')).toBeInTheDocument();
  });

  it('navigation should be identifiable', () => {
    const { getByRole } = render(
      <nav role="navigation" aria-label="Main navigation">
        <ul>
          <li>Home</li>
        </ul>
      </nav>
    );
    
    expect(getByRole('navigation')).toBeInTheDocument();
  });
});
