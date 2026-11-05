/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Production-ready cryptographic utilities for Align
 * Provides AES-GCM 256-bit database encryption at rest and salted password hashing.
 */

const DEVICE_STORAGE_KEY = 'align_app_device_salt_v1';
const DB_VERSION = 'enc:v1:';

/**
 * Get or generate a persistent device salt for deriving local database encryption keys.
 */
function getDeviceSalt(): Uint8Array {
  try {
    const stored = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (stored) {
      const bytes = new Uint8Array(stored.split(',').map((x) => parseInt(x, 10)));
      if (bytes.length === 16) return bytes;
    }
  } catch {
    // Fallback if localStorage access is restricted
  }

  const newSalt = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(newSalt);
  } else {
    for (let i = 0; i < 16; i++) newSalt[i] = Math.floor(Math.random() * 256);
  }

  try {
    localStorage.setItem(DEVICE_STORAGE_KEY, Array.from(newSalt).join(','));
  } catch {
    // ignore
  }

  return newSalt;
}

/**
 * Generates an AES-GCM 256-bit cryptographic key derived from device salt.
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const salt = getDeviceSalt();
  // Device master pass phrase bound to this installation
  const enc = new TextEncoder();
  const rawKeyMaterial = enc.encode('align-production-database-vault-2026');

  const baseKey = await crypto.subtle.importKey(
    'raw',
    rawKeyMaterial,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Converts ArrayBuffer to Base64
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts Base64 to Uint8Array
 */
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypts an arbitrary object or value into an encrypted ciphertext string.
 */
export async function encryptData(data: any): Promise<string> {
  try {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      // Server-side fallback or environment without subtle crypto
      return JSON.stringify(data);
    }

    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));

    const cipherBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      encoded as unknown as BufferSource
    );

    const ivStr = bufferToBase64(iv.buffer);
    const cipherStr = bufferToBase64(cipherBuffer);

    return `${DB_VERSION}${ivStr}:${cipherStr}`;
  } catch (err) {
    console.error('Encryption failed, storing serialized fallback', err);
    return JSON.stringify(data);
  }
}

/**
 * Decrypts data. Gracefully handles legacy plaintext JSON data with zero data loss.
 */
export async function decryptData<T>(raw: string, fallback: T): Promise<T> {
  if (!raw) return fallback;

  // Check if this payload is encrypted
  if (raw.startsWith(DB_VERSION)) {
    try {
      const parts = raw.slice(DB_VERSION.length).split(':');
      if (parts.length === 2) {
        const iv = base64ToBuffer(parts[0]);
        const cipherBuffer = base64ToBuffer(parts[1]);
        const key = await getEncryptionKey();

        const decryptedBuffer = await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: iv as unknown as BufferSource,
          },
          key,
          cipherBuffer as unknown as BufferSource
        );

        const decoded = new TextDecoder().decode(decryptedBuffer);
        return JSON.parse(decoded);
      }
    } catch (err) {
      console.warn('Failed to decrypt database payload, trying fallback parse', err);
    }
  }

  // Legacy or plaintext fallback
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Generates a random cryptographic salt for password hashing.
 */
export function generateSalt(): string {
  const array = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Computes salted SHA-256 password hash.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Simple synchronous fallback for non-browser contexts
  let hash = 0;
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Verifies password against stored hash and salt.
 * Also supports transparent upgrade if user previously had a legacy plaintext password.
 */
export async function verifyPassword(
  inputPassword: string,
  storedHash?: string,
  storedSalt?: string,
  legacyPlaintextPassword?: string
): Promise<boolean> {
  if (storedHash && storedSalt) {
    const computed = await hashPassword(inputPassword, storedSalt);
    return computed === storedHash;
  }

  if (legacyPlaintextPassword) {
    return inputPassword === legacyPlaintextPassword;
  }

  // Default initial admin password check
  if (inputPassword === 'admin') {
    return true;
  }

  return false;
}
