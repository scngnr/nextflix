import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto"
import { cookies } from "next/headers"
import { eq } from "drizzle-orm"
import { db } from "~/db/client"
import { adminUsers } from "~/db/schema"
import { env } from "~/env.mjs"

export const ADMIN_SESSION_COOKIE = "admin_session"
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7 // 7 gün
const DEFAULT_PASSWORD = "123456"

function sessionSecret(): string {
  return env.ADMIN_SESSION_SECRET ?? env.CLERK_SECRET_KEY
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":")
  if (parts.length !== 2) return false
  const [salt, hash] = parts
  if (!salt || !hash) return false
  try {
    const hashBuffer = scryptSync(password, salt, 64)
    const storedBuffer = Buffer.from(hash, "hex")
    if (hashBuffer.length !== storedBuffer.length) return false
    return timingSafeEqual(hashBuffer, storedBuffer)
  } catch {
    return false
  }
}

function signSession(adminId: number): string {
  const expires = Date.now() + SESSION_MAX_AGE_SEC * 1000
  const payload = `${adminId}:${expires}`
  const sig = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex")
  return `${payload}:${sig}`
}

function parseSession(token: string): number | null {
  const parts = token.split(":")
  if (parts.length !== 3) return null
  const [idStr, expiresStr, sig] = parts
  if (!idStr || !expiresStr || !sig) return null
  const expires = Number(expiresStr)
  if (!Number.isFinite(expires) || expires < Date.now()) return null
  const payload = `${idStr}:${expiresStr}`
  const expected = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex")
  try {
    const a = Buffer.from(sig, "hex")
    const b = Buffer.from(expected, "hex")
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  const adminId = Number(idStr)
  return Number.isFinite(adminId) ? adminId : null
}

export async function ensureDefaultAdmin(): Promise<void> {
  const existing = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.username, "admin"),
  })
  if (existing) return
  await db.insert(adminUsers).values({
    username: "admin",
    passwordHash: hashPassword(DEFAULT_PASSWORD),
    mustChangePassword: true,
  })
}

export async function getAdminUser() {
  await ensureDefaultAdmin()
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null
  const adminId = parseSession(token)
  if (!adminId) return null
  return db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, adminId),
  })
}

export function setAdminSessionCookie(adminId: number) {
  cookies().set(ADMIN_SESSION_COOKIE, signSession(adminId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  })
}

export function clearAdminSessionCookie() {
  cookies().delete(ADMIN_SESSION_COOKIE)
}
