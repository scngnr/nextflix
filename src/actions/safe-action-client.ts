/* eslint-disable @typescript-eslint/require-await */
import { createSafeActionClient } from "next-safe-action"
import { currentUser } from "@clerk/nextjs/server"
import { ERR } from "~/lib/utils"

export const action = createSafeActionClient()

export const authAction = createSafeActionClient({
  buildContext: async () => {
    const user = await currentUser()
    if (!user) throw new Error(ERR.unauthenticated)
    return {
      userId: user.id,
    }
  },
})
