'use server';

import { db } from '@/lib/db/drizzle';
import { proyectos, codigosProyecto, inscripciones, usuarios } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { requireSocioformador } from '@/lib/auth/middleware';
import { generateCodesWithHashes } from '@/lib/utils/codes';
import { revalidatePath } from 'next/cache';

export async function getMyProjects() {
  const user = await requireSocioformador();

  if (user.rol === 'admin') {
    return await db
      .select()
      .from(proyectos)
      .orderBy(desc(proyectos.createdAt));
  }

  return await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.socioformadorId, user.id))
    .orderBy(desc(proyectos.createdAt));
}

export async function getProjectCodesForSocioformador(proyectoId: number) {
  const user = await requireSocioformador();

  const project = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, proyectoId))
    .limit(1);

  if (!project[0]) {
    throw new Error('Proyecto no encontrado');
  }

  if (user.rol !== 'admin' && project[0].socioformadorId !== user.id) {
    throw new Error('No tienes acceso a este proyecto');
  }

  return await db
    .select({
      code: codigosProyecto,
      usedBy: usuarios,
    })
    .from(codigosProyecto)
    .leftJoin(usuarios, eq(codigosProyecto.usadoPorAlumnoId, usuarios.id))
    .where(eq(codigosProyecto.proyectoId, proyectoId))
    .orderBy(desc(codigosProyecto.createdAt));
}

export async function generateCodesForMyProject(proyectoId: number, count: number) {
  const user = await requireSocioformador();

  if (count < 1 || count > 100) {
    return { error: 'La cantidad debe ser entre 1 y 100' };
  }

  const project = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, proyectoId))
    .limit(1);

  if (!project[0]) {
    return { error: 'Proyecto no encontrado' };
  }

  if (user.rol !== 'admin' && project[0].socioformadorId !== user.id) {
    return { error: 'No tienes acceso a este proyecto' };
  }

  const codes = generateCodesWithHashes(count);

  for (const code of codes) {
    await db
      .insert(codigosProyecto)
      .values({
        proyectoId,
        codigo: code.codigo,
        codigoHash: code.codigoHash,
      })
      .onConflictDoNothing();
  }

  revalidatePath('/socioformador/codes');
  return { success: true, count: codes.length };
}

export async function getProjectStudents(proyectoId: number) {
  const user = await requireSocioformador();

  const project = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, proyectoId))
    .limit(1);

  if (!project[0]) {
    throw new Error('Proyecto no encontrado');
  }

  if (user.rol !== 'admin' && project[0].socioformadorId !== user.id) {
    throw new Error('No tienes acceso a este proyecto');
  }

  return await db
    .select({
      enrollment: inscripciones,
      student: usuarios,
    })
    .from(inscripciones)
    .innerJoin(usuarios, eq(inscripciones.alumnoId, usuarios.id))
    .where(eq(inscripciones.proyectoId, proyectoId))
    .orderBy(desc(inscripciones.fechaInscripcion));
}
