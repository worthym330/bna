import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];

import prisma from "./prisma";
import { Readable } from "stream";

export async function getDriveClient(organizationId: string) {
  const creds = await prisma.googleCredential.findUnique({
    where: { organizationId },
  });

  if (!creds) {
    throw new Error("Google Drive not connected");
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  client.setCredentials({
    access_token: creds.accessToken,
    refresh_token: creds.refreshToken,
    expiry_date: creds.expiryDate.getTime(),
  });

  // Handle token refresh automatically
  client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await prisma.googleCredential.update({
        where: { organizationId },
        data: {
          accessToken: tokens.access_token,
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
          ...(tokens.expiry_date && { expiryDate: new Date(tokens.expiry_date) }),
        },
      });
    }
  });

  return google.drive({ version: "v3", auth: client });
}

export async function ensureOrganizationFolder(organizationId: string) {
  const drive = await getDriveClient(organizationId);
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  
  const folderName = `BNA_${org?.legalName.replace(/[^a-zA-Z0-9]/g, "_")}`;

  // Check if folder exists
  const response = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    fields: "files(id, name)",
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Create folder
  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };
  
  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: "id",
  });

  return folder.data.id!;
}

export async function uploadAsset(
  organizationId: string, 
  fileBuffer: Buffer, 
  fileName: string, 
  mimeType: string,
  assetType: "LETTERHEAD" | "SIGNATURE" | "STAMP"
) {
  const drive = await getDriveClient(organizationId);
  const folderId = await ensureOrganizationFolder(organizationId);

  // Convert buffer to readable stream
  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: mimeType,
    body: stream,
  };

  const driveFile = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id",
  });

  const documentAsset = await prisma.documentAsset.create({
    data: {
      organizationId,
      name: fileName,
      type: assetType,
      driveFileId: driveFile.data.id!,
      mimeType,
    },
  });

  return documentAsset;
}

export async function uploadBufferToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  organizationId: string
) {
  const drive = await getDriveClient(organizationId);
  const folderId = await ensureOrganizationFolder(organizationId);

  // Convert buffer to readable stream
  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: mimeType,
    body: stream,
  };

  const driveFile = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id",
  });

  return driveFile.data.id!;
}

export async function getDriveFileAsDataUri(fileId: string, mimeType: string, organizationId: string): Promise<string | null> {
  try {
    const drive = await getDriveClient(organizationId);
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );
    const base64 = Buffer.from(response.data as ArrayBuffer).toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (err) {
    console.error(`Failed to get drive file ${fileId} as Data URI:`, err);
    return null;
  }
}
