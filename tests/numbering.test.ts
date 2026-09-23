import { describe, it, expect, beforeEach, afterEach } from "vitest";
import prisma from "../src/lib/prisma";
import { getNextInvoiceNumber } from "../src/lib/numbering";

describe("Numbering Engine Concurrency", () => {
  let orgId: string;
  let seriesId: string;

  beforeEach(async () => {
    // Setup a clean organization and series
    const org = await prisma.organization.create({
      data: {
        legalName: "Test Concurrency Org",
        displayName: "Test Concurrency Org",
      },
    });
    orgId = org.id;

    const series = await prisma.invoiceSeries.create({
      data: {
        organizationId: orgId,
        name: "Standard FY23-24",
        prefix: "INV-",
        suffix: "-BOM",
        padding: 4,
        currentSequence: 0,
      },
    });
    seriesId = series.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.invoiceSeries.deleteMany({ where: { organizationId: orgId } });
    await prisma.organization.deleteMany({ where: { id: orgId } });
  });

  it("should generate consecutive numbers without duplicates under concurrent load", async () => {
    const NUM_REQUESTS = 50;
    
    // Fire all requests simultaneously
    const promises = Array.from({ length: NUM_REQUESTS }).map(() =>
      getNextInvoiceNumber(seriesId, orgId)
    );

    const results = await Promise.all(promises);

    // Ensure all 50 resolved to a string
    expect(results).toHaveLength(NUM_REQUESTS);
    
    // Sort them
    const sorted = [...results].sort();

    // Verify format and consecutive numbering
    for (let i = 0; i < NUM_REQUESTS; i++) {
      const expectedNumber = String(i + 1).padStart(4, "0");
      const expectedFullString = `INV-${expectedNumber}-BOM`;
      expect(sorted[i]).toBe(expectedFullString);
    }
    
    // Verify no duplicates
    const uniqueResults = new Set(results);
    expect(uniqueResults.size).toBe(NUM_REQUESTS);

    // Verify DB state
    const updatedSeries = await prisma.invoiceSeries.findUnique({
      where: { id: seriesId }
    });
    expect(updatedSeries?.currentSequence).toBe(NUM_REQUESTS);
  });
});
