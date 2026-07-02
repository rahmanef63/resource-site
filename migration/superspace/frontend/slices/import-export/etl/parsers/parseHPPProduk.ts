/**
 * Parser sheet "HITUNGAN HPP PRODUK" + "FOOD COST ITEM KELAS 2/3A/3B/4"
 *
 * Struktur HITUNGAN HPP PRODUK (~320 rows):
 *   - Product header row (nama produk di col 0/1, biasanya bold/merged)
 *   - Ingredient rows di bawahnya: nama bahan, qty, satuan, harga/unit, subtotal
 *   - Total HPP row di akhir setiap blok produk
 *
 * State machine approach:
 *   scanning → detect product header → in_product → collect ingredients → emit
 *
 * FOOD COST ITEM KELAS sheets: identik strukturnya tapi dengan harga jual berbeda.
 */

import { getSheetRows, toNumber } from "../lib/xlsxHelpers";
import type XLSX from "xlsx";

export type HPPIngredient = {
  name: string;
  qty: number;
  unit: string;
  unitCost: number;
  subtotal: number;
};

export type ProductHPPItem = {
  productName: string;
  pricingClass: "standard" | "kelas2" | "kelas3a" | "kelas3b" | "kelas4";
  totalHPP: number;
  sellingPrice?: number;
  ingredients: HPPIngredient[];
};

const CLASS_PATTERNS: { pattern: RegExp; cls: ProductHPPItem["pricingClass"] }[] = [
  { pattern: /KELAS\s*3\s*A/i, cls: "kelas3a" },
  { pattern: /KELAS\s*3\s*B/i, cls: "kelas3b" },
  { pattern: /KELAS\s*4/i, cls: "kelas4" },
  { pattern: /KELAS\s*2/i, cls: "kelas2" },
];

function detectClass(sheetName: string): ProductHPPItem["pricingClass"] {
  for (const { pattern, cls } of CLASS_PATTERNS) {
    if (pattern.test(sheetName)) return cls;
  }
  return "standard";
}

export function parseHPPProduk(wb: XLSX.WorkBook): ProductHPPItem[] {
  const result: ProductHPPItem[] = [];

  // Find all relevant sheets
  const sheets: { name: string; cls: ProductHPPItem["pricingClass"] }[] = [];

  for (const name of wb.SheetNames) {
    const up = name.toUpperCase();
    if (up.includes("HITUNGAN HPP") || up.includes("HPP PRODUK")) {
      sheets.push({ name, cls: "standard" });
    } else if (up.includes("FOOD COST ITEM KELAS") || up.includes("FC ITEM KELAS")) {
      sheets.push({ name, cls: detectClass(name) });
    }
  }

  for (const { name, cls } of sheets) {
    const items = parseHPPSheet(wb, name, cls);
    result.push(...items);
  }

  return result;
}

function parseHPPSheet(
  wb: XLSX.WorkBook,
  sheetName: string,
  pricingClass: ProductHPPItem["pricingClass"],
): ProductHPPItem[] {
  const rows = getSheetRows(wb, sheetName);
  const result: ProductHPPItem[] = [];

  let currentProduct = "";
  let currentIngredients: HPPIngredient[] = [];
  let currentSellingPrice: number | undefined;
  let inProduct = false;

  // Known product names (Rocket Chicken menu items)
  const PRODUCT_KEYWORDS = [
    "DADA", "PAHA", "SAYAP", "KULIT", "PERKEDEL", "NASI", "BARGUD",
    "PATTY", "BURGER", "CHICKEN", "PAKET", "CRISPY", "COMBO", "SAUS",
    "SAMBAL", "LALAPAN", "KENTANG", "FRENCH", "NUGGET", "GEPREK",
    "ORIGINAL", "SPICY", "FIRE", "HOT", "COLA", "TEH", "JERUK", "MILO",
  ];

  const isProductHeader = (row: (string | number | Date | null | boolean)[]): boolean => {
    const name = String(row[0] ?? row[1] ?? "").toUpperCase().trim();
    if (!name || name.length < 2) return false;

    // Baris produk biasanya: nama produk saja, atau nama + harga jual
    // Baris ingredient: nama bahan + qty + satuan + harga + subtotal (banyak kolom numerik)
    const numericCols = row.slice(2).filter((v) => toNumber(v) > 0).length;

    // Product header usually has <= 2 numeric values (maybe selling price and total)
    // Ingredient rows have 3+ numeric values (qty, unitCost, subtotal)
    const hasProductKeyword = PRODUCT_KEYWORDS.some((k) => name.includes(k));

    // Also detect if it looks like a section header
    if (hasProductKeyword && numericCols <= 2) return true;

    // Check for NO column (numbered products)
    const firstNum = toNumber(row[0]);
    if (firstNum > 0 && firstNum < 200) {
      const nameCol = String(row[1] ?? "").trim();
      if (nameCol.length >= 3 && numericCols <= 3) return true;
    }

    return false;
  };

  const emitProduct = () => {
    if (currentProduct && currentIngredients.length > 0) {
      const totalHPP = currentIngredients.reduce((s, ing) => s + ing.subtotal, 0);
      result.push({
        productName: currentProduct,
        pricingClass,
        totalHPP,
        sellingPrice: currentSellingPrice,
        ingredients: [...currentIngredients],
      });
    }
    currentProduct = "";
    currentIngredients = [];
    currentSellingPrice = undefined;
    inProduct = false;
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const label = String(row[0] ?? row[1] ?? "").toUpperCase().trim();

    // Skip empty rows
    if (!label && !row.some((v) => v !== null && v !== "")) continue;

    // Stop at grand total
    if (label.includes("GRAND TOTAL")) {
      emitProduct();
      break;
    }

    // Detect "TOTAL" row for current product — emit and reset
    if (label.includes("TOTAL") && inProduct) {
      // The total row might have the total HPP value
      const totalVal = row.slice(2).map((v) => toNumber(v)).find((v) => v > 0);
      if (totalVal && currentIngredients.length > 0) {
        // Use computed total from ingredients, but could also use this value
      }
      emitProduct();
      continue;
    }

    // Detect HPP/HARGA JUAL labels
    if (label.includes("HARGA JUAL") || label.includes("SELLING PRICE")) {
      const price = row.slice(1).map((v) => toNumber(v)).find((v) => v > 0);
      if (price) currentSellingPrice = price;
      continue;
    }

    // Check if this is a product header
    if (isProductHeader(row)) {
      if (inProduct) emitProduct(); // emit previous product
      currentProduct = String(row[1] ?? row[0] ?? "").trim();
      inProduct = true;

      // Check if selling price is on same row (last column with large value)
      const vals = row.slice(2).map((v) => toNumber(v));
      const largeVal = vals.find((v) => v >= 1000);
      if (largeVal) currentSellingPrice = largeVal;
      continue;
    }

    // Parse ingredient row if we're inside a product block
    if (inProduct) {
      const ingredientName = String(row[1] ?? row[0] ?? "").trim();
      if (!ingredientName) continue;

      // Skip if it's a sub-header or label
      const ingUpper = ingredientName.toUpperCase();
      if (ingUpper.includes("TOTAL") || ingUpper.includes("JUMLAH") ||
          ingUpper === "NO" || ingUpper === "BAHAN" || ingUpper === "KETERANGAN") continue;

      // Find qty, unit, unitCost, subtotal from remaining columns
      let qty = 0;
      let unit = "";
      let unitCost = 0;
      let subtotal = 0;
      let numericIdx = 0;

      for (let c = 2; c < Math.min(row.length, 12); c++) {
        const cellStr = String(row[c] ?? "").trim();
        const val = toNumber(row[c]);

        if (typeof row[c] === "string" && cellStr.match(/^[a-zA-Z]{1,6}$/i)) {
          unit = cellStr; // e.g., "gr", "pcs", "ml", "kg"
        } else if (val > 0 || (typeof row[c] === "number" && row[c] !== null)) {
          if (numericIdx === 0) qty = val;
          else if (numericIdx === 1) unitCost = val;
          else if (numericIdx === 2) subtotal = val;
          numericIdx++;
        }
      }

      // If subtotal is 0 but we have qty and unitCost, compute it
      if (subtotal === 0 && qty > 0 && unitCost > 0) {
        subtotal = qty * unitCost;
      }

      if (subtotal > 0 || (qty > 0 && unitCost > 0)) {
        currentIngredients.push({
          name: ingredientName,
          qty,
          unit: unit || "pcs",
          unitCost,
          subtotal,
        });
      }
    }
  }

  // Emit last product if any
  emitProduct();

  return result;
}
