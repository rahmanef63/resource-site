"use client"

import * as React from "react"
import {
  ShoppingCart,
  Package,
  Tag,
  Receipt,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLocale } from "@/lib/i18n/LocaleProvider"
import { cn } from "@/lib/utils"

type StepId = 1 | 2 | 3

const COPY = {
  id: {
    eyebrow: "Selamat datang di POS",
    title: "Mulai jualan dalam 3 langkah",
    sub: "Setup cepat — bisa diubah kapanpun. Bisa lewati & isi nanti.",
    skip: "Lewati & lihat dashboard kosong",
    s1Title: "Tambah menu/produk pertama",
    s1Desc: "Cukup nama dan harga. Detail bisa lengkapi nanti.",
    s1Name: "Nama produk",
    s1Price: "Harga (Rp)",
    s1Add: "Tambah produk",
    s1OrTpl: "Atau import dari template",
    s2Title: "Atur kategori",
    s2Desc: "Bantu cari menu cepat di kasir. Lewati kalau belum perlu.",
    s2Skip: "Lewati langkah ini",
    s3Title: "Buka transaksi pertama",
    s3Desc: "Layar kasir aktif. Tap menu untuk masukin ke order.",
    s3Cta: "Buka kasir",
    next: "Lanjut",
    back: "Kembali",
    progress: (cur: number) => `Langkah ${cur} dari 3`,
    addedToast: (n: string) => `"${n}" ditambah!`,
  },
  en: {
    eyebrow: "Welcome to POS",
    title: "Start selling in 3 steps",
    sub: "Quick setup — change anytime. You can skip and come back later.",
    skip: "Skip & see empty dashboard",
    s1Title: "Add your first menu/product",
    s1Desc: "Just name and price. Add details later.",
    s1Name: "Product name",
    s1Price: "Price (IDR)",
    s1Add: "Add product",
    s1OrTpl: "Or import from template",
    s2Title: "Setup categories",
    s2Desc: "Help cashier find items fast. Skip if not needed yet.",
    s2Skip: "Skip this step",
    s3Title: "Open first transaction",
    s3Desc: "Cashier screen is live. Tap menu to add to order.",
    s3Cta: "Open register",
    next: "Next",
    back: "Back",
    progress: (cur: number) => `Step ${cur} of 3`,
    addedToast: (n: string) => `"${n}" added!`,
  },
}

interface PosEmptyStateWizardProps {
  onSkip: () => void
  onComplete: () => void
}

export function PosEmptyStateWizard({ onSkip, onComplete }: PosEmptyStateWizardProps) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [step, setStep] = React.useState<StepId>(1)
  const [productName, setProductName] = React.useState("")
  const [productPrice, setProductPrice] = React.useState("")
  const [addedProducts, setAddedProducts] = React.useState<Array<{ name: string; price: string }>>([])

  const handleAddProduct = () => {
    const name = productName.trim()
    const price = productPrice.trim()
    if (!name || !price) return
    setAddedProducts((prev) => [...prev, { name, price }])
    setProductName("")
    setProductPrice("")
  }

  const canProceedFromStep1 = addedProducts.length > 0

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          {c.eyebrow}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{c.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{c.sub}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{c.progress(step)}</span>
          <span>{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                s <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Package className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">{c.s1Title}</h2>
                <p className="text-sm text-muted-foreground">{c.s1Desc}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
              <Input
                placeholder={c.s1Name}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddProduct()}
              />
              <Input
                type="number"
                inputMode="numeric"
                placeholder={c.s1Price}
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddProduct()}
              />
              <Button onClick={handleAddProduct} disabled={!productName.trim() || !productPrice.trim()}>
                {c.s1Add}
              </Button>
            </div>

            {addedProducts.length > 0 && (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <ul className="space-y-1.5 text-sm">
                  {addedProducts.map((p, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        {p.name}
                      </span>
                      <span className="font-medium tabular-nums text-muted-foreground">
                        Rp {Number(p.price).toLocaleString("id-ID")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground">{c.s1OrTpl}</p>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                <Tag className="size-5 text-violet-500" />
              </div>
              <div>
                <h2 className="font-semibold">{c.s2Title}</h2>
                <p className="text-sm text-muted-foreground">{c.s2Desc}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(locale === "id"
                ? ["Makanan", "Minuman", "Snack", "Paket"]
                : ["Food", "Drinks", "Snacks", "Combos"]
              ).map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs"
                >
                  {cat}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <Receipt className="size-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="font-semibold">{c.s3Title}</h2>
                <p className="text-sm text-muted-foreground">{c.s3Desc}</p>
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
              <ShoppingCart className="mx-auto mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {locale === "id"
                  ? `${addedProducts.length} produk siap dijual`
                  : `${addedProducts.length} products ready to sell`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer controls */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          {c.skip}
        </Button>
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as StepId)}>
              {c.back}
            </Button>
          )}
          {step < 3 ? (
            <Button aria-label="Forward"
              onClick={() => setStep((s) => (s + 1) as StepId)}
              disabled={step === 1 && !canProceedFromStep1}
              className="gap-1.5"
            >
              {step === 2 ? (
                <>
                  {c.s2Skip}
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  {c.next}
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={onComplete} className="gap-1.5">
              {c.s3Cta}
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
