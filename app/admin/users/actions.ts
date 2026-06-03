'use server';

import { db } from '@/lib/db/drizzle';
import { usuarios, UserRole } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/session';
import { getUserByEmail } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

export async function getSocioformadores() {
  await requireAdmin();

  return await db
    .select({
      id: usuarios.id,
      nombreCompleto: usuarios.nombreCompleto,
      correoInstitucional: usuarios.correoInstitucional,
      numeroPersonal: usuarios.numeroPersonal,
      createdAt: usuarios.createdAt,
    })
    .from(usuarios)
    .where(and(eq(usuarios.rol, UserRole.SOCIOFORMADOR), isNull(usuarios.deletedAt)))
    .orderBy(usuarios.nombreCompleto);
}

export async function createSocioformador(formData: FormData) {
  await requireAdmin();

  const nombreCompleto = formData.get('nombreCompleto') as string;
  const correoInstitucional = formData.get('correoInstitucional') as string;
  const password = formData.get('password') as string;
  const numeroPersonal = formData.get('numeroPersonal') as string | null;

  if (!nombreCompleto || !correoInstitucional || !password) {
    return { error: 'Nombre, correo y contraseña son requeridos' };
  }

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  const existing = await getUserByEmail(correoInstitucional);
  if (existing) {
    return { error: 'Ya existe un usuario con ese correo' };
  }

  const passwordHash = await hashPassword(password);

  await db.insert(usuarios).values({
    nombreCompleto,
    correoInstitucional,
    passwordHash,
    rol: UserRole.SOCIOFORMADOR,
    numeroPersonal: numeroPersonal || null,
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function deleteSocioformador(id: number) {
  await requireAdmin();

  await db
    .update(usuarios)
    .set({ deletedAt: new Date() })
    .where(and(eq(usuarios.id, id), eq(usuarios.rol, UserRole.SOCIOFORMADOR)));

  revalidatePath('/admin/users');
  return { success: true };
}
