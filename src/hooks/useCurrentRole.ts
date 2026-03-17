import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types';

export interface RolePermissions {
  canViewClinical: boolean;
  canViewAdmin: boolean;
  canViewConfig: boolean;
  canViewDocuments: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: { canViewClinical: true, canViewAdmin: true, canViewConfig: true, canViewDocuments: true, canCreate: true, canEdit: true, canDelete: true },
  doctor: { canViewClinical: true, canViewAdmin: false, canViewConfig: false, canViewDocuments: true, canCreate: true, canEdit: true, canDelete: false },
  receptionist: { canViewClinical: false, canViewAdmin: true, canViewConfig: false, canViewDocuments: false, canCreate: true, canEdit: true, canDelete: false },
  assistant: { canViewClinical: true, canViewAdmin: false, canViewConfig: false, canViewDocuments: true, canCreate: true, canEdit: false, canDelete: false },
  billing: { canViewClinical: false, canViewAdmin: true, canViewConfig: false, canViewDocuments: false, canCreate: true, canEdit: true, canDelete: false },
  readonly: { canViewClinical: true, canViewAdmin: true, canViewConfig: true, canViewDocuments: true, canCreate: false, canEdit: false, canDelete: false },
  demo: { canViewClinical: true, canViewAdmin: true, canViewConfig: true, canViewDocuments: true, canCreate: true, canEdit: true, canDelete: true },
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  doctor: 'Doctor',
  receptionist: 'Recepcionista',
  assistant: 'Asistente',
  billing: 'Caja / Contabilidad',
  readonly: 'Solo Lectura',
  demo: 'Demo (Admin)',
};

interface RoleStore {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      currentRole: 'admin',
      setCurrentRole: (role) => set({ currentRole: role }),
    }),
    { name: 'clinical-os-role' }
  )
);

export function useCurrentRole() {
  const currentRole = useRoleStore((s) => s.currentRole);
  const setCurrentRole = useRoleStore((s) => s.setCurrentRole);
  const permissions = ROLE_PERMISSIONS[currentRole] || ROLE_PERMISSIONS.admin;
  const label = ROLE_LABELS[currentRole] || currentRole;

  return { currentRole, setCurrentRole, permissions, label, ROLE_LABELS, ROLE_PERMISSIONS };
}
