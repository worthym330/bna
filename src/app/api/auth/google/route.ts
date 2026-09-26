import { NextRequest, NextResponse } from "next/server";
import { oauth2Client, SCOPES } from "@/lib/drive";

export async function GET(req: NextRequest) {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
  return NextResponse.redirect(url);
}
