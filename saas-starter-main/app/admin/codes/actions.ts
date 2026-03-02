'use server';

import { db } from '@/lib/db/drizzle';
import { codigosProyecto, proyectos, usuarios } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/middleware';
import { generateCodesWithHashes } from '@/lib/utils/codes';
import { revalidatePath } from 'next/cache';

export async function getProjectCodes(proyectoId: number) {
  await requireAdmin();

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

export async function generateCodes(proyectoId: number, count: number) {
  await requireAdmin();

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

  revalidatePath('/admin/codes');
  return { success: true, count: codes.length };
}

export async function getProjectsForCodeGeneration() {
  await requireAdmin();

  return await db
    .select({
      id: proyectos.id,
      claveProyecto: proyectos.claveProyecto,
      titulo: proyectos.titulo,
      cupoTotal: proyectos.cupoTotal,
      cupoDisponible: proyectos.cupoDisponible,
    })
    .from(proyectos)
    .where(eq(proyectos.activo, true))
    .orderBy(desc(proyectos.createdAt));
}

export async function exportCodesToCSV(proyectoId: number) {
  await requireAdmin();

  const codes = await db
    .select()
    .from(codigosProyecto)
    .where(eq(codigosProyecto.proyectoId, proyectoId))
    .orderBy(desc(codigosProyecto.createdAt));

  const project = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, proyectoId))
    .limit(1);

  const headers = ['Código', 'Estado', 'Fecha Creación'];
  const rows = codes.map(c => [
    c.codigo,
    c.usado ? 'Usado' : 'Disponible',
    new Date(c.createdAt).toLocaleString('es-MX'),
  ]);

  const csv = [
    `Proyecto: ${project[0]?.titulo || 'Sin nombre'}`,
    `Clave: ${project[0]?.claveProyecto || ''}`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csv;
}

export async function getAllProjectsWithCodes() {
  await requireAdmin();

  const allProjects = await db
    .select({
      id: proyectos.id,
      claveProyecto: proyectos.claveProyecto,
      titulo: proyectos.titulo,
      cupoTotal: proyectos.cupoTotal,
      cupoDisponible: proyectos.cupoDisponible,
      organizacion: proyectos.organizacion,
    })
    .from(proyectos)
    .where(eq(proyectos.activo, true))
    .orderBy(proyectos.claveProyecto);

  const projectsWithCodes = await Promise.all(
    allProjects.map(async (project) => {
      const codes = await db
        .select({
          id: codigosProyecto.id,
          codigo: codigosProyecto.codigo,
          usado: codigosProyecto.usado,
        })
        .from(codigosProyecto)
        .where(eq(codigosProyecto.proyectoId, project.id))
        .orderBy(codigosProyecto.createdAt);

      return {
        ...project,
        codes: codes.filter(c => !c.usado),
      };
    })
  );

  return projectsWithCodes.filter(p => p.codes.length > 0);
}
