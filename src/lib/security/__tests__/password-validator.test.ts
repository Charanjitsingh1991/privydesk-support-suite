import { describe, it, expect } from 'vitest';
import {
  validatePassword,
  getPasswordStrengthLabel,
  generateSecurePassword,
  hashPassword,
  DEFAULT_PASSWORD_POLICY,
  type PasswordPolicy,
} from '../password-validator';

describe('validatePassword', () => {
  describe('with default policy', () => {
    it('should reject passwords shorter than 12 characters', () => {
      const result = validatePassword('Short1!a');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('longpassword1234!@#$');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('LONGPASSWORD1234!@#$');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('LongPassword!@#$abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject passwords without special characters', () => {
      const result = validatePassword('LongPassword1234abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should reject common passwords', () => {
      const result = validatePassword('Password123!@#abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password contains a common or banned phrase');
    });

    it('should accept a strong valid password', () => {
      const result = validatePassword('Xy9$mK2@pLq!vN4#');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return a score between 0 and 4', () => {
      const result = validatePassword('test');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(4);
    });

    it('should return estimated crack time', () => {
      const result = validatePassword('Xy9$mK2@pLq!vN4#');
      expect(result.estimatedCrackTime).toBeDefined();
      expect(typeof result.estimatedCrackTime).toBe('string');
    });
  });

  describe('with custom policy', () => {
    const relaxedPolicy: PasswordPolicy = {
      minLength: 8,
      requireUppercase: false,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: false,
      minScore: 2,
    };

    it('should validate against custom minimum length', () => {
      const result = validatePassword('short1a', relaxedPolicy);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should not require uppercase when disabled', () => {
      const result = validatePassword('longpassword123', relaxedPolicy);
      expect(result.errors).not.toContain('Password must contain at least one uppercase letter');
    });

    it('should not require symbols when disabled', () => {
      const result = validatePassword('longpassword123', relaxedPolicy);
      expect(result.errors).not.toContain('Password must contain at least one special character');
    });
  });

  describe('with user inputs', () => {
    it('should use user inputs for context in validation', () => {
      const result = validatePassword('Xy9$mK2@pLq!vN4#', DEFAULT_PASSWORD_POLICY, ['johndoe@example.com']);
      // Should still validate normally with user inputs provided
      expect(result.isValid).toBe(true);
    });
  });
});

describe('getPasswordStrengthLabel', () => {
  it('should return "Very Weak" for score 0', () => {
    const result = getPasswordStrengthLabel(0);
    expect(result.label).toBe('Very Weak');
    expect(result.color).toBe('text-red-600');
    expect(result.bgColor).toBe('bg-red-500');
  });

  it('should return "Weak" for score 1', () => {
    const result = getPasswordStrengthLabel(1);
    expect(result.label).toBe('Weak');
    expect(result.color).toBe('text-orange-600');
  });

  it('should return "Fair" for score 2', () => {
    const result = getPasswordStrengthLabel(2);
    expect(result.label).toBe('Fair');
    expect(result.color).toBe('text-yellow-600');
  });

  it('should return "Good" for score 3', () => {
    const result = getPasswordStrengthLabel(3);
    expect(result.label).toBe('Good');
    expect(result.color).toBe('text-lime-600');
  });

  it('should return "Strong" for score 4', () => {
    const result = getPasswordStrengthLabel(4);
    expect(result.label).toBe('Strong');
    expect(result.color).toBe('text-green-600');
  });

  it('should return "Unknown" for invalid scores', () => {
    const result = getPasswordStrengthLabel(5);
    expect(result.label).toBe('Unknown');
  });
});

describe('generateSecurePassword', () => {
  it('should generate a password of the specified length', () => {
    const password = generateSecurePassword(16);
    expect(password.length).toBe(16);
  });

  it('should generate a password with default length of 16', () => {
    const password = generateSecurePassword();
    expect(password.length).toBe(16);
  });

  it('should contain at least one uppercase letter', () => {
    const password = generateSecurePassword(16);
    expect(/[A-Z]/.test(password)).toBe(true);
  });

  it('should contain at least one lowercase letter', () => {
    const password = generateSecurePassword(16);
    expect(/[a-z]/.test(password)).toBe(true);
  });

  it('should contain at least one number', () => {
    const password = generateSecurePassword(16);
    expect(/[0-9]/.test(password)).toBe(true);
  });

  it('should contain at least one symbol', () => {
    const password = generateSecurePassword(16);
    expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
  });

  it('should generate unique passwords', () => {
    const passwords = new Set();
    for (let i = 0; i < 10; i++) {
      passwords.add(generateSecurePassword());
    }
    expect(passwords.size).toBe(10);
  });
});

describe('hashPassword', () => {
  it('should return a hexadecimal string', () => {
    const hash = hashPassword('testPassword');
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it('should return the same hash for the same password', () => {
    const hash1 = hashPassword('testPassword');
    const hash2 = hashPassword('testPassword');
    expect(hash1).toBe(hash2);
  });

  it('should return different hashes for different passwords', () => {
    const hash1 = hashPassword('password1');
    const hash2 = hashPassword('password2');
    expect(hash1).not.toBe(hash2);
  });
});
