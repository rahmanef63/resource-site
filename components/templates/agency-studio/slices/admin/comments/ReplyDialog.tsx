"use client";

import * as React from "react";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Comment } from "../../../shared/types";

export function ReplyDialog({
  target,
  onClose,
}: {
  target: Comment | null;
  onClose: () => void;
}) {
  const [body, setBody] = React.useState("");

  React.useEffect(() => {
    if (target) {
      setBody(
        `Halo ${target.author.split(" ")[0] || "there"},\n\nTerima kasih sudah menyempatkan komentar — ` +
          `kami baru saja membaca pertanyaan Anda tentang "${target.postTitle}".\n\n` +
          `Jawaban singkat: …\n\nSalam,\nStudio team`,
      );
    } else {
      setBody("");
    }
  }, [target]);

  const send = () => {
    if (!body.trim()) {
      toast.error("Body balasan tidak boleh kosong");
      return;
    }
    toast.success(`Reply dikirim ke ${target?.email}`);
    onClose();
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Reply to {target?.author}</DialogTitle>
          <DialogDescription>
            on <span className="text-foreground/80">{target?.postTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {target && (
          <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
            {target.body}
          </div>
        )}

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="font-mono text-sm"
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={send} className="gap-1.5">
            <Send className="size-3.5" /> Send reply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
