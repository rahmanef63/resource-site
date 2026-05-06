import { SafeSignOutButton } from "./SafeSignOutButton"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <SafeSignOutButton>
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </SafeSignOutButton>
  )
}
