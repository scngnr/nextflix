import { adminListPlatformAccounts } from "~/actions/admin"
import { UserManager } from "~/components/admin/user-manager"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const accounts = await adminListPlatformAccounts()
  return <UserManager accounts={accounts} />
}
