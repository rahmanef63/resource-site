import Link from "next/link";
import { ArrowRight, Award, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { SEED_TEAM } from "../../shared/team-seed";
import type { TeamMember } from "../../shared/types";

const GRADIENTS = [
  "from-violet-500/30 to-fuchsia-500/10",
  "from-emerald-500/30 to-teal-500/10",
  "from-amber-500/30 to-orange-500/10",
  "from-rose-500/30 to-pink-500/10",
];

const VALUES = [
  { title: "Independent", text: "Kami bekerja untuk klien, bukan vendor. Rekomendasi netral, tanpa konflik kepentingan." },
  { title: "Practical", text: "Output kami siap dieksekusi — bukan deck pretty yang berakhir di lemari." },
  { title: "Indonesian-first", text: "Konteks lokal: regulasi, budaya kerja, dan dinamika bisnis Indonesia." },
];

export function TeamPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <SectionHead
        align="center"
        eyebrow="Tim"
        title="Konsultan di balik engagement"
        subtitle="Tim kecil, pengalaman dalam. Setiap engagement dipimpin langsung oleh principal atau senior manager — bukan associate junior."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {SEED_TEAM.map((m, i) => (
          <MemberCard key={m.id} member={m} gradient={GRADIENTS[i % GRADIENTS.length]} />
        ))}
      </div>

      <div className="mt-20">
        <SectionHead
          align="center"
          eyebrow="Nilai kami"
          title="Cara kami bekerja"
          subtitle="Tiga prinsip yang membentuk setiap engagement dan rekomendasi kami."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {VALUES.map((v) => (
            <Card key={v.title} className="border-border/60 bg-card/60">
              <CardContent className="space-y-2 p-6">
                <Award className="size-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mt-20 border-border/60 bg-gradient-to-br from-foreground/[0.04] to-transparent">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Tertarik bergabung?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Kami sesekali membuka posisi untuk konsultan dengan 5+ tahun pengalaman strategi atau operasi.
            </p>
          </div>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link href={`${PUBLIC_BASE}/contact`}>
              Kirim CV <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

function MemberCard({ member, gradient }: { member: TeamMember; gradient: string }) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card/60">
      <div className="grid grid-cols-[auto_1fr]">
        <div
          className={`flex items-center justify-center bg-gradient-to-br ${gradient} p-8 md:p-10`}
        >
          <span className="text-4xl font-semibold tracking-tight text-foreground/80 md:text-5xl">
            {member.initials}
          </span>
        </div>
        <CardContent className="space-y-3 p-6">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{member.name}</h3>
            <p className="text-sm text-muted-foreground">{member.role}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {member.city}
            </span>
            <span>· {member.yearsExp} tahun pengalaman</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{member.bio}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {member.expertise.map((e) => (
              <Badge
                key={e}
                variant="outline"
                className="rounded-full text-[10px] font-normal"
              >
                {e}
              </Badge>
            ))}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
