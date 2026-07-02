/**
 * Back-compat shim: re-export canonical primitives from shared/ui so existing
 * cms-lite import sites continue to work without a wide refactor.
 *
 * - `Loading` / `LoadingSpinner` wrap shared `LoadingSpinner` inside a
 *   `py-12 center` wrapper to preserve the original cms-lite visual contract
 *   (shared `LoadingSpinner` ships without the wrapper).
 * - `EmptyState` is an exact alias for the canonical dashboard primitive
 *   (its required props — title / description / action — are compatible).
 *
 * @dod:dup-eliminate references canonical components at
 *   `frontend/shared/ui/components/loading/LoadingSpinner` and
 *   `frontend/shared/ui/dashboard/EmptyState`.
 */
import { LoadingSpinner as SharedLoadingSpinner } from "@/frontend/shared/ui/components/loading/LoadingSpinner";

export { EmptyState } from "@/frontend/shared/ui/dashboard";

export function Loading({ size = "md" }: { size?: "sm" | "md" | "lg" } = {}) {
  return (
    <div className="flex items-center justify-center py-12">
      <SharedLoadingSpinner size={size} className="text-primary" />
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center justify-center py-12">
      <SharedLoadingSpinner size={size} className="text-primary" />
    </div>
  );
}
