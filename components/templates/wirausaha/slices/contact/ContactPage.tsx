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
        title="Hubungi kami"
        subtitle="Untuk pertanyaan kerjasama, supplier, atau partnership multi-unit."
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
                <Label className="text-xs">No. WhatsApp</Label>
                <Input placeholder="+62..." className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" placeholder="email@kamu.com" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Topik</Label>
              <Input placeholder="Kerjasama / supplier / lainnya" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Pesan</Label>
              <Textarea rows={5} placeholder="Detail pertanyaan..." className="mt-1" />
            </div>
            <Button className="w-full">Kirim pesan</Button>
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
                <p className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp</p>
                <p>+62 812-3456-7890</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Alamat</p>
                <p>Jl. Lorem No. 42, Bandung</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
