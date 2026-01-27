import zxcvbn from 'zxcvbn';

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-4, where 4 is strongest
  errors: string[];
  suggestions: string[];
  estimatedCrackTime: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  minScore: number; // Minimum zxcvbn score (0-4)
  bannedPasswords?: string[];
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  minScore: 3,
};

// Common passwords that should always be banned
const COMMON_PASSWORDS = [
  'password', 'password1', 'password123', '123456', '12345678', 
  'qwerty', 'abc123', 'monkey', 'master', 'dragon', 'letmein',
  'login', 'admin', 'welcome', 'solo', 'princess', 'starwars',
  'privydesk', 'support', 'ticket', 'helpdesk',
];

export function validatePassword(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
  userInputs: string[] = []
): PasswordValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  // Run zxcvbn analysis with user inputs (email, name, etc.) to catch personal patterns
  const analysis = zxcvbn(password, userInputs);
  
  // Check minimum length
  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters`);
  }
  
  // Check for uppercase
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for numbers
  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for symbols
  if (policy.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check against common passwords
  const lowerPassword = password.toLowerCase();
  const allBannedPasswords = [...COMMON_PASSWORDS, ...(policy.bannedPasswords || [])];
  if (allBannedPasswords.some(banned => lowerPassword.includes(banned.toLowerCase()))) {
    errors.push('Password contains a common or banned phrase');
  }
  
  // Check zxcvbn score
  if (analysis.score < policy.minScore) {
    errors.push('Password is too weak - try adding more random characters');
  }
  
  // Add zxcvbn suggestions
  if (analysis.feedback.suggestions.length > 0) {
    suggestions.push(...analysis.feedback.suggestions);
  }
  if (analysis.feedback.warning) {
    suggestions.unshift(analysis.feedback.warning);
  }
  
  // Format crack time display
  const crackTime = analysis.crack_times_display.offline_slow_hashing_1e4_per_second as string;
  
  return {
    isValid: errors.length === 0,
    score: analysis.score,
    errors,
    suggestions,
    estimatedCrackTime: crackTime,
  };
}

export function getPasswordStrengthLabel(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  switch (score) {
    case 0:
      return { label: 'Very Weak', color: 'text-red-600', bgColor: 'bg-red-500' };
    case 1:
      return { label: 'Weak', color: 'text-orange-600', bgColor: 'bg-orange-500' };
    case 2:
      return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    case 3:
      return { label: 'Good', color: 'text-lime-600', bgColor: 'bg-lime-500' };
    case 4:
      return { label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-500' };
    default:
      return { label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-500' };
  }
}

export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = uppercase + lowercase + numbers + symbols;
  
  // Ensure at least one of each type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Check if password was recently used (for reuse prevention)
export function hashPassword(password: string): string {
  // Simple hash for client-side comparison (actual secure hashing done server-side)
  // This is just for UI purposes to detect similar passwords
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}
