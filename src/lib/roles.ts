/**
 * CareerJob staff roles — permission helpers for UI.
 * Database RLS still enforces real security via is_staff() / is_admin_or_owner().
 *
 * Hierarchy (highest → lowest ops power among staff):
 *   owner > admin > manager > recruiter ≈ staff > accountant > viewer
 *
 * Receptionist → assign role `manager` (same desk access as manager).
 */

export type StaffRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'recruiter'
  | 'staff'
  | 'accountant'
  | 'viewer';

const STAFF: StaffRole[] = [
  'owner',
  'admin',
  'manager',
  'recruiter',
  'staff',
  'accountant',
  'viewer',
];

/** Can open /admin */
export function isStaffRole(role?: string | null): boolean {
  return !!role && STAFF.includes(role as StaffRole);
}

/** Owner or Admin — agency control */
export function isAdminLevel(role?: string | null): boolean {
  return role === 'owner' || role === 'admin';
}

/** Owner, Admin, or Manager — full recruitment operations */
export function isManagerLevel(role?: string | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'manager';
}

/** Recruiter / staff — day-to-day desk, limited settings */
export function isOpsDesk(role?: string | null): boolean {
  return isManagerLevel(role) || role === 'recruiter' || role === 'staff';
}

export const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  recruiter: 'Recruiter',
  staff: 'Staff',
  accountant: 'Accountant',
  viewer: 'Viewer',
  candidate: 'Candidate',
  business: 'Business',
};
