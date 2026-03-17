import type { Metadata } from '@/types';

export function createMetadata(userId: string = 'demo-admin'): Metadata {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    updatedAt: now,
    lastModifiedBy: userId,
    version: 1,
    isArchived: false,
  };
}

export function updateMetadata(existing: Metadata, userId: string = 'demo-admin'): Metadata {
  return {
    ...existing,
    updatedAt: new Date().toISOString(),
    lastModifiedBy: userId,
    version: existing.version + 1,
  };
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function generateFolio(prefix: string, count: number): string {
  return `${prefix}-${String(count + 1).padStart(5, '0')}`;
}

export const DEMO_CLINIC_ID = 'clinic-demo-001';
export const DEMO_ORG_ID = 'org-demo-001';
export const DEMO_USER_ID = 'user-demo-admin';
export const DEMO_BRANCH_ID = 'branch-demo-001';
