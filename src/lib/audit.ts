import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";

export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  previousValue?: any,
  newValue?: any
) {
  try {
    const { user, organization } = await getTenantSession();

    if (!organization) return;

    await prisma.auditLog.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        action,
        entityType,
        entityId,
        previousValue: previousValue !== undefined ? previousValue : undefined,
        newValue: newValue !== undefined ? newValue : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // We don't want audit logging failures to break the main application flow
  }
}
