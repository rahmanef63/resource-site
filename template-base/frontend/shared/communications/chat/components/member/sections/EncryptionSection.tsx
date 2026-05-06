import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

type EncryptionSectionProps = {
  isMobile: boolean;
};

export function EncryptionSection({ isMobile }: EncryptionSectionProps) {
  return (
    <div className="space-y-6">
      <div
        className={[
          "rounded-wa-lg border border-wa-border bg-wa-surface text-center",
          isMobile ? "px-4 py-6" : "px-6 py-8",
        ].join(" ")}
      >
        <Lock
          className={[
            "mx-auto text-wa-muted",
            isMobile ? "h-12 w-12" : "h-16 w-16",
          ].join(" ")}
        />
        <h3 className="mb-2 text-base font-semibold text-wa-text md:text-lg">
          End-to-end encrypted
        </h3>
        <p className="mx-auto max-w-md text-sm text-wa-muted">
          Messages and calls are secured with end-to-end encryption. Tap to
          verify the security code with {isMobile ? "this contact." : "your contact."}
        </p>
      </div>
      <Button
        variant="outline"
        className="w-full border-primary text-primary hover:bg-primary/10"
      >
        Learn more
      </Button>
    </div>
  );
}
