"use server"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { db } from "~/db/client"
import { adminUsers } from "~/db/schema"
import {
  ensureDefaultAdmin,
  hashPassword,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  verifyPassword,
  getAdminUser,
} from "~/lib/admin-auth"

export async function adminLoginAction(input: {
  username: string
  password: string
}) {
  await ensureDefaultAdmin()
  const username = input.username.trim()
  const password = input.password
  if (!username || !password) {
    return { error: "Kullanıcı adı ve şifre gerekli." }
  }

  const user = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.username, username),
  })
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Geçersiz kullanıcı adı veya şifre." }
  }

  setAdminSessionCookie(user.id)

  if (user.mustChangePassword) {
    redirect("/admin/change-password")
  }
  redirect("/admin")
}

export async function adminChangePasswordAction(input: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) {
  const user = await getAdminUser()
  if (!user) redirect("/admin/login")

  if (!verifyPassword(input.currentPassword, user.passwordHash)) {
    return { error: "Mevcut şifre hatalı." }
  }
  if (input.newPassword.length < 8) {
    return { error: "Yeni şifre en az 8 karakter olmalı." }
  }
  if (input.newPassword === "123456") {
    return { error: "Varsayılan şifre kullanılamaz." }
  }
  if (input.newPassword !== input.confirmPassword) {
    return { error: "Yeni şifreler eşleşmiyor." }
  }

  await db
    .update(adminUsers)
    .set({
      passwordHash: hashPassword(input.newPassword),
      mustChangePassword: false,
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, user.id))

  redirect("/admin")
}

export async function adminLogoutAction() {
  clearAdminSessionCookie()
  redirect("/admin/login")
}
