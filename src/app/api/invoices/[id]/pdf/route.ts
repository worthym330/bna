import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDriveClient } from "@/lib/drive";
import { getTenantSession } from "@/lib/auth";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { organization } = await getTenantSession();
  
  if (!organization) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id, organizationId: organization.id }
  });

  if (!invoice || !invoice.driveFileId) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  try {
    const drive = await getDriveClient(organization.id);

    const response = await drive.files.get(
      { fileId: invoice.driveFileId, alt: "media" },
      { responseType: "stream" }
    );

    const webStream = new ReadableStream({
      start(controller) {
        response.data.on("data", (chunk: any) => controller.enqueue(chunk));
        response.data.on("end", () => controller.close());
        response.data.on("error", (err: any) => controller.error(err));
      }
    });

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(`${invoice.invoiceNumber || 'invoice'}.pdf`)}`
      }
    });
  } catch (err) {
    console.error("Error streaming PDF from Drive:", err);
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 });
  }
}
