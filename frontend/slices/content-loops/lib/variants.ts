/** Return the variant slot for item `index`, preserving round-robin order. */
export function loopVariantIndex(index: number, variantCount: number): number {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("[content-loops] item index must be a non-negative integer.");
  }
  if (!Number.isInteger(variantCount) || variantCount <= 0) {
    throw new Error("[content-loops] at least one variant is required.");
  }
  return index % variantCount;
}
