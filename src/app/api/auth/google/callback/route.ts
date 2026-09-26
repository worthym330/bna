import { NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "@/lib/drive";
import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { organization } = await getTenantSession();
    
    if (!organization) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/settings?error=missing_code", req.url));
    }

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
       // If we don't get a refresh token, it means the user has authorized before.
       // We'd need to force them to revoke access or handle this gracefully.
       console.error("Missing refresh token in Google OAuth response", tokens);
       return NextResponse.redirect(new URL("/settings?error=missing_refresh_token", req.url));
    }

    await prisma.googleCredential.upsert({
      where: { organizationId: organization!.id },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date),
      },
      create: {
        organizationId: organization!.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date),
      },
    });

    return NextResponse.redirect(new URL("/settings?success=drive_connected", req.url));
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    return NextResponse.redirect(new URL("/settings?error=oauth_failed", req.url));
  }
}
