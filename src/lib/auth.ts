import prisma from './prisma'

import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development')

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)

  const cookieStore = await cookies()
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session_token')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secretKey)
    if (!payload.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string }
    })

    return user
  } catch (err) {
    return null
  }
}

export async function getTenantSession() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Find an organization this user belongs to
  let member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { 
      organization: true, 
      role: { 
        include: { 
          permissions: { include: { permission: true } } 
        } 
      } 
    }
  });

  // Since we are building registration, if a user has no org, we will let the UI handle it.
  // For now, return what we have.
  if (!member) {
    if (user.isSuperAdmin) {
      // @ts-ignore - Returning nulls for superadmins who don't need org context
      return { user, organization: null, role: null, permissions: [] };
    }
    throw new Error("No organization found for this user");
  }

  const permissions = member.role?.permissions.map(rp => rp.permission.name) ?? [];

  return {
    user,
    organization: member.organization,
    role: member.role,
    permissions,
  };
}

/**
 * Check if the current user has a specific permission.
 * Super admins bypass all permission checks.
 */
export async function requirePermission(permission: string) {
  const session = await getTenantSession();
  if (session.user.isSuperAdmin) return session;
  if (!session.permissions.includes(permission)) {
    throw new Error(`Unauthorized: You don't have the '${permission}' permission.`);
  }
  return session;
}

