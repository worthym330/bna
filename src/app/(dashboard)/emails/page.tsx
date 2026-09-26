import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { EmailLogsClient } from "./email-logs-client";
import { getRecentEmails } from "@/lib/gmail";

export default async function EmailsPage() {
  const { organization } = await getTenantSession();

  const logs = await prisma.emailLog.findMany({
    where: { organizationId: organization!.id },
    orderBy: { sentAt: 'desc' }
  });

  let inbox: any[] = [];
  try {
    const res = await getRecentEmails(organization!.id);
    inbox = res.emails || [];
  } catch (error) {
    console.error("Failed to fetch inbox:", error);
  }

  return <EmailLogsClient organizationId={organization!.id} logs={logs} inbox={inbox} />;
}
