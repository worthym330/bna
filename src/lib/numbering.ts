import prisma from "./prisma";

/**
 * Atomically generates the next formatted invoice number for a given series.
 * Uses a raw PostgreSQL row-level lock (FOR UPDATE) to prevent concurrency issues.
 */
export async function getNextInvoiceNumber(seriesId: string, organizationId: string): Promise<string> {
  return await prisma.$transaction(async (tx) => {
    // Acquire a row-level lock on the InvoiceSeries record
    const seriesList = await tx.$queryRaw<any[]>`
      SELECT * FROM "InvoiceSeries" 
      WHERE "id" = ${seriesId} AND "organizationId" = ${organizationId}
      FOR UPDATE
    `;

    if (!seriesList || seriesList.length === 0) {
      throw new Error("Invoice series not found or unauthorized");
    }

    const series = seriesList[0];
    
    if (!series.isActive) {
      throw new Error("Invoice series is not active");
    }

    // Calculate the next sequence number
    const nextSequence = series.currentSequence + 1;

    // Update the record with the new sequence
    await tx.$executeRaw`
      UPDATE "InvoiceSeries"
      SET "currentSequence" = ${nextSequence}, "updatedAt" = NOW()
      WHERE "id" = ${series.id}
    `;

    // Format the number (e.g., INV/23-24/0001)
    const paddedSequence = String(nextSequence).padStart(series.padding, '0');
    return `${series.prefix}${paddedSequence}${series.suffix}`;
  });
}
