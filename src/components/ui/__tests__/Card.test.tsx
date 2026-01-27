import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card', () => {
  it('renders Card component', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstElementChild).toHaveClass('custom-class');
  });

  it('has default styling', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstElementChild;
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('shadow-sm');
  });
});

describe('CardHeader', () => {
  it('renders CardHeader component', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('has correct spacing', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    expect(container.firstElementChild).toHaveClass('p-6');
  });
});

describe('CardTitle', () => {
  it('renders CardTitle component', () => {
    const { container } = render(<CardTitle>Title</CardTitle>);
    expect(container.textContent).toContain('Title');
  });

  it('renders as h3 element', () => {
    const { container } = render(<CardTitle>Title</CardTitle>);
    expect(container.querySelector('h3')?.textContent).toBe('Title');
  });

  it('has correct text styling', () => {
    const { container } = render(<CardTitle>Title</CardTitle>);
    expect(container.querySelector('h3')).toHaveClass('text-2xl');
    expect(container.querySelector('h3')).toHaveClass('font-semibold');
  });
});

describe('CardDescription', () => {
  it('renders CardDescription component', () => {
    const { container } = render(<CardDescription>Description</CardDescription>);
    expect(container.textContent).toContain('Description');
  });

  it('has muted styling', () => {
    const { container } = render(<CardDescription>Description</CardDescription>);
    expect(container.querySelector('p')).toHaveClass('text-muted-foreground');
  });
});

describe('CardContent', () => {
  it('renders CardContent component', () => {
    const { container } = render(<CardContent>Content</CardContent>);
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('has correct padding', () => {
    const { container } = render(<CardContent>Content</CardContent>);
    expect(container.firstElementChild).toHaveClass('p-6');
  });
});

describe('CardFooter', () => {
  it('renders CardFooter component', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('has flex layout', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    expect(container.firstElementChild).toHaveClass('flex');
  });
});

describe('Card composition', () => {
  it('renders complete card structure', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(container.firstElementChild).toBeInTheDocument();
    expect(container.textContent).toContain('Card Title');
    expect(container.textContent).toContain('Card description goes here');
    expect(container.textContent).toContain('Card content');
    expect(container.querySelector('button')?.textContent).toBe('Action');
  });
});
