'use server';

import { getUser, getStudentEnrollments } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { inscripciones, proyectos, usuarios } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function fetchMyEnrollments() {
  const user = await getUser();

  if (!user) {
    return [];
  }

  const enrollments = await getStudentEnrollments(user.id);
  return enrollments;
}

export async function getCertificateData(folio: string) {
  const user = await getUser();
  if (!user) return null;

  const rows = await db
    .select({
      inscripcion: inscripciones,
      proyecto: proyectos,
      alumno: usuarios,
    })
    .from(inscripciones)
    .innerJoin(proyectos, eq(inscripciones.proyectoId, proyectos.id))
    .innerJoin(usuarios, eq(inscripciones.alumnoId, usuarios.id))
    .where(
      and(
        eq(inscripciones.folio, folio),
        eq(inscripciones.alumnoId, user.id)
      )
    )
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
