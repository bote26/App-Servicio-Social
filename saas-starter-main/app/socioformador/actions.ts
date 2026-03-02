'use server';

import { db } from '@/lib/db/drizzle';
import { proyectos, codigosProyecto, inscripciones, usuarios } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { requireSocioformador } from '@/lib/auth/middleware';

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
