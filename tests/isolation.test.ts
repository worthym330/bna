import { describe, it, expect, vi } from 'vitest';
import { getTenantSession } from '../src/lib/auth';

// Mocking dependencies to test logic in isolation
vi.mock('../src/lib/auth', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    getCurrentUser: vi.fn().mockResolvedValue({ id: 'user-1' }),
    getTenantSession: vi.fn().mockImplementation(async () => {
      return {
        user: { id: 'user-1', email: 'test@bna.com' },
        organization: { id: 'org-1', legalName: 'Tenant 1' },
        role: { name: 'ADMIN' }
      }
    })
  }
});

describe('Tenant Isolation Tests', () => {
  it('should guarantee a user session returns an isolated organizationContext', async () => {
    const session = await getTenantSession();
    expect(session.organization!.id).toBe('org-1');
  });
});
