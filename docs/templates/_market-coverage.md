# Market Coverage Matrix

Validates the 5-template choice. Target: ≥60% of Indonesian SaaS-buyer segments served by at least one **primary** template.

## Segment definitions

| ID | Segment | Size (ID) | Pain | Current tools |
|---|---|---|---|---|
| S1 | Akademisi & Mahasiswa pascasarjana | ~3M | Riset+nulis terpisah, tools impor mahal | Mendeley + Word + ChatGPT |
| S2 | Profesional & Konsultan | ~5M | Proposal/kontrak/laporan repetitive | Word/Notion + Excel |
| S3 | Content Creator & Penulis | ~2M aktif | Multi-channel chaos, no voice consistency | Notion + Buffer + Canva |
| S4 | Pengusaha UKM | ~64M unit | Manajemen multi-unit pakai WA grup + Excel | Mekari/Jurnal (mahal), Excel |
| S5 | Peneliti & Think Tank/NGO | ~200K | Workflow riset → policy paper terputus | Word + Zotero + email |

## Coverage matrix (✓ secondary · ✓✓✓ primary)

| Segment | T1 Personal Brand | T2 Riset Kit | T3 Kreator Studio | T4 Wirausaha OS | T5 Konsultan OS |
|---|---|---|---|---|---|
| S1 Akademisi | ✓ academic site | **✓✓✓** | ✓ writing assist | — | — |
| S2 Profesional | ✓ presence | ✓ analyst | ✓ copywriter | — | **✓✓✓** |
| S3 Creator | ✓ blog hub | ✓ riset | **✓✓✓** | — | — |
| S4 UKM | ✓ brand | — | ✓ sosmed UKM | **✓✓✓** | ✓ freelancer |
| S5 Peneliti/NGO | ✓ profile | **✓✓✓** | ✓ advokasi | — | ✓ think tank |

**Result:** 5/5 segments have ≥1 primary template. Coverage ~75–80% accounting for sub-segments.

## Tier-2 segments (cover via variant or modular re-skin)

Templates above are **base manifests**. These adjacent segments fork from a base via theme + module subset:

| Tier-2 segment | Base template | Variant adjustments |
|---|---|---|
| 🕌 Komunitas dakwah / religius | T1 + T3 | Tambah jadwal kajian, donasi, tafsir AI |
| 🎓 Edupreneur / course creator | T1 + T3 + T5 | Cohort module, payment gating, completion tracking |
| 🏥 Tenaga medis / klinik kecil | T1 + T4 | Patient module instead of inventory, e-prescription |
| 🏛️ ASN / staf pemerintah | T2 + T5 | Disposisi naskah dinas, klasifikasi arsip |
| 🚀 Founder startup early-stage | T5 | Investor update template, KPI dashboard |
| 🗣️ Coach / mentor / trainer | T1 + T3 | Booking (Cal.com) + voice training |
| 🏘️ Agen properti | T4 | Listing module instead of lodging, lead pipeline |
| 🌏 Diaspora Indonesia | T1 + T3 | Bilingual ID↔EN forced default |
| 🎨 Niche kreator (game/illustrator/musician) | T1 + T3 | Commission queue, gallery slice |
| 📚 Self-publisher | T2 + T3 | Manuscript module, beta-reader workflow |
| 🤝 Komunitas / organisasi | T1 | Multi-author + alumni directory |
| ⚖️ Legal tech (advokat solo) | T5 | Case management instead of project, document automation tier-up |

Tier-2 = post-launch expansion. Manifest stub only after base template ships.

## Gap check (segments NOT covered)

Acknowledged out-of-scope for v1:

- **Education K-12 (sekolah formal)** — too regulated, niche
- **Manufacturing/heavy industry** — needs ERP, not SaaS template
- **Healthcare regulated (rumah sakit besar)** — compliance overhead
- **Banking/fintech regulated** — OJK overhead

These are deliberate skips, not oversights.

## Decision logs

- **5 templates not 3, not 7** — 3 underserves S2/S5, 7 dilutes execution. 5 = sweet spot for solo dev distribution.
- **T4 priority 1** — biggest TAM (S4 ~64M units), strongest founder story (Zian Inn), media-friendly.
- **T3 priority 5** — most competitive segment, ship after others build credibility.
