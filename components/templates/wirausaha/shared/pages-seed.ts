import type { PageEntry } from "@/components/templates/_shared/pages/types";
import { PUBLIC_BASE } from "./nav-config";

const now = Date.now();
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

/**
 * SEED_PAGES — system pages mirror existing public JSX routes (read-only
 * in admin). Custom seed pages show off the block renderer end-to-end.
 */
export const SEED_PAGES: PageEntry[] = [
  {
    id: "sys-home",
    slug: "",
    title: "Home",
    description: "Wirausaha landing — value prop, sample menu, CTA.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  {
    id: "sys-services",
    slug: "services",
    title: "Services",
    description: "Apa yang ditawarkan — daftar produk dan jasa.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  {
    id: "sys-contact",
    slug: "contact",
    title: "Contact",
    description: "WhatsApp, alamat, jam operasional.",
    blocks: [],
    status: "published",
    createdAt: day(180),
    updatedAt: day(180),
    systemPage: true,
  },
  // Custom starter page.
  {
    id: "custom-promo",
    slug: "promo",
    title: "Promo bulan ini",
    description: "Diskon, paket bundling, dan flash sale.",
    blocks: [
      { kind: "hero", headline: "Promo Mei 2026", sub: "Hemat sampai 25% untuk pembelian paket." },
      { kind: "feature-list", heading: "Paket spesial", items: [
        { title: "Paket Hemat", body: "5 item populer + free ongkir dalam kota." },
        { title: "Paket Keluarga", body: "Cukup buat 4–6 orang, hemat 15%." },
        { title: "Paket Reseller", body: "Min. order 30 pcs, harga grosir + retur." },
      ]},
      { kind: "stats", heading: "Customer kami", items: [
        { value: "1.2K", label: "pelanggan aktif" },
        { value: "4.9", label: "rating Google" },
        { value: "<30 mnt", label: "antar dalam kota" },
      ]},
      { kind: "cta", headline: "Order sekarang via WhatsApp", cta: { label: "Hubungi kami", href: `${PUBLIC_BASE}/contact` } },
    ],
    status: "published",
    createdAt: day(8),
    updatedAt: day(1),
    systemPage: false,
  },
];
