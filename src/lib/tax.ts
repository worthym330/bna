export type TaxBreakdown = {
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
};

/**
 * Calculates the tax breakdown for a given amount.
 * In India:
 * - If the provider and client are in the same state: CGST + SGST (split equally).
 * - If they are in different states: IGST (full rate).
 */
export function calculateLineItemTax(
  amount: number,
  taxRatePercent: number,
  taxType: "CGST_SGST" | "IGST"
): TaxBreakdown {
  const totalTax = (amount * taxRatePercent) / 100;

  if (taxType === "IGST") {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      totalTax
    };
  } else {
    const halfTax = totalTax / 2;
    return {
      cgst: halfTax,
      sgst: halfTax,
      igst: 0,
      totalTax
    };
  }
}
