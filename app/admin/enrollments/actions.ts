'use server';

import { db } from '@/lib/db/drizzle';
import { inscripciones, proyectos, usuarios, codigosProyecto } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';

export async function getCertificateDataAdmin(folio: string) {
  await requireAdmin();

  const rows = await db
    .select({
      inscripcion: inscripciones,
      proyecto: proyectos,
      alumno: usuarios,
    })
    .from(inscripciones)
    .innerJoin(proyectos, eq(inscripciones.proyectoId, proyectos.id))
    .innerJoin(usuarios, eq(inscripciones.alumnoId, usuarios.id))
    .where(eq(inscripciones.folio, folio))
    .limit(1);

  if (!rows[0]) return null;

  const { inscripcion, proyecto, alumno } = rows[0];

  return {
    student: {
      nombreCompleto: alumno.nombreCompleto ?? 'Sin nombre',
      matricula: alumno.matricula,
      correoInstitucional: alumno.correoInstitucional,
    },
    project: {
      claveProyecto: proyecto.claveProyecto,
      titulo: proyecto.titulo,
      organizacion: proyecto.organizacion,
      horas: proyecto.horas,
      modalidad: proyecto.modalidad,
      periodo: proyecto.periodo,
      ubicacion: proyecto.ubicacion,
    },
    inscription: {
      folio: inscripcion.folio,
      fechaInscripcion: inscripcion.fechaInscripcion,
      confirmacionSistema: inscripcion.confirmacionSistema,
    },
  };
}

export async function getAllEnrollments() {
  await requireAdmin();

  return await db
    .select({
      id: inscripciones.id,
      folio: inscripciones.folio,
      periodo: inscripciones.periodo,
      fechaInscripcion: inscripciones.fechaInscripcion,
      codigoId: inscripciones.codigoId,
      alumnoId: inscripciones.alumnoId,
      proyectoId: inscripciones.proyectoId,
      alumnoNombre: usuarios.nombreCompleto,
      alumnoMatricula: usuarios.matricula,
      alumnoCorreo: usuarios.correoInstitucional,
      proyectoTitulo: proyectos.titulo,
      proyectoClave: proyectos.claveProyecto,
    })
    .from(inscripciones)
    .innerJoin(usuarios, eq(inscripciones.alumnoId, usuarios.id))
    .innerJoin(proyectos, eq(inscripciones.proyectoId, proyectos.id))
    .orderBy(desc(inscripciones.fechaInscripcion));
}

export async function getProjectsWithEnrollments() {
  await requireAdmin();

  return await db
    .select({
      id: proyectos.id,
      titulo: proyectos.titulo,
      claveProyecto: proyectos.claveProyecto,
    })
    .from(proyectos)
    .orderBy(proyectos.titulo);
}

export async function unenrollStudent(inscripcionId: number) {
  await requireAdmin();

  const enrollment = await db
    .select()
    .from(inscripciones)
    .where(eq(inscripciones.id, inscripcionId))
    .limit(1);

  if (!enrollment[0]) {
    return { error: 'Inscripción no encontrada' };
  }

  const { proyectoId, codigoId } = enrollment[0];

  await db.transaction(async (tx) => {
    // Delete inscription
    await tx.delete(inscripciones).where(eq(inscripciones.id, inscripcionId));

    // Mark code as unused
    if (codigoId) {
      await tx
        .update(codigosProyecto)
        .set({ usado: false, usadoPorAlumnoId: null, usadoEn: null })
        .where(eq(codigosProyecto.id, codigoId));
    }

    // Restore available slot
    await tx
      .update(proyectos)
      .set({ cupoDisponible: sql`cupo_disponible + 1` })
      .where(eq(proyectos.id, proyectoId));
  });

  revalidatePath('/admin/enrollments');
  revalidatePath('/admin');
  return { success: true };
}
