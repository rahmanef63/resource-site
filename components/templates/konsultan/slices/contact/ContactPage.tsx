"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";

export function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <SectionHead
        eyebrow="Kontak"
        title="Konsultasi gratis 30 menit"
        subtitle="Ceritakan tantangan tim/perusahaan Anda — kami akan kembali dalam 2 hari kerja."
      />

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="space-y-3 p-6">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label className="text-xs">Nama</Label>
                <Input placeholder="Nama lengkap" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Perusahaan</Label>
                <Input placeholder="Nama perusahaan" className="mt-1" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label className="text-xs">Email</Label>
                <Input type="email" placeholder="email@perusahaan.com" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">No. WhatsApp</Label>
                <Input placeholder="+62..." className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Topik konsultasi</Label>
              <Input placeholder="Strategi / Operasi / Org / Lainnya" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Detail tantangan</Label>
              <Textarea rows={5} placeholder="Ceritakan situasi dan goal..." className="mt-1" />
            </div>
            <Button className="w-full">Kirim brief</Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="space-y-4 p-6 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                <p>{DEFAULT_SITE_CONFIG.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Telepon</p>
                <p>+62 21-555-1234</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Kantor</p>
                <p>SCBD Lot 3, Jakarta Selatan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
