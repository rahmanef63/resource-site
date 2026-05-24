import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { SEED_SERVICES } from "../../shared/services-seed";
import type { Service } from "../../shared/types";

const ACCENT_RING: Record<Service["accent"], string> = {
  violet: "ring-violet-500/40 from-violet-500/15",
  amber: "ring-amber-500/40 from-amber-500/15",
  emerald: "ring-emerald-500/40 from-emerald-500/15",
  rose: "ring-rose-500/40 from-rose-500/15",
};

const PROCESS_STEPS = [
  { icon: Sparkles, title: "Discovery call", text: "30 menit gratis untuk pahami konteks dan goal Anda." },
  { icon: Target, title: "Proposal", text: "Scope, timeline, dan deliverable yang concrete." },
  { icon: Users, title: "Kick-off", text: "Mulai engagement dengan tim leadership." },
];

export function ServicesPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        align="center"
        eyebrow="Services"
        title="Cara kerja sama dengan kami"
        subtitle="Tiga format engagement — disesuaikan dengan kebutuhan dan kapasitas tim Anda. Bisa kombinasi: Sprint dulu, lanjut Retainer."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {SEED_SERVICES.map((svc) => (
          <ServiceCard key={svc.id} svc={svc} />
        ))}
      </div>

      <div className="mt-20">
        <SectionHead
          align="center"
          eyebrow="Proses"
          title="Tiga langkah memulai"
          subtitle="Dari kontak pertama sampai kick-off — biasanya selesai dalam 2 minggu."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PROCESS_STEPS.map((step, i) => (
            <Card key={step.title} className="border-border/60 bg-card/60">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-muted/40 text-xs font-semibold">
                    0{i + 1}
                  </span>
                  <step.icon className="size-4 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mt-20 border-border/60 bg-gradient-to-br from-foreground/[0.04] to-transparent">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Belum yakin format mana?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Konsultasi 30 menit — kami bantu pilih sesuai konteks tim Anda.
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href={`${PUBLIC_BASE}/contact`}>
              Jadwalkan konsultasi <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function ServiceCard({ svc }: { svc: Service }) {
  const ring = ACCENT_RING[svc.accent];
  return (
    <Card
      className={`relative overflow-hidden border-border/60 bg-card/60 ${
        svc.featured ? `ring-1 ${ring}` : ""
      }`}
    >
      {svc.featured && (
        <Badge className="absolute right-3 top-3 rounded-full bg-foreground text-[10px] text-background">
          Paling diminati
        </Badge>
      )}
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${ring} to-transparent`} />
      <CardContent className="relative space-y-5 p-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">{svc.name}</h3>
          <p className="text-sm text-muted-foreground">{svc.tagline}</p>
        </div>
        <div className="space-y-1 border-y border-border/40 py-4">
          <p className="text-2xl font-semibold">{svc.priceLabel}</p>
          <p className="text-xs text-muted-foreground">{svc.durationLabel}</p>
        </div>
        <ul className="space-y-2 text-sm">
          {svc.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-foreground/60" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <Button asChild variant={svc.featured ? "default" : "outline"} className="w-full gap-2">
          <Link href={`${PUBLIC_BASE}/contact`}>
            Pilih {svc.name} <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
