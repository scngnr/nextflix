import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const user = await currentUser()
  if (!user) redirect("/sign-in")
  return user
}

export async function getOptionalUserId() {
  const user = await currentUser()
  return user?.id ?? null
}
