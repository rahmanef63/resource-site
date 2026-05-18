"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FAQSection } from "@/features/faq-section";
import { nid, useServices, useStore } from "../../shared/store";

export function ServicesPage() {
  const services = useServices();
  const [openSvc, setOpenSvc] = React.useState<string | null>(null);
  const active = services.find((s) => s.id === openSvc) ?? null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Services</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">Cara kerja sama</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pilih sesuai konteks tim atau kariermu. Bisa kombinasi — strategy sprint dulu, lanjut mentoring bulanan.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {services.map((s) => (
          <Card
            key={s.id}
            id={s.slug}
            className={
              "relative scroll-mt-24 border-border/60 bg-card/60 " +
              (s.featured ? "ring-1 ring-foreground/30" : "")
            }
          >
            {s.featured && (
              <Badge className="absolute right-4 top-4 rounded-full">Most picked</Badge>
            )}
            <CardContent className="p-6">
              <Sparkles className="size-5 text-foreground/80" />
              <h3 className="mt-4 text-lg font-medium">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">{s.priceLabel}</span>
                <span className="text-sm text-muted-foreground">{s.period}</span>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-foreground/70" />
                    {b}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={s.featured ? "default" : "outline"}
                onClick={() => setOpenSvc(s.id)}
              >
                Book {s.name} <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <BookDialog
        open={!!active}
        service={active}
        onOpenChange={(o) => !o && setOpenSvc(null)}
      />

      <FaqSection />
    </section>
  );
}

function BookDialog({
  open,
  service,
  onOpenChange,
}: {
  open: boolean;
  service: ReturnType<typeof useServices>[number] | null;
  onOpenChange: (o: boolean) => void;
}) {
  const { dispatch } = useStore();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!service) return;
    if (!name || !email.includes("@")) {
      toast.error("Nama + email wajib");
      return;
    }
    dispatch({
      type: "lead.create",
      lead: {
        id: nid("lead"),
        name,
        email,
        topic: service.name,
        source: `Service: ${service.name}`,
        message,
        status: "new",
        ts: Date.now(),
      },
    });
    toast.success("Booking diterima — akan dibalas dalam 24 jam kerja.");
    onOpenChange(false);
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {service?.name}</DialogTitle>
          <DialogDescription>
            {service?.priceLabel}
            {service?.period} — saya akan reach out via email dengan slot kalender + deposit instructions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground">Nama</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Konteks (opsional)</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Bahas apa, tim/perusahaan, dst."
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm booking <ArrowRight className="size-4" /></Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const FAQ_ITEMS = [
  { id: "nego", q: "Apakah pricing nego?", a: "Untuk strategy sprint, pricing fixed. Mentoring bisa dapet diskon kalau bayar 6 bulan di muka." },
  { id: "pay", q: "Pembayaran bagaimana?", a: "Bank transfer (BCA/Mandiri) atau Wise. Invoice berlaku PPN 11% (klien Indonesia)." },
  { id: "cancel", q: "Bisa cancel?", a: "Ya — full refund kalau cancel >7 hari sebelum sesi pertama, 50% kalau <7 hari." },
  { id: "lang", q: "Bahasa apa?", a: "Sesi default Bahasa Indonesia. Bisa English on request, terutama untuk tim multinational." },
];

function FaqSection() {
  return (
    <FAQSection
      eyebrow="FAQ"
      title="Pertanyaan umum"
      items={FAQ_ITEMS}
      layout="two-column"
      className="mt-20 !px-0 !py-0"
    />
  );
}
