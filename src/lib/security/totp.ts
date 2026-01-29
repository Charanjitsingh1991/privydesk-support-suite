// TOTP (Time-based One-Time Password) utilities for 2FA
// Uses Web Crypto API for secure operations

const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30; // seconds
const TOTP_ALGORITHM = 'SHA-1';

// Generate a random secret for TOTP setup
export function generateTOTPSecret(): string {
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  return base32Encode(array);
}

// Generate a TOTP QR code URL for authenticator apps
export function generateTOTPQRCodeUrl(
  secret: string,
  email: string,
  issuer: string = 'PRIVYDESK'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  const uri = `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${TOTP_ALGORITHM}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
  return uri;
}

// Generate backup codes for 2FA recovery
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    // Format as XXXX-XXXX
    const code = Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  return codes;
}

// Base32 encoding for TOTP secrets
function base32Encode(buffer: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let bits = 0;
  let value = 0;
  
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    
    while (bits >= 5) {
      result += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 31];
  }
  
  return result;
}

// Base32 decoding for TOTP verification
function base32Decode(str: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanStr = str.toUpperCase().replace(/[^A-Z2-7]/g, '');
  
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  
  for (let i = 0; i < cleanStr.length; i++) {
    value = (value << 5) | alphabet.indexOf(cleanStr[i]);
    bits += 5;
    
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  
  return new Uint8Array(bytes);
}

// HMAC-SHA1 using Web Crypto API
async function hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const keyBuffer = new Uint8Array(key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength));
  const dataBuffer = new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer.buffer as ArrayBuffer);
  return new Uint8Array(signature);
}

// Generate a TOTP code for the current time
export async function generateTOTP(secret: string): Promise<string> {
  const key = base32Decode(secret);
  let counter = Math.floor(Date.now() / 1000 / TOTP_PERIOD);
  
  // Convert counter to 8-byte big-endian
  const counterBytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter >>>= 8;
  }
  
  const hmac = await hmacSha1(key, counterBytes);
  
  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);
  
  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, '0');
}

// Verify a TOTP code (allows for time drift)
export async function verifyTOTP(
  secret: string,
  code: string,
  window: number = 1 // Number of periods to check before/after current
): Promise<boolean> {
  const cleanCode = code.replace(/\s/g, '');
  
  for (let i = -window; i <= window; i++) {
    const key = base32Decode(secret);
    const counter = Math.floor(Date.now() / 1000 / TOTP_PERIOD) + i;
    
    const counterBytes = new Uint8Array(8);
    let tempCounter = counter;
    for (let j = 7; j >= 0; j--) {
      counterBytes[j] = tempCounter & 0xff;
      tempCounter >>>= 8;
    }
    
    const hmac = await hmacSha1(key, counterBytes);
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary = ((hmac[offset] & 0x7f) << 24) |
                   ((hmac[offset + 1] & 0xff) << 16) |
                   ((hmac[offset + 2] & 0xff) << 8) |
                   (hmac[offset + 3] & 0xff);
    
    const otp = (binary % Math.pow(10, TOTP_DIGITS)).toString().padStart(TOTP_DIGITS, '0');
    
    if (otp === cleanCode) {
      return true;
    }
  }
  
  return false;
}

// Format secret for display (groups of 4)
export function formatTOTPSecret(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(' ') || secret;
}

// Interface for 2FA setup data
export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// Generate complete 2FA setup data
export function generateTwoFactorSetup(email: string): TwoFactorSetup {
  const secret = generateTOTPSecret();
  const qrCodeUrl = generateTOTPQRCodeUrl(secret, email);
  const backupCodes = generateBackupCodes();
  
  return { secret, qrCodeUrl, backupCodes };
}
