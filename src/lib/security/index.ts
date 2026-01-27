// Security Library Index - Export all security utilities

// Password validation
export {
  validatePassword,
  getPasswordStrengthLabel,
  generateSecurePassword,
  hashPassword,
  DEFAULT_PASSWORD_POLICY,
  type PasswordValidationResult,
  type PasswordPolicy,
} from './password-validator';

// Input sanitization
export {
  sanitizeHtml,
  sanitizeText,
  sanitizeForDisplay,
  escapeHtml,
  sanitizeFilename,
  sanitizeUrl,
  validationSchemas,
  ticketFormSchema,
  messageFormSchema,
  contactFormSchema,
  profileUpdateSchema,
  validateInput,
  RateLimiter,
  loginRateLimiter,
  otpRateLimiter,
  ticketRateLimiter,
  messageRateLimiter,
} from './input-sanitizer';

// TOTP / 2FA
export {
  generateTOTPSecret,
  generateTOTPQRCodeUrl,
  generateBackupCodes,
  generateTOTP,
  verifyTOTP,
  formatTOTPSecret,
  generateTwoFactorSetup,
  type TwoFactorSetup,
} from './totp';

// Link validation
export {
  extractUrls,
  getDomainFromUrl,
  isExternalLink,
  isSuspiciousUrl,
  scanLink,
  scanLinksInContent,
  hasUnsafeLinks,
} from './link-validator';

// Attachment validation
export {
  getFileExtension,
  isDangerousExtension,
  isSafeExtension,
  validateMimeType,
  validateFileSize,
  scanAttachment,
  getFileIcon,
  formatFileSize,
  FILE_SIZE_LIMITS,
} from './attachment-validator';
