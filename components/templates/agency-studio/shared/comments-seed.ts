import { SEED_ARTICLES } from "./journal-seed";
import type { Comment } from "./types";

const now = Date.now();
const min = (n: number) => now - n * 60 * 1000;
const hr = (n: number) => now - n * 60 * 60 * 1000;
const day = (n: number) => now - n * 24 * 60 * 60 * 1000;

export const SEED_COMMENTS: Comment[] = [
  {
    id: "cmt-1",
    postId: SEED_ARTICLES[0].id,
    postTitle: SEED_ARTICLES[0].title,
    author: "Visitor",
    email: "buyfollowers@spam.example",
    body: "Buy cheap followers now, http://spam.example — best service in 2026!",
    status: "pending",
    aiFlag: "spam",
    ts: min(35),
  },
  {
    id: "cmt-2",
    postId: SEED_ARTICLES[0].id,
    postTitle: SEED_ARTICLES[0].title,
    author: "Reni Saputri",
    email: "reni@cumulus.example",
    body: "Insight tentang stakeholder interview yang singkat tapi tajam itu yang paling kami butuhkan. Apakah workshop dua-hari masih efektif untuk tim >20?",
    status: "pending",
    aiFlag: null,
    ts: hr(2),
  },
  {
    id: "cmt-3",
    postId: SEED_ARTICLES[1].id,
    postTitle: SEED_ARTICLES[1].title,
    author: "Daniel S.",
    email: "daniel@studio.example",
    body: "Adoption playbook yang kami tunggu. Bagian motion principle = secret sauce — request: panduan kalau tim engineering belum familiar dengan Framer Motion.",
    status: "approved",
    aiFlag: null,
    ts: hr(8),
  },
  {
    id: "cmt-4",
    postId: SEED_ARTICLES[2].id,
    postTitle: SEED_ARTICLES[2].title,
    author: "Maya P.",
    email: "maya@zenith.example",
    body: "Naming sprint dua-hari — kami coba dan berhasil pangkas dari delapan minggu ke tiga. Recommended.",
    status: "approved",
    aiFlag: null,
    ts: day(1),
  },
  {
    id: "cmt-5",
    postId: SEED_ARTICLES[1].id,
    postTitle: SEED_ARTICLES[1].title,
    author: "anon",
    email: "anon@example.com",
    body: "Stupid take, you have no idea what enterprise design ops is.",
    status: "pending",
    aiFlag: "toxic",
    ts: day(2),
  },
  {
    id: "cmt-6",
    postId: SEED_ARTICLES[3].id,
    postTitle: SEED_ARTICLES[3].title,
    author: "Bagas P.",
    email: "bagas@studio.example",
    body: "OKLch + motion tokens — kombinasi yang masih jarang. Saya akan adopsi untuk project Atlas berikutnya, makasih sudah tulis ini.",
    status: "approved",
    aiFlag: null,
    ts: day(3),
  },
  {
    id: "cmt-7",
    postId: SEED_ARTICLES[4].id,
    postTitle: SEED_ARTICLES[4].title,
    author: "Sari L.",
    email: "sari@kira.example",
    body: "Launch site yang ramping memang underrated. Tiga halaman, satu form — kami akan tiru pendekatan ini.",
    status: "approved",
    aiFlag: null,
    ts: day(5),
  },
];
