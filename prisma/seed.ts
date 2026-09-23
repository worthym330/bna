import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { BHAGYA_TEMPLATE_HTML } from '../src/lib/default-template';

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Invoices
  { name: 'invoices.view',     description: 'View invoices' },
  { name: 'invoices.create',   description: 'Create new invoices' },
  { name: 'invoices.edit',     description: 'Edit draft invoices' },
  { name: 'invoices.finalize', description: 'Finalize & generate PDF' },
  { name: 'invoices.delete',   description: 'Delete invoices' },
  // Clients
  { name: 'clients.view',      description: 'View clients' },
  { name: 'clients.manage',    description: 'Create/edit/delete clients' },
  // Projects
  { name: 'projects.view',     description: 'View projects' },
  { name: 'projects.manage',   description: 'Create/edit/delete projects' },
  // Offices
  { name: 'offices.view',      description: 'View offices' },
  { name: 'offices.manage',    description: 'Create/edit/delete offices' },
  // Settings
  { name: 'settings.view',     description: 'View settings' },
  { name: 'settings.manage',   description: 'Manage settings, templates, assets' },
  // Reports
  { name: 'reports.view',      description: 'View reports and analytics' },
];

const ROLE_DEFINITIONS: Record<string, string[]> = {
  'Admin': PERMISSIONS.map(p => p.name),
  'Accountant': [
    'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.finalize',
    'clients.view', 'clients.manage',
    'projects.view',
    'offices.view',
    'settings.view',
    'reports.view',
  ],
  'Viewer': [
    'invoices.view',
    'clients.view',
    'projects.view',
    'offices.view',
    'settings.view',
    'reports.view',
  ],
};

async function main() {
  console.log('🌱 Starting seed...');

  // ─── 1. Seed global permissions ───────────────────────────────────────────
  console.log('  → Creating permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: { name: perm.name, description: perm.description },
    });
  }
  console.log(`  ✓ ${PERMISSIONS.length} permissions seeded`);

  // ─── 2. Create Bhagya and Associates organization ─────────────────────────
  console.log('  → Creating Bhagya and Associates org...');
  let bhagyaOrg = await prisma.organization.findFirst({
    where: { legalName: 'BHAGYA AND ASSOCIATES' }
  });
  if (!bhagyaOrg) {
    bhagyaOrg = await prisma.organization.create({
      data: {
        legalName: 'BHAGYA AND ASSOCIATES',
        displayName: 'Bhagya and Associates',
        email: 'info@bhagyaassociates.com',
        phone: '+91-9000000001',
        gstin: '36AAAFB1234A1Z5',
        pan: 'AAAFB1234A',
        defaultCurrency: 'INR',
        defaultCountry: 'India',
      }
    });
    console.log(`  ✓ Org created: ${bhagyaOrg.id}`);
  } else {
    console.log(`  ✓ Org already exists: ${bhagyaOrg.id}`);
  }

  // ─── 3. Create org-scoped roles with permissions ──────────────────────────
  console.log('  → Creating roles for Bhagya and Associates...');
  const allPermissions = await prisma.permission.findMany();
  const permMap = new Map(allPermissions.map(p => [p.name, p.id]));

  const roleIds: Record<string, string> = {};
  for (const [roleName, permNames] of Object.entries(ROLE_DEFINITIONS)) {
    const existingRole = await prisma.role.findFirst({
      where: { organizationId: bhagyaOrg.id, name: roleName }
    });

    let role;
    if (!existingRole) {
      role = await prisma.role.create({
        data: {
          organizationId: bhagyaOrg.id,
          name: roleName,
          description: `${roleName} role for Bhagya and Associates`,
        }
      });
    } else {
      role = existingRole;
    }
    roleIds[roleName] = role.id;

    // Assign permissions to role
    for (const permName of permNames) {
      const permId = permMap.get(permName);
      if (!permId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
        update: {},
        create: { roleId: role.id, permissionId: permId },
      });
    }
    console.log(`    ✓ Role "${roleName}" with ${permNames.length} permissions`);
  }

  // ─── 4. Create users ──────────────────────────────────────────────────────
  console.log('  → Creating users...');
  const userDefs = [
    { email: 'admin@bhagya.com',      name: 'Bhagya Admin',      password: 'Admin@1234',      role: 'Admin' },
    { email: 'accountant@bhagya.com', name: 'Bhagya Accountant', password: 'Accountant@1234', role: 'Accountant' },
    { email: 'viewer@bhagya.com',     name: 'Bhagya Viewer',     password: 'Viewer@1234',     role: 'Viewer' },
  ];

  for (const ud of userDefs) {
    let user = await prisma.user.findUnique({ where: { email: ud.email } });
    if (!user) {
      const hash = await bcrypt.hash(ud.password, 10);
      user = await prisma.user.create({
        data: { email: ud.email, name: ud.name, passwordHash: hash }
      });
    }
    // Add to org as member with role
    await prisma.organizationMember.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: bhagyaOrg.id } },
      update: { roleId: roleIds[ud.role] },
      create: { userId: user.id, organizationId: bhagyaOrg.id, roleId: roleIds[ud.role] },
    });
    console.log(`    ✓ User: ${ud.email} / ${ud.password} → Role: ${ud.role}`);
  }

  // ─── 5. Create Krayons client ─────────────────────────────────────────────
  console.log('  → Creating Krayons client...');
  let krayonsClient = await prisma.client.findFirst({
    where: { organizationId: bhagyaOrg.id, clientName: { contains: 'KRAYONS' } }
  });
  if (!krayonsClient) {
    krayonsClient = await prisma.client.create({
      data: {
        organizationId: bhagyaOrg.id,
        clientName: 'M/s. KRAYONS CONTRACTING CO. LLP',
        gstin: '36AAGFK9876A1ZM',
        pan: 'AAGFK9876A',
        state: 'Telangana',
        country: 'India',
        contactPerson: 'Krayons Admin',
        email: 'accounts@krayons.com',
        phone: '+91-9000000002',
        addresses: {
          create: [{
            addressType: 'BILLING',
            addressLine1: 'Plot No. 45, Industrial Estate',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            pincode: '500001',
          }]
        }
      }
    });
    console.log(`  ✓ Krayons client created: ${krayonsClient.id}`);
  } else {
    console.log(`  ✓ Krayons client already exists`);
  }

  // ─── 6. Create invoice series ─────────────────────────────────────────────
  console.log('  → Creating invoice series...');
  let invoiceSeries = await prisma.invoiceSeries.findFirst({
    where: { organizationId: bhagyaOrg.id, prefix: 'BNA' }
  });
  if (!invoiceSeries) {
    invoiceSeries = await prisma.invoiceSeries.create({
      data: {
        organizationId: bhagyaOrg.id,
        name: 'Bhagya Standard 2026-27',
        prefix: 'BNA',
        suffix: '/26-27',
        currentSequence: 0,
        padding: 3,
        isActive: true,
      }
    });
  }

  // ─── 7. Create default invoice template ───────────────────────────────────
  console.log('  → Creating invoice template...');
  let template = await prisma.invoiceTemplate.findFirst({
    where: { organizationId: bhagyaOrg.id, name: 'Bhagya Standard Template' }
  });
  if (!template) {
    template = await prisma.invoiceTemplate.create({
      data: {
        organizationId: bhagyaOrg.id,
        name: 'Bhagya Standard Template',
        htmlContent: BHAGYA_TEMPLATE_HTML,
        isDefault: true
      }
    });
    console.log(`  ✓ Bhagya template created: ${template.id}`);
  } else {
    console.log(`  ✓ Bhagya template already exists`);
  }

  // ─── 7. Super admin user ──────────────────────────────────────────────────
  console.log('  → Ensuring super admin user...');
  let superAdmin = await prisma.user.findUnique({ where: { email: 'superadmin@platform.com' } });
  if (!superAdmin) {
    const hash = await bcrypt.hash('SuperAdmin@1234', 10);
    superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@platform.com',
        name: 'Platform Super Admin',
        passwordHash: hash,
        isSuperAdmin: true,
      }
    });
    console.log(`    ✓ Superadmin: superadmin@platform.com / SuperAdmin@1234`);
  } else {
    console.log(`    ✓ Superadmin already exists`);
  }

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────────');
  console.log('  Login Credentials:');
  console.log('  Super Admin:  superadmin@platform.com  / SuperAdmin@1234');
  console.log('  Admin:        admin@bhagya.com          / Admin@1234');
  console.log('  Accountant:   accountant@bhagya.com     / Accountant@1234');
  console.log('  Viewer:       viewer@bhagya.com         / Viewer@1234');
  console.log('─────────────────────────────────────────────');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
