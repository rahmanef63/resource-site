"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { RoleOption, InviteInput, InviteStrategy, MembersLabels } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  roles: RoleOption[];
  defaultRoleSlug?: string;
  /** May resolve a join-link URL string; when it does, the dialog shows a
   *  read-only link row with a copy button (link generation stays in the seam). */
  onSubmit: (i: InviteInput) => void | Promise<void | string>;
  labels: MembersLabels;
  /** When set, show hierarchy-propagation controls (P4b). */
  allowPropagate?: boolean;
  defaultMaxDepth?: number;
}

export function InviteDialog({
  open, onOpenChange, roles, defaultRoleSlug, onSubmit, labels, allowPropagate, defaultMaxDepth = 3,
}: Props) {
  const fallbackRole = defaultRoleSlug ?? roles[roles.length - 1]?.slug ?? "";
  const [email, setEmail] = useState("");
  const [roleSlug, setRoleSlug] = useState(fallbackRole);
  const [message, setMessage] = useState("");
  const [propagate, setPropagate] = useState(false);
  const [strategy, setStrategy] = useState<InviteStrategy>("same");
  const [maxDepth, setMaxDepth] = useState(defaultMaxDepth);
  const [pending, setPending] = useState(false);
  const [joinLink, setJoinLink] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (!o) setJoinLink(null);
    onOpenChange(o);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    try {
      const result = await onSubmit({
        email: email.trim(), roleSlug, message: message.trim() || undefined,
        ...(allowPropagate && propagate ? { propagate: true, strategy, maxDepth } : {}),
      });
      setEmail(""); setMessage(""); setRoleSlug(fallbackRole); setPropagate(false);
      if (typeof result === "string" && result) setJoinLink(result);
      else handleOpenChange(false);
    } finally { setPending(false); }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.inviteTitle}</DialogTitle>
          <DialogDescription>{labels.inviteDescription}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">{labels.inviteEmail}</Label>
            <Input id="invite-email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label>{labels.inviteRole}</Label>
            <Select value={roleSlug} onValueChange={setRoleSlug}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-msg">{labels.inviteMessage}</Label>
            <Textarea id="invite-msg" rows={2} value={message}
              onChange={(e) => setMessage(e.target.value)} placeholder={labels.inviteMessagePlaceholder} />
          </div>

          {allowPropagate ? (
            <div className="space-y-2 rounded-md border p-3">
              <Label className="flex items-center justify-between gap-2 font-normal">
                <span>{labels.propagate}</span>
                <Switch checked={propagate} onCheckedChange={setPropagate} />
              </Label>
              <p className="text-xs text-muted-foreground">{labels.propagateHint}</p>
              {propagate ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <Label className="text-xs">Strategy</Label>
                    <Select value={strategy} onValueChange={(v) => setStrategy(v as InviteStrategy)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same">{labels.strategySame}</SelectItem>
                        <SelectItem value="decreasing">{labels.strategyStep}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="invite-depth" className="text-xs">{labels.maxDepth}</Label>
                    <Input id="invite-depth" type="number" min={1} max={10} value={maxDepth}
                      onChange={(e) => setMaxDepth(Number(e.target.value) || 1)} className="h-8 text-xs" />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {joinLink ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 rounded-md border border-dashed bg-muted/40 p-2">
                <code className="flex-1 truncate text-xs">{joinLink}</code>
                <Button type="button" size="sm" variant="ghost" className="h-7 shrink-0 gap-1"
                  onClick={() => { void navigator.clipboard?.writeText(joinLink); }}>
                  <Copy className="h-3.5 w-3.5" /> {labels.copyLink}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{labels.joinLinkHint}</p>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>{labels.cancel}</Button>
            <Button type="submit" disabled={pending || !email.trim()}>
              {pending ? labels.inviteSending : labels.inviteSubmit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
