import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { X } from "lucide-react";

export type MemberInfoHeaderProps = {
  onClose: () => void;
};

export function MemberInfoHeader({ onClose }: MemberInfoHeaderProps) {
  return (
    <DialogHeader className="flex flex-row items-center justify-between border-b border-wa-border bg-wa-surface p-3 md:p-4">
      <h2 className="text-base font-semibold text-wa-text md:text-lg">
        Member Info
      </h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 text-wa-muted hover:bg-wa-hover hover:text-wa-text md:h-10 md:w-10"
      >
        <X className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
    </DialogHeader>
  );
}
