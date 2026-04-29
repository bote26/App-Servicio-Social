'use server';

import { db } from '@/lib/db/drizzle';
import { proyectos, inscripciones, preRegistroFeria, eventosFeria, TipoProyecto, TIPOS_PROYECTO } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { enrollStudentInProject } from '@/lib/db/transactions';

export async function getAvailableProjects(filters?: {
  search?: string;
  carrera?: string;
  modalidad?: string;
  horas?: number;
}) {
  let query = db.select().from(proyectos).where(eq(proyectos.activo, true));

  const projects = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.activo, true));

  let filtered = projects;

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.titulo.toLowerCase().includes(searchLower) ||
      p.organizacion?.toLowerCase().includes(searchLower) ||
      p.claveProyecto.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.carrera && filters.carrera !== 'all') {
    filtered = filtered.filter(p => 
      p.carrera?.toLowerCase().includes(filters.carrera!.toLowerCase()) ||
      p.carrera === 'Todas'
    );
  }

  if (filters?.modalidad && filters.modalidad !== 'all') {
    filtered = filtered.filter(p => p.modalidad === filters.modalidad);
  }

  if (filters?.horas && filters.horas > 0) {
    filtered = filtered.filter(p => p.horas >= filters.horas!);
  }

  return filtered;
}

export async function getProjectDetails(projectId: number) {
  const project = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, projectId))
    .limit(1);

  return project[0] || null;
}

export async function checkStudentEligibility() {
  const user = await getUser();
  
  if (!user) {
    return { eligible: false, reason: 'not_authenticated' };
  }

  if (user.rol !== 'student') {
    return { eligible: false, reason: 'not_student' };
  }

  const activeEvents = await db
    .select()
    .from(eventosFeria)
    .where(eq(eventosFeria.activo, true))
    .limit(1);

  if (activeEvents.length === 0) {
    return { eligible: false, reason: 'no_active_event' };
  }

  const preRegistration = await db
    .select()
    .from(preRegistroFeria)
    .where(
      and(
        eq(preRegistroFeria.alumnoId, user.id),
        eq(preRegistroFeria.eventoFeriaId, activeEvents[0].id)
      )
    )
    .limit(1);

  if (preRegistration.length === 0) {
    return { eligible: false, reason: 'not_registered_for_fair' };
  }

  // Validation step removed - students can enroll directly after pre-registration

  // Fetch existing enrollments for any active-period project
  const activeProject = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.activo, true))
    .limit(1);

  if (activeProject.length > 0) {
    const existingEnrollments = await db
      .select({ tipoProyecto: inscripciones.tipoProyecto })
      .from(inscripciones)
      .where(
        and(
          eq(inscripciones.alumnoId, user.id),
          eq(inscripciones.periodo, activeProject[0].periodo)
        )
      );

    const enrolledTypes = existingEnrollments.map(e => e.tipoProyecto);

    // If the student already has both Intensivo and Semestral they cannot enroll more
    const hasIntensivo  = enrolledTypes.includes(TipoProyecto.INTENSIVO);
    const hasSemestral  = enrolledTypes.includes(TipoProyecto.SEMESTRAL);
    const hasGeneral    = enrolledTypes.includes(TipoProyecto.GENERAL);

    // Legacy/general projects still block further general enrollment
    if (hasIntensivo && hasSemestral) {
      return { eligible: false, reason: 'already_enrolled_both', enrolledTypes };
    }

    return { eligible: true, reason: 'eligible', enrolledTypes };
  }

  return { eligible: true, reason: 'eligible', enrolledTypes: [] };
}

export async function enrollInProject(projectId: number, code: string) {
  const user = await getUser();
  
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const eligibility = await checkStudentEligibility();
  
  if (!eligibility.eligible) {
    const errorMessages: Record<string, string> = {
      not_student: 'Solo estudiantes pueden inscribirse',
      no_active_event: 'No hay eventos activos',
      not_registered_for_fair: 'Debes registrarte primero para la feria',
      already_enrolled: 'Ya estás inscrito en un proyecto para este periodo',
    };
    return { 
      success: false, 
      error: errorMessages[eligibility.reason] || 'No elegible para inscripción' 
    };
  }

  const project = await getProjectDetails(projectId);
  
  if (!project) {
    return { success: false, error: 'Proyecto no encontrado' };
  }

  const result = await enrollStudentInProject(
    user.id,
    projectId,
    code.toUpperCase().trim(),
    project.periodo
  );

  return result;
}
