"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { anyApi } from "convex/server";
import type { Id } from "@convex/_generated/dataModel";

import { parseExcelFile } from "../lib/xlsxHelpers";
import { extractPeriod } from "../lib/extractPeriod";
import { validateParsedData, type ValidationWarning } from "../lib/validateParsedData";
import {
  parsePenjualan, parsePlatformSales, parseVendor, parseWeeklyFC,
  parseLeftOver, parseLaporanKasPeriode, parseSalesControl, parsePembelianKredit,
  parseIkhtisarFC, parseTransferTOTI, parseHPPProduk, parseCostAnalysis,
  parseLapCF, parseInsentif, parseLPKK,
  type ProductSaleItem, type VendorPurchaseItem, type InventoryValuationItem,
  type LeftOverItem, type DailyCashSummaryItem, type SalesControlItem,
  type CreditPurchaseItem, type FoodCostSummaryItem, type TransferItem,
  type ProductHPPItem, type CostAnalysisItem, type DailyCashFlowItem,
  type IncentiveItem, type LPKKItem,
} from "../parsers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny: any = anyApi;

export type ParsedEtlData = {
  fileName: string;
  periodStart: string;
  periodEnd: string;
  lpkk: LPKKItem[];
  penjualan: ProductSaleItem[];
  platformSales: ProductSaleItem[];
  vendor: VendorPurchaseItem[];
  weeklyFc: InventoryValuationItem[];
  leftover: LeftOverItem[];
  kasPeriode: DailyCashSummaryItem[];
  salesControl: SalesControlItem[];
  pembelianKredit: CreditPurchaseItem[];
  ikhtisarFC: FoodCostSummaryItem[];
  transferTOTI: TransferItem[];
  hppProduk: ProductHPPItem[];
  costAnalysis: CostAnalysisItem[];
  cashFlow: DailyCashFlowItem[];
  insentif: IncentiveItem[];
};

export type EtlImportPhase = "idle" | "parsing" | "ready" | "uploading" | "done" | "error";

export function useEtlImport(workspaceId: Id<"workspaces"> | null | undefined) {
  const [phase, setPhase] = useState<EtlImportPhase>("idle");
  const [parsed, setParsed] = useState<ParsedEtlData | null>(null);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: "" });
  const [result, setResult] = useState<Record<string, number> | null>(null);

  const createReport = useMutation(apiAny.features.importExport.etl.createReport);
  const importSales = useMutation(apiAny.features.importExport.etl.importSalesBatch);
  const importVendor = useMutation(apiAny.features.importExport.etl.importVendorBatch);
  const importCashFlow = useMutation(apiAny.features.importExport.etl.importCashFlowBatch);
  const importInventory = useMutation(apiAny.features.importExport.etl.importInventoryBatch);
  const importLeftover = useMutation(apiAny.features.importExport.etl.importLeftoverBatch);
  const finalizeReport = useMutation(apiAny.features.importExport.etl.finalizeReport);

  const handleFile = useCallback(async (file: File) => {
    setPhase("parsing");
    setResult(null);
    try {
      const wb = await parseExcelFile(file);
      const { start: periodStart, end: periodEnd } = extractPeriod(file.name);

      const data: ParsedEtlData = {
        fileName: file.name,
        periodStart,
        periodEnd,
        lpkk: parseLPKK(wb),
        penjualan: parsePenjualan(wb),
        platformSales: parsePlatformSales(wb),
        vendor: parseVendor(wb),
        weeklyFc: parseWeeklyFC(wb),
        leftover: parseLeftOver(wb),
        kasPeriode: parseLaporanKasPeriode(wb),
        salesControl: periodStart ? parseSalesControl(wb, periodStart, periodEnd) : [],
        pembelianKredit: parsePembelianKredit(wb),
        ikhtisarFC: parseIkhtisarFC(wb),
        transferTOTI: parseTransferTOTI(wb),
        hppProduk: parseHPPProduk(wb),
        costAnalysis: parseCostAnalysis(wb),
        cashFlow: parseLapCF(wb),
        insentif: parseInsentif(wb),
      };

      const w = validateParsedData(
        {
          penjualan: data.penjualan,
          platformSales: data.platformSales,
          vendor: data.vendor,
          hppProduk: data.hppProduk,
          costAnalysis: data.costAnalysis,
          cashFlow: data.cashFlow,
          kasPeriode: data.kasPeriode,
          periodStart,
          periodEnd,
        },
        file.name,
      );

      setParsed(data);
      setWarnings(w);
      setPhase("ready");
    } catch (err) {
      console.error("[etl] parse failed", err);
      toast.error("Gagal parse file Excel — pastikan format sesuai template.");
      setPhase("error");
    }
  }, []);

  const startImport = useCallback(async () => {
    if (!parsed || !workspaceId) return;
    setPhase("uploading");
    setProgress({ current: 0, total: 6, label: "Membuat report" });

    try {
      const { id: reportId } = await createReport({
        workspaceId,
        fileName: parsed.fileName,
        periodStart: parsed.periodStart,
        periodEnd: parsed.periodEnd,
        validationNotes: warnings.map((w) => ({
          severity: w.severity,
          category: w.category,
          message: w.message,
          tip: w.tip,
        })),
      });

      const tally: Record<string, number> = {};

      const allSales = [...parsed.penjualan, ...parsed.platformSales];
      if (allSales.length) {
        setProgress({ current: 1, total: 6, label: "Import penjualan" });
        const r = await importSales({ workspaceId, reportId, items: allSales });
        tally.sales = r.inserted;
      }
      if (parsed.vendor.length) {
        setProgress({ current: 2, total: 6, label: "Import vendor" });
        const r = await importVendor({ workspaceId, reportId, items: parsed.vendor });
        tally.vendor = r.inserted;
      }
      if (parsed.cashFlow.length) {
        setProgress({ current: 3, total: 6, label: "Import cash flow" });
        const r = await importCashFlow({ workspaceId, reportId, items: parsed.cashFlow });
        tally.cashFlow = r.inserted;
      }
      if (parsed.weeklyFc.length) {
        setProgress({ current: 4, total: 6, label: "Import inventory" });
        const r = await importInventory({ workspaceId, reportId, items: parsed.weeklyFc });
        tally.inventory = r.inserted;
      }
      if (parsed.leftover.length) {
        setProgress({ current: 5, total: 6, label: "Import leftover" });
        const r = await importLeftover({ workspaceId, reportId, items: parsed.leftover });
        tally.leftover = r.inserted;
      }

      setProgress({ current: 6, total: 6, label: "Finalize" });
      await finalizeReport({ workspaceId, reportId, status: "processed" });

      setResult(tally);
      setPhase("done");
      toast.success("Import selesai.");
    } catch (err) {
      console.error("[etl] import failed", err);
      toast.error("Import gagal — cek console.");
      setPhase("error");
    }
  }, [parsed, warnings, workspaceId, createReport, importSales, importVendor, importCashFlow, importInventory, importLeftover, finalizeReport]);

  const reset = useCallback(() => {
    setParsed(null);
    setWarnings([]);
    setResult(null);
    setProgress({ current: 0, total: 0, label: "" });
    setPhase("idle");
  }, []);

  return { phase, parsed, warnings, progress, result, handleFile, startImport, reset };
}
