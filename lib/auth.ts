import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto"
import { promisify } from "util"

const scrypt = promisify(_scrypt)
const KEYLEN = 64

/** Hash a password with a random salt. Stored as `salt:hash` (both hex). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const derived = (await scrypt(password, salt, KEYLEN)) as Buffer
  return `${salt}:${derived.toString("hex")}`
}

/** Verify a plaintext password against a stored `salt:hash` value. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, key] = stored.split(":")
  if (!salt || !key) return false
  const keyBuf = Buffer.from(key, "hex")
  const derived = (await scrypt(password, salt, KEYLEN)) as Buffer
  if (keyBuf.length !== derived.length) return false
  return timingSafeEqual(keyBuf, derived)
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
