import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto"

const ALGORITHM = "aes-256-gcm"

function getEncryptionKey(): Buffer {
  const secret = process.env.API_KEYS_SECRET ?? process.env.NEXTAUTH_SECRET ?? "brandbook-fallback-secret-change-me"
  return scryptSync(secret, "brandbook-api-keys", 32)
}

export function encryptApiKeys(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, "utf8", "hex")
  encrypted += cipher.final("hex")
  const authTag = cipher.getAuthTag().toString("hex")
  return `${iv.toString("hex")}:${authTag}:${encrypted}`
}

export function decryptApiKeys(ciphertext: string): string {
  const key = getEncryptionKey()
  const [ivHex, authTagHex, encrypted] = ciphertext.split(":")
  if (!ivHex || !authTagHex || !encrypted) throw new Error("Invalid ciphertext format")
  const iv = Buffer.from(ivHex, "hex")
  const authTag = Buffer.from(authTagHex, "hex")
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}
