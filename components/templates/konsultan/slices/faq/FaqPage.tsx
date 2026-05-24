"use client";

import * as React from "react";
import Link from "next/link";
import { HelpCircle, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { SEED_FAQ } from "../../shared/faq-seed";
import type { FaqCategory } from "../../shared/types";

const CATEGORIES: { value: FaqCategory; label: string; hint: string }[] = [
  { value: "Umum", label: "Umum", hint: "Tentang praktik" },
  { value: "Pricing", label: "Pricing", hint: "Biaya & invoice" },
  { value: "Proses", label: "Proses", hint: "Cara kami kerja" },
  { value: "Engagement", label: "Engagement", hint: "Kontrak & legal" },
];

export function FaqPage() {
  const grouped = React.useMemo(() => {
    const map = new Map<FaqCategory, typeof SEED_FAQ>();
    for (const cat of CATEGORIES) map.set(cat.value, []);
    for (const item of SEED_FAQ) {
      const arr = map.get(item.category);
      if (arr) arr.push(item);
    }
    return map;
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <SectionHead
        align="center"
        eyebrow="FAQ"
        title="Pertanyaan yang sering ditanya"
        subtitle={`${SEED_FAQ.length} pertanyaan — dikelompokkan jadi 4 kategori. Tidak menemukan jawaban? Tanya langsung via Contact.`}
      />

      <Tabs defaultValue="Umum" className="mt-10">
        <TabsList className="mx-auto mb-6 grid w-full max-w-2xl grid-cols-2 md:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="text-xs md:text-sm">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => {
          const items = grouped.get(cat.value) ?? [];
          return (
            <TabsContent key={cat.value} value={cat.value} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {cat.hint}
                </p>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {items.length} pertanyaan
                </Badge>
              </div>
              <Card className="border-border/60 bg-card/60">
                <CardContent className="p-2 md:p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {items.map((item) => (
                      <AccordionItem key={item.id} value={item.id}>
                        <AccordionTrigger className="text-left text-sm md:text-base">
                          <span className="flex items-start gap-3">
                            <HelpCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <span>{item.question}</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pl-7 text-sm leading-relaxed text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="mt-16">
        <Card className="border-border/60 bg-gradient-to-br from-violet-500/10 via-card/60 to-amber-500/10">
          <CardContent className="grid gap-6 p-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="size-4 text-violet-400" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Masih ragu?
                </span>
              </div>
              <h3 className="text-xl font-semibold tracking-tight">
                Discovery call gratis 30 menit.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ceritakan tantangan Anda — kami sketsa opsi engagement plus
                kisaran biaya. Tidak ada commitment dari kedua sisi.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <Button asChild className="w-full md:w-auto">
                <Link href={`${PUBLIC_BASE}/contact`}>
                  <MessageCircle className="mr-2 size-4" />
                  Mulai konsultasi
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full md:w-auto">
                <Link href={`${PUBLIC_BASE}/services`}>Lihat services</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
