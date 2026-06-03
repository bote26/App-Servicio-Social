'use server';

import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  Usuario,
  usuarios,
  activityLogs,
  type NewUsuario,
  type NewActivityLog,
  ActivityType,
  preRegistroFeria,
  UserRole,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';

async function logActivity(
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  const newActivity: NewActivityLog = {
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const foundUser = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.correoInstitucional, email))
    .limit(1)
    .then(res => res[0]);

  if (!foundUser) {
    return {
      error: 'Correo electrónico o contraseña incorrectos. Por favor, inténtalo de nuevo.',
      email,
      password
    };
  }

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Correo electrónico o contraseña incorrectos. Por favor, inténtalo de nuevo.',
      email,
      password
    };
  }

  await Promise.all([
    setSession({ ...foundUser, id: foundUser.id, rol: foundUser.rol }),
    logActivity(foundUser.id, ActivityType.SIGN_IN)
  ]);

  if (foundUser.rol === UserRole.ADMIN) {
    redirect('/admin');
  } else if (foundUser.rol === UserRole.STAFF) {
    redirect('/admin/validation');
  } else if (foundUser.rol === UserRole.SOCIOFORMADOR) {
    redirect('/socioformador');
  } else {
    redirect('/dashboard');
  }
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  matricula: z.string().min(1).max(20).optional(),
  nombreCompleto: z.string().min(1).max(150).optional(),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, matricula, nombreCompleto } = data;

  const existingUser = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.correoInstitucional, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Este correo ya está registrado. Por favor, inicia sesión.',
      email,
      password
    };
  }

  if (matricula) {
    const existingMatricula = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.matricula, matricula))
      .limit(1);

    if (existingMatricula.length > 0) {
      return {
        error: 'Esta matrícula ya está registrada.',
        email,
        password
      };
    }
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUsuario = {
    correoInstitucional: email,
    passwordHash,
    rol: UserRole.STUDENT,
    matricula: matricula || null,
    nombreCompleto: nombreCompleto || null,
  };

  const [createdUser] = await db.insert(usuarios).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Error al crear el usuario. Por favor, inténtalo de nuevo.',
      email,
      password
    };
  }

  await Promise.all([
    setSession({ ...createdUser, id: createdUser.id, rol: createdUser.rol }),
    logActivity(createdUser.id, ActivityType.SIGN_UP)
  ]);

  redirect('/dashboard/fair-registration');
});

export async function signOut() {
  const user = await getUser();
  if (user) {
    await logActivity(user.id, ActivityType.SIGN_OUT);
  }
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'La contraseña actual es incorrecta.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'La nueva contraseña debe ser diferente a la actual.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'La nueva contraseña y la confirmación no coinciden.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await Promise.all([
      db
        .update(usuarios)
        .set({ passwordHash: newPasswordHash })
        .where(eq(usuarios.id, user.id)),
      logActivity(user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Contraseña actualizada exitosamente.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Contraseña incorrecta. Error al eliminar la cuenta.'
      };
    }

    await logActivity(user.id, ActivityType.DELETE_ACCOUNT);

    await db
      .update(usuarios)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        correoInstitucional: sql`CONCAT(correo_institucional, '-', id, '-deleted')`
      })
      .where(eq(usuarios.id, user.id));

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  nombreCompleto: z.string().min(1, 'El nombre es obligatorio').max(150),
  correoInstitucional: z.string().email('Correo electrónico no válido'),
  matricula: z.string().max(20).optional(),
  numeroPersonal: z.string().max(30).optional(),
  correoAlternativo: z.string().email().optional().or(z.literal('')),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { nombreCompleto, correoInstitucional, matricula, numeroPersonal, correoAlternativo } = data;

    await Promise.all([
      db.update(usuarios).set({ 
        nombreCompleto, 
        correoInstitucional,
        matricula: matricula || null,
        numeroPersonal: numeroPersonal || null,
        correoAlternativo: correoAlternativo || null,
        updatedAt: new Date(),
      }).where(eq(usuarios.id, user.id)),
      logActivity(user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { nombreCompleto, success: 'Cuenta actualizada exitosamente.' };
  }
);
