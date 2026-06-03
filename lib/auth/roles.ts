import { UserRole } from '@/lib/db/schema';

export const ROLE_PERMISSIONS = {
  [UserRole.STUDENT]: {
    canAccessDashboard: true,
    canRegisterFair: true,
    canViewProjects: true,
    canEnrollProject: true,
    canManageProjects: false,
    canValidateStudents: false,
    canManageUsers: false,
    canViewAllEnrollments: false,
    canGenerateCodes: false,
  },
  [UserRole.ADMIN]: {
    canAccessDashboard: true,
    canRegisterFair: false,
    canViewProjects: true,
    canEnrollProject: false,
    canManageProjects: true,
    canValidateStudents: true,
    canManageUsers: true,
    canViewAllEnrollments: true,
    canGenerateCodes: true,
  },
  [UserRole.SOCIOFORMADOR]: {
    canAccessDashboard: true,
    canRegisterFair: false,
    canViewProjects: true,
    canEnrollProject: false,
    canManageProjects: false,
    canValidateStudents: false,
    canManageUsers: false,
    canViewAllEnrollments: false,
    canGenerateCodes: true,
  },
  [UserRole.STAFF]: {
    canAccessDashboard: true,
    canRegisterFair: false,
    canViewProjects: true,
    canEnrollProject: false,
    canManageProjects: false,
    canValidateStudents: true,
    canManageUsers: false,
    canViewAllEnrollments: true,
    canGenerateCodes: false,
  },
};

export function hasPermission(
  role: string,
  permission: keyof typeof ROLE_PERMISSIONS[UserRole.STUDENT]
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role as UserRole];
  if (!rolePermissions) return false;
  return rolePermissions[permission] ?? false;
}

export function isAdmin(role: string): boolean {
  return role === UserRole.ADMIN;
}

export function isStaffOrAdmin(role: string): boolean {
  return role === UserRole.ADMIN || role === UserRole.STAFF;
}

export function isSocioformador(role: string): boolean {
  return role === UserRole.SOCIOFORMADOR;
}

export function isStudent(role: string): boolean {
  return role === UserRole.STUDENT;
}

export const PROTECTED_ROUTES = {
  admin: ['/admin'],
  staff: ['/admin/validation'],
  socioformador: ['/socioformador'],
  student: ['/dashboard'],
};

export function canAccessRoute(role: string, pathname: string): boolean {
  if (role === UserRole.ADMIN) {
    return true;
  }
  
  if (pathname.startsWith('/admin')) {
    if (role === UserRole.STAFF && pathname.startsWith('/admin/validation')) {
      return true;
    }
    return role === UserRole.ADMIN;
  }
  
  if (pathname.startsWith('/socioformador')) {
    return role === UserRole.SOCIOFORMADOR || role === UserRole.ADMIN;
  }
  
  if (pathname.startsWith('/dashboard')) {
    return true;
  }
  
  return true;
}
