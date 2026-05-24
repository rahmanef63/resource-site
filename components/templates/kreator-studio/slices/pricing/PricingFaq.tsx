"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";

const FAQ_ITEMS = [
  {
    q: "Pricing fix atau bisa nego?",
    a: "Newsletter Sponsor dan Carousel Pack fix. Custom Production dan Strategy Sprint sebenarnya range — final number tergantung scope.",
  },
  {
    q: "Pembayaran bagaimana?",
    a: "50% deposit sebelum mulai, 50% saat selesai. Bank transfer Indonesia (BCA/Mandiri/BNI) atau Wise untuk klien luar. Invoice PPN 11% kalau klien punya NPWP.",
  },
  {
    q: "Bisa custom scope?",
    a: "Bisa. Email dengan brief — biasanya balas H+1 dengan 2–3 opsi paket yang fit.",
  },
  {
    q: "Apakah ada retainer?",
    a: "Ya — minimum 3 bulan, scope disepakati di awal. Hubungi langsung untuk detail karena tiap retainer beda case.",
  },
  {
    q: "Industri yang pernah dikerjain?",
    a: "Fintech (Bibit), e-commerce (Tokopedia), edukasi (Ruangguru), F&B (4 brand UMKM). Kalau industri kamu belum ada, justru menarik buat eksplor.",
  },
  {
    q: "Bahasa output?",
    a: "Default Bahasa Indonesia. Bisa English on request — biasanya untuk audience LinkedIn atau brand multinational.",
  },
];

export function PricingFaq() {
  return (
    <div>
      <SectionHead
        eyebrow="FAQ"
        title="Pertanyaan umum"
        subtitle="Hal-hal yang sering ditanyakan sebelum mulai project."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {FAQ_ITEMS.map((f) => (
          <Card key={f.q} className="border-border/60 bg-card/60">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm font-medium">{f.q}</p>
              <p className="text-sm text-muted-foreground">{f.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
