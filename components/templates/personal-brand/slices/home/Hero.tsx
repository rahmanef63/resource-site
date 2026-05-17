import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { HERO_IMG } from "./home-data";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image src={HERO_IMG} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/85 to-background" />
        <div className="absolute -right-40 top-32 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-6xl px-6 pt-24 pb-28 md:pt-32 md:pb-36">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
          <Sparkles className="mr-1 size-3" /> 2026 mentorship cohort open
        </Badge>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Tempor incididunt ut labore et dolore magna aliqua — strategi produk, mentorship engineer, dan riset go-to-market untuk founder &amp; tim Indonesia.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href={`${PUBLIC_BASE}/services`}>Lihat layanan <ArrowRight className="size-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`${PUBLIC_BASE}/portfolio`}>Karya terpilih</Link>
          </Button>
        </div>
        <p className="mt-12 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Trusted by — Acme · Foobar · Beta Labs · Gamma · Delta · Zeta
        </p>
      </div>
    </section>
  );
}
