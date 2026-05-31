"use client"
import { cn } from "~/lib/utils"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import type { SubscriptionPlan, PlanName } from "~/lib/types"
import { PLANS } from "~/lib/configs"

export function PlanSelector({
  activeSubscription,
  paymentsEnabled = false,
}: {
  activeSubscription: PlanName
  paymentsEnabled?: boolean
}) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(
    Plans[activeSubscription],
  )

  function submit() {
    if (!paymentsEnabled) return
  }

  return (
    <>
      <div className="flex justify-end gap-1.5 md:gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "grid aspect-square w-20 shrink-0 cursor-pointer place-content-center rounded-lg font-semibold md:w-24",
              selectedPlan.name === plan.name
                ? "bg-red-600"
                : "bg-red-900 hover:bg-red-700",
            )}
            onClick={() => setSelectedPlan(plan)}
          >
            {`${plan.name.charAt(0).toUpperCase()}${plan.name.substring(1)}`}
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button
          className="w-56 bg-green-600 font-semibold text-white hover:bg-green-700"
          onClick={submit}
          disabled={
            !paymentsEnabled ||
            (selectedPlan.name === "free" && activeSubscription === "free")
          }
        >
          {!paymentsEnabled
            ? "Payments unavailable"
            : activeSubscription !== "free"
              ? "Edit"
              : "Subscribe"}
        </Button>
      </div>
    </>
  )
}

const Plans = {
  free: PLANS[0],
  basic: PLANS[1],
  standard: PLANS[2],
  premium: PLANS[3],
}
