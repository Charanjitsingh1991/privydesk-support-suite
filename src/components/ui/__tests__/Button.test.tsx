import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('renders with children', () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container.querySelector('button')?.textContent).toBe('Click me');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const { container } = render(<Button onClick={handleClick}>Click me</Button>);
    const button = container.querySelector('button');
    if (button) {
      await userEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it('can be disabled', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('disabled');
  });

  describe('variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Button variant="default">Default</Button>);
      expect(container.querySelector('button')).toHaveClass('bg-primary');
    });

    it('renders destructive variant', () => {
      const { container } = render(<Button variant="destructive">Delete</Button>);
      expect(container.querySelector('button')).toHaveClass('bg-destructive');
    });

    it('renders outline variant', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      expect(container.querySelector('button')).toHaveClass('border');
    });

    it('renders secondary variant', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      expect(container.querySelector('button')).toHaveClass('bg-secondary');
    });

    it('renders ghost variant', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      expect(container.querySelector('button')).toHaveClass('hover:bg-accent');
    });

    it('renders link variant', () => {
      const { container } = render(<Button variant="link">Link</Button>);
      expect(container.querySelector('button')).toHaveClass('underline-offset-4');
    });
  });

  describe('sizes', () => {
    it('renders default size', () => {
      const { container } = render(<Button size="default">Default</Button>);
      expect(container.querySelector('button')).toHaveClass('h-10');
    });

    it('renders small size', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      expect(container.querySelector('button')).toHaveClass('h-9');
    });

    it('renders large size', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      expect(container.querySelector('button')).toHaveClass('h-11');
    });

    it('renders icon size', () => {
      const { container } = render(<Button size="icon">🔍</Button>);
      expect(container.querySelector('button')).toHaveClass('w-10');
    });
  });

  it('accepts custom className', () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    expect(container.querySelector('button')).toHaveClass('custom-class');
  });

  it('renders as child component when asChild is true', () => {
    const { container } = render(
      <Button asChild>
        <a href="/link">Link Button</a>
      </Button>
    );
    expect(container.querySelector('a')?.textContent).toBe('Link Button');
  });
});
