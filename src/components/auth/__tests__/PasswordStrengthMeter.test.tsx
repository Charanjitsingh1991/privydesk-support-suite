import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';

describe('PasswordStrengthMeter', () => {
  it('renders nothing when password is empty', () => {
    const { container } = render(<PasswordStrengthMeter password="" />);
    expect(container.firstChild).toBeNull();
  });

  it('shows password strength label', () => {
    const { getByText } = render(<PasswordStrengthMeter password="weak" />);
    expect(getByText('Password strength:')).toBeInTheDocument();
  });

  it('shows requirements checklist by default', () => {
    const { getByText } = render(<PasswordStrengthMeter password="test" />);
    expect(getByText('At least 12 characters')).toBeInTheDocument();
    expect(getByText('One uppercase letter')).toBeInTheDocument();
    expect(getByText('One lowercase letter')).toBeInTheDocument();
    expect(getByText('One number')).toBeInTheDocument();
    expect(getByText('One special character')).toBeInTheDocument();
  });

  it('hides requirements when showRequirements is false', () => {
    const { queryByText } = render(<PasswordStrengthMeter password="test" showRequirements={false} />);
    expect(queryByText('At least 12 characters')).not.toBeInTheDocument();
  });

  it('shows crack time when enabled', () => {
    const { container } = render(<PasswordStrengthMeter password="TestPassword123!" showCrackTime={true} />);
    expect(container.textContent).toContain('Crack time:');
  });

  it('hides crack time when disabled', () => {
    const { container } = render(<PasswordStrengthMeter password="test" showCrackTime={false} />);
    expect(container.textContent).not.toContain('Crack time:');
  });

  describe('requirement indicators', () => {
    it('shows lowercase requirement as met', () => {
      const { getByText } = render(<PasswordStrengthMeter password="test" />);
      const lowercaseReq = getByText('One lowercase letter').closest('div');
      expect(lowercaseReq).toHaveClass('text-green-600');
    });

    it('shows uppercase requirement as not met for lowercase-only password', () => {
      const { getByText } = render(<PasswordStrengthMeter password="test" />);
      const uppercaseReq = getByText('One uppercase letter').closest('div');
      expect(uppercaseReq).toHaveClass('text-muted-foreground');
    });

    it('shows all requirements met for strong password', () => {
      const { getByText } = render(<PasswordStrengthMeter password="StrongPass123!" />);
      
      const requirements = [
        'At least 12 characters',
        'One uppercase letter',
        'One lowercase letter',
        'One number',
        'One special character',
      ];

      requirements.forEach((req) => {
        const element = getByText(req).closest('div');
        expect(element).toHaveClass('text-green-600');
      });
    });
  });

  describe('strength levels', () => {
    it('shows Very Weak for very short passwords', () => {
      const { getByText } = render(<PasswordStrengthMeter password="a" />);
      expect(getByText('Very Weak')).toBeInTheDocument();
    });

    it('shows Strong or Good for complex passwords', () => {
      const { container } = render(<PasswordStrengthMeter password="MyStr0ng!Pass#2024" />);
      const hasStrong = container.textContent?.includes('Strong') || container.textContent?.includes('Good');
      expect(hasStrong).toBe(true);
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <PasswordStrengthMeter password="test" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
