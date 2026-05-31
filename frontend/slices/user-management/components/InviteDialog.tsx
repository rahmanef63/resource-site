"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { RoleOption, InviteInput, MembersLabels } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  roles: RoleOption[];
  defaultRoleSlug?: string;
  onSubmit: (i: InviteInput) => void | Promise<void>;
  labels: MembersLabels;
}

export function InviteDialog({ open, onOpenChange, roles, defaultRoleSlug, onSubmit, labels }: Props) {
  const fallbackRole = defaultRoleSlug ?? roles[roles.length - 1]?.slug ?? "";
  const [email, setEmail] = useState("");
  const [roleSlug, setRoleSlug] = useState(fallbackRole);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    try {
      await onSubmit({ email: email.trim(), roleSlug, message: message.trim() || undefined });
      setEmail(""); setMessage(""); setRoleSlug(fallbackRole);
      onOpenChange(false);
    } finally { setPending(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{labels.cancel}</Button>
            <Button type="submit" disabled={pending || !email.trim()}>
              {pending ? labels.inviteSending : labels.inviteSubmit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
