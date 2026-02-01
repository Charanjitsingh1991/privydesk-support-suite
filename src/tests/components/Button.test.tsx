import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GradientButton } from '@/components/ui/GradientButton';

describe('GradientButton', () => {
  it('renders with children', () => {
    render(<GradientButton>Click me</GradientButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<GradientButton onClick={handleClick}>Click me</GradientButton>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<GradientButton className="custom-class">Button</GradientButton>);
    const button = screen.getByText('Button');
    expect(button.className).toContain('custom-class');
  });

  it('can be disabled', () => {
    const handleClick = vi.fn();
    render(
      <GradientButton onClick={handleClick} disabled>
        Disabled
      </GradientButton>
    );
    
    const button = screen.getByText('Disabled');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
