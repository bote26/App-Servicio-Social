import { z } from 'zod';
import { Usuario } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any;
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: Usuario
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData, user);
  };
}

export function requireRole(allowedRoles: string[]) {
  return async () => {
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }
    if (!allowedRoles.includes(user.rol)) {
      throw new Error('Access denied');
    }
    return user;
  };
}

export async function requireAdmin() {
  const user = await getUser();
  if (!user || user.rol !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}

export async function requireStaffOrAdmin() {
  const user = await getUser();
  if (!user || (user.rol !== 'admin' && user.rol !== 'staff')) {
    throw new Error('Staff access required');
  }
  return user;
}

export async function requireSocioformador() {
  const user = await getUser();
  if (!user || (user.rol !== 'admin' && user.rol !== 'socioformador')) {
    throw new Error('Socioformador access required');
  }
  return user;
}
