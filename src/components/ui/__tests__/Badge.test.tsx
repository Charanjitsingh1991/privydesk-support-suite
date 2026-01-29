import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
  it('renders with children', () => {
    const { container } = render(<Badge>New</Badge>);
    expect(container.textContent).toContain('New');
  });

  describe('variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Badge variant="default">Default</Badge>);
      expect(container.firstElementChild).toHaveClass('bg-primary');
    });

    it('renders secondary variant', () => {
      const { container } = render(<Badge variant="secondary">Secondary</Badge>);
      expect(container.firstElementChild).toHaveClass('bg-secondary');
    });

    it('renders destructive variant', () => {
      const { container } = render(<Badge variant="destructive">Error</Badge>);
      expect(container.firstElementChild).toHaveClass('bg-destructive');
    });

    it('renders outline variant', () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>);
      expect(container.firstElementChild).toHaveClass('text-foreground');
    });
  });

  it('accepts custom className', () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>);
    expect(container.firstElementChild).toHaveClass('custom-class');
  });

  it('renders with default styling', () => {
    const { container } = render(<Badge>Styled</Badge>);
    const badge = container.firstElementChild;
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-semibold');
  });
});
