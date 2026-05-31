import { redirect } from "next/navigation"
import { getAdminUser } from "~/lib/admin-auth"

export async function isAdmin(): Promise<boolean> {
  const user = await getAdminUser()
  return !!user && !user.mustChangePassword
}

export async function requireAdmin(): Promise<void> {
  const user = await getAdminUser()
  if (!user) redirect("/admin/login")
  if (user.mustChangePassword) redirect("/admin/change-password")
}

export async function requireAdminLoginPage(): Promise<void> {
  const user = await getAdminUser()
  if (user && !user.mustChangePassword) redirect("/admin")
  if (user?.mustChangePassword) redirect("/admin/change-password")
}

export async function requireAdminPasswordChange(): Promise<
  NonNullable<Awaited<ReturnType<typeof getAdminUser>>>
> {
  const user = await getAdminUser()
  if (!user) redirect("/admin/login")
  return user
}
