"use server";
import { oauth2Client, SCOPES } from "@/lib/drive";
import { getTenantSession, requirePermission } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getGoogleAuthUrl() {
  const { user } = await requirePermission("settings.manage");

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force to get refresh token
  });

  return url;
}

export async function listDriveContentsAction(organizationId: string, folderId: string = 'root') {
  try {
    const driveLib = (await import('@/lib/drive'));
    const driveClient = await driveLib.getDriveClient(organizationId);
    const response = await driveClient.files.list({
      pageSize: 50,
      fields: 'nextPageToken, files(id, name, mimeType)',
      orderBy: 'folder, name',
      q: `'${folderId}' in parents and trashed=false`
    });
    return { success: true, files: response.data.files || [] };
  } catch (error) {
    console.error("Failed to list drive contents:", error);
    return { success: false, error: 'Failed to load Drive files' };
  }
}

export async function uploadAssetAction(formData: FormData, assetType: "LETTERHEAD" | "SIGNATURE" | "STAMP") {
  const { organization } = await requirePermission("settings.manage");
  
  if (!organization) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { uploadAsset } = await import("@/lib/drive");

  await uploadAsset(
    organization!.id,
    buffer,
    file.name,
    file.type,
    assetType
  );

  return { success: true };
}

export async function disconnectDriveAction() {
  const { organization } = await requirePermission("settings.manage");
  
  if (!organization) {
    throw new Error("Unauthorized");
  }

  await prisma.googleCredential.delete({
    where: { organizationId: organization.id }
  });
  
  // Optionally update connection ID in organization if needed
  await prisma.organization.update({
    where: { id: organization.id },
    data: { googleConnectionId: null }
  });
  
  return { success: true };
}
