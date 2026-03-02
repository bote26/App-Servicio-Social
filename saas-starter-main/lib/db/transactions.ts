import { db } from './drizzle';
import {
  usuarios,
  proyectos,
  codigosProyecto,
  inscripciones,
  preRegistroFeria,
  activityLogs,
  NewInscripcion,
  NewActivityLog,
  ActivityType,
  PreRegistroEstado,
} from './schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateFolio, generateSystemConfirmation } from '@/lib/utils/folio';
import { hashCode } from '@/lib/utils/codes';

interface EnrollmentResult {
  success: boolean;
  error?: string;
  folio?: string;
  inscripcion?: typeof inscripciones.$inferSelect;
}

export async function enrollStudentInProject(
  alumnoId: number,
  proyectoId: number,
  codigoPlain: string,
  periodo: string
): Promise<EnrollmentResult> {
  const codigoHash = hashCode(codigoPlain);

  try {
    return await db.transaction(async (tx) => {
      const project = await tx
        .select()
        .from(proyectos)
        .where(eq(proyectos.id, proyectoId))
        .limit(1);

      if (!project[0]) {
        return { success: false, error: 'Proyecto no encontrado' };
      }

      if (!project[0].activo) {
        return { success: false, error: 'El proyecto no está activo' };
      }

      if (project[0].cupoDisponible <= 0) {
        return { success: false, error: 'No hay cupos disponibles en este proyecto' };
      }

      const existingEnrollment = await tx
        .select()
        .from(inscripciones)
        .where(
          and(
            eq(inscripciones.alumnoId, alumnoId),
            eq(inscripciones.periodo, periodo)
          )
        )
        .limit(1);

      if (existingEnrollment[0]) {
        return { success: false, error: 'Ya estás inscrito en un proyecto para este periodo' };
      }

      const code = await tx
        .select()
        .from(codigosProyecto)
        .where(
          and(
            eq(codigosProyecto.proyectoId, proyectoId),
            eq(codigosProyecto.codigoHash, codigoHash),
            eq(codigosProyecto.usado, false)
          )
        )
        .limit(1);

      if (!code[0]) {
        return { success: false, error: 'Código inválido o ya utilizado' };
      }

      if (code[0].expiraEn && new Date(code[0].expiraEn) < new Date()) {
        return { success: false, error: 'El código ha expirado' };
      }

      await tx
        .update(codigosProyecto)
        .set({
          usado: true,
          usadoPorAlumnoId: alumnoId,
          usadoEn: new Date(),
        })
        .where(eq(codigosProyecto.id, code[0].id));

      await tx
        .update(proyectos)
        .set({
          cupoDisponible: sql`${proyectos.cupoDisponible} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(proyectos.id, proyectoId));

      const folio = generateFolio(alumnoId, proyectoId, periodo);
      const confirmacion = generateSystemConfirmation(folio, alumnoId, proyectoId);

      const newInscripcion: NewInscripcion = {
        alumnoId,
        proyectoId,
        codigoId: code[0].id,
        periodo,
        folio,
        confirmacionSistema: confirmacion,
      };

      const [inscripcion] = await tx
        .insert(inscripciones)
        .values(newInscripcion)
        .returning();

      const activityLog: NewActivityLog = {
        userId: alumnoId,
        action: ActivityType.PROJECT_ENROLLMENT,
        ipAddress: '',
      };
      await tx.insert(activityLogs).values(activityLog);

      return {
        success: true,
        folio,
        inscripcion,
      };
    });
  } catch (error) {
    console.error('Enrollment transaction error:', error);
    return { success: false, error: 'Error al procesar la inscripción' };
  }
}

interface ValidationResult {
  success: boolean;
  error?: string;
}

export async function validateStudentAttendance(
  preRegistroId: number,
  validadorId: number
): Promise<ValidationResult> {
  try {
    return await db.transaction(async (tx) => {
      const registration = await tx
        .select()
        .from(preRegistroFeria)
        .where(eq(preRegistroFeria.id, preRegistroId))
        .limit(1);

      if (!registration[0]) {
        return { success: false, error: 'Registro no encontrado' };
      }

      if (registration[0].estado === PreRegistroEstado.VALIDATED) {
        return { success: false, error: 'El estudiante ya fue validado' };
      }

      await tx
        .update(preRegistroFeria)
        .set({
          estado: PreRegistroEstado.VALIDATED,
          validadoPorId: validadorId,
          fechaValidacion: new Date(),
        })
        .where(eq(preRegistroFeria.id, preRegistroId));

      const activityLog: NewActivityLog = {
        userId: registration[0].alumnoId,
        action: ActivityType.PHYSICAL_VALIDATION,
        ipAddress: '',
      };
      await tx.insert(activityLogs).values(activityLog);

      return { success: true };
    });
  } catch (error) {
    console.error('Validation transaction error:', error);
    return { success: false, error: 'Error al validar asistencia' };
  }
}

export async function decrementProjectCapacity(proyectoId: number): Promise<boolean> {
  try {
    const result = await db
      .update(proyectos)
      .set({
        cupoDisponible: sql`GREATEST(${proyectos.cupoDisponible} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(proyectos.id, proyectoId),
          sql`${proyectos.cupoDisponible} > 0`
        )
      )
      .returning();

    return result.length > 0;
  } catch (error) {
    console.error('Capacity decrement error:', error);
    return false;
  }
}

export async function incrementProjectCapacity(proyectoId: number): Promise<boolean> {
  try {
    const result = await db
      .update(proyectos)
      .set({
        cupoDisponible: sql`LEAST(${proyectos.cupoDisponible} + 1, ${proyectos.cupoTotal})`,
        updatedAt: new Date(),
      })
      .where(eq(proyectos.id, proyectoId))
      .returning();

    return result.length > 0;
  } catch (error) {
    console.error('Capacity increment error:', error);
    return false;
  }
}
