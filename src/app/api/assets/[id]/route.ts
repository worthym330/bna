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

  const asset = await prisma.documentAsset.findUnique({
    where: { id: params.id, organizationId: organization.id }
  });

  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const drive = await getDriveClient(organization.id);

    const response = await drive.files.get(
      { fileId: asset.driveFileId, alt: "media" },
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
        "Content-Type": asset.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(asset.name)}`
      }
    });
  } catch (err) {
    console.error("Error streaming file from Drive:", err);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
