import type { ChangelogEntry } from "@/features/changelog-feed";
import { entries as p1 } from "./part-01";
import { entries as p2 } from "./part-02";
import { entries as p3 } from "./part-03";
import { entries as p4 } from "./part-04";
import { entries as p5 } from "./part-05";
import { entries as p6 } from "./part-06";
import { entries as p7 } from "./part-07";
import { entries as p8 } from "./part-08";
import { entries as p9 } from "./part-09";
import { entries as p10 } from "./part-10";
import { entries as p11 } from "./part-11";
import { entries as p12 } from "./part-12";
import { entries as p13 } from "./part-13";
import { entries as p14 } from "./part-14";

/**
 * Public release history. Split into part files bin-packed by line budget
 * (~300 lines each, newest-first) so no single file is long; this barrel
 * concatenates + re-sorts. Add new entries to the top of part-01; when it
 * outgrows the budget, move the overflow into the next part.
 */
export const releases: ChangelogEntry[] = [...p1, ...p2, ...p3, ...p4, ...p5, ...p6, ...p7, ...p8, ...p9, ...p10, ...p11, ...p12, ...p13, ...p14].sort((a, b) => b.date - a.date);
