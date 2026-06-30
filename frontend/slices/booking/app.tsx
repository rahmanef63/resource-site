"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, Check, X, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBookingApi, type BookingRow } from "./lib/host";

// Default export so an os-shell can lazy-load this as a window app. ONE app that
// is both the public request form AND the owner inbox (flips on canManage).
export default function Booking() {
  const api = useBookingApi();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [canSee, setCanSee] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const reload = useCallback(async () => {
    if (!api.hasInbox) {
      setCanSee(false);
      return;
    }
    const ok = await api.canManage();
    setCanSee(ok);
    if (ok) setRows(await api.list());
  }, [api]);

  useEffect(() => {
    void reload().catch(() => {});
  }, [reload]);

  const valid = !!name.trim() && email.trim().includes("@") && !!topic.trim();

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    try {
      await api.submit({
        name: name.trim(),
        email: email.trim(),
        topic: topic.trim(),
        preferredTime: time.trim() || undefined,
        note: note.trim() || undefined,
      });
      setSent(true);
      setName("");
      setEmail("");
      setTopic("");
      setTime("");
      setNote("");
      void reload();
    } finally {
      setBusy(false);
    }
  }

  async function act(id: string, status: "confirmed" | "declined") {
    await api.setStatus(id, status);
    void reload();
  }

  return (
    <ScrollArea className="h-full bg-background text-foreground">
      <div className="p-5">
        {canSee && (
          <section className="mb-6">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Inbox className="size-4" /> Requests ({rows.length})
            </h3>
            <div className="rounded-xl border border-border bg-card p-2">
              {rows.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">No requests yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {rows.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-2 py-2.5">
                      <div className="min-w-[180px] flex-1">
                        <div className="text-sm font-medium">
                          {r.name} · <span className="text-muted-foreground">{r.topic}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.email}
                          {r.preferredTime ? ` · ${r.preferredTime}` : ""}
                          {r.note ? ` — ${r.note}` : ""}
                        </div>
                      </div>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">
                        {r.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={() => act(r.id, "confirmed")}>
                          <Check className="size-3.5" /> Confirm
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive" onClick={() => act(r.id, "declined")}>
                          <X className="size-3.5" /> Decline
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center gap-2">
            <CalendarCheck className="size-5 text-primary" />
            <div>
              <h2 className="text-base font-semibold">Book a session</h2>
              <p className="text-xs text-muted-foreground">Fill the form — we will reach back out.</p>
            </div>
          </div>
          {sent ? (
            <div className="max-w-md rounded-lg border border-border bg-card p-4 text-sm">
              <p className="font-medium">Request sent</p>
              <p className="mt-1 text-muted-foreground">Thanks — you will hear back soon.</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setSent(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <div className="grid max-w-md gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="h-9" />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="h-9" />
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic / what you need" className="h-9" />
              <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="Preferred time (optional, e.g. weekday evenings)" className="h-9" />
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes (optional)" rows={3} className="resize-none" />
              <Button onClick={submit} disabled={busy || !valid} className="gap-1.5">
                {busy ? <Loader2 className="size-4 animate-spin" /> : <CalendarCheck className="size-4" />}
                {busy ? "…" : "Send request"}
              </Button>
            </div>
          )}
        </section>
      </div>
    </ScrollArea>
  );
}
