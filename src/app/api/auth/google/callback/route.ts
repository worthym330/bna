import { NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "@/lib/drive";
import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { user, organization } = await getTenantSession();

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const redirectUrl = user.isSuperAdmin ? "/super-admin" : "/settings";

    if (!code) {
      return NextResponse.redirect(new URL(`${redirectUrl}?error=missing_code`, req.url));
    }

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
       console.error("Missing refresh token in Google OAuth response", tokens);
       return NextResponse.redirect(new URL(`${redirectUrl}?error=missing_refresh_token`, req.url));
    }

    if (user.isSuperAdmin) {
      await prisma.googleCredential.upsert({
        where: { userId: user.id },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: new Date(tokens.expiry_date),
        },
        create: {
          userId: user.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: new Date(tokens.expiry_date),
        },
      });
      return NextResponse.redirect(new URL(`${redirectUrl}?success=drive_connected`, req.url));
    } else if (organization) {
      await prisma.googleCredential.upsert({
        where: { organizationId: organization.id },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: new Date(tokens.expiry_date),
        },
        create: {
          organizationId: organization.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: new Date(tokens.expiry_date),
        },
      });
      return NextResponse.redirect(new URL(`${redirectUrl}?success=drive_connected`, req.url));
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    return NextResponse.redirect(new URL("/?error=oauth_failed", req.url));
  }
}
