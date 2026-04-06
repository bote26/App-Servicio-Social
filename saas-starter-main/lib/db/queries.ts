import { desc, and, eq, isNull, gt, sql, gte } from 'drizzle-orm';
import { db } from './drizzle';
import {
  usuarios,
  activityLogs,
  eventosFeria,
  preRegistroFeria,
  proyectos,
  codigosProyecto,
  inscripciones,
  Usuario,
  PreRegistroEstado,
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

// =============================================================================
// USER QUERIES
// =============================================================================

export async function getUser(): Promise<Usuario | null> {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    const sessionData = await verifyToken(sessionCookie.value);
    if (
      !sessionData ||
      !sessionData.user ||
      typeof sessionData.user.id !== 'number'
    ) {
      return null;
    }

    if (new Date(sessionData.expires) < new Date()) {
      return null;
    }

    const user = await db
      .select()
      .from(usuarios)
      .where(and(eq(usuarios.id, sessionData.user.id), isNull(usuarios.deletedAt)))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch {
    return null;
  }
}

export async function getUserById(id: number): Promise<Usuario | null> {
  const user = await db
    .select()
    .from(usuarios)
    .where(and(eq(usuarios.id, id), isNull(usuarios.deletedAt)))
    .limit(1);

  return user[0] || null;
}

export async function getUserByEmail(email: string): Promise<Usuario | null> {
  const user = await db
    .select()
    .from(usuarios)
    .where(and(eq(usuarios.correoInstitucional, email), isNull(usuarios.deletedAt)))
    .limit(1);

  return user[0] || null;
}

export async function getAllUsers() {
  return await db
    .select()
    .from(usuarios)
    .where(isNull(usuarios.deletedAt))
    .orderBy(desc(usuarios.createdAt));
}

export async function getUsersByRole(role: string) {
  return await db
    .select()
    .from(usuarios)
    .where(and(eq(usuarios.rol, role), isNull(usuarios.deletedAt)))
    .orderBy(desc(usuarios.createdAt));
}

// =============================================================================
// ACTIVITY LOG QUERIES
// =============================================================================

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: usuarios.nombreCompleto,
    })
    .from(activityLogs)
    .leftJoin(usuarios, eq(activityLogs.userId, usuarios.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

// =============================================================================
// FAIR EVENT QUERIES
// =============================================================================

export async function getActiveEvents() {
  return await db
    .select()
    .from(eventosFeria)
    .where(eq(eventosFeria.activo, true))
    .orderBy(desc(eventosFeria.fechaEvento));
}

export async function getAllEvents() {
  return await db
    .select()
    .from(eventosFeria)
    .orderBy(desc(eventosFeria.fechaEvento));
}

export async function getEventById(id: number) {
  const event = await db
    .select()
    .from(eventosFeria)
    .where(eq(eventosFeria.id, id))
    .limit(1);

  return event[0] || null;
}

// =============================================================================
// PRE-REGISTRATION QUERIES
// =============================================================================

export async function getStudentPreRegistration(alumnoId: number, eventoId: number) {
  const registration = await db
    .select()
    .from(preRegistroFeria)
    .where(
      and(
        eq(preRegistroFeria.alumnoId, alumnoId),
        eq(preRegistroFeria.eventoFeriaId, eventoId)
      )
    )
    .limit(1);

  return registration[0] || null;
}

export async function getStudentPreRegistrations(alumnoId: number) {
  return await db
    .select({
      preRegistro: preRegistroFeria,
      evento: eventosFeria,
    })
    .from(preRegistroFeria)
    .innerJoin(eventosFeria, eq(preRegistroFeria.eventoFeriaId, eventosFeria.id))
    .where(eq(preRegistroFeria.alumnoId, alumnoId))
    .orderBy(desc(preRegistroFeria.createdAt));
}

export async function getPreRegistrationsByEvent(eventoId: number) {
  return await db
    .select({
      preRegistro: preRegistroFeria,
      alumno: usuarios,
    })
    .from(preRegistroFeria)
    .innerJoin(usuarios, eq(preRegistroFeria.alumnoId, usuarios.id))
    .where(eq(preRegistroFeria.eventoFeriaId, eventoId))
    .orderBy(desc(preRegistroFeria.createdAt));
}

export async function isStudentValidated(alumnoId: number, eventoId: number): Promise<boolean> {
  const registration = await getStudentPreRegistration(alumnoId, eventoId);
  return registration?.estado === PreRegistroEstado.VALIDATED;
}

// =============================================================================
// PROJECT QUERIES
// =============================================================================

export async function getActiveProjects() {
  return await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.activo, true))
    .orderBy(desc(proyectos.createdAt));
}

export async function getAllProjects() {
  return await db
    .select()
    .from(proyectos)
    .orderBy(desc(proyectos.createdAt));
}

export async function getProjectById(id: number) {
  const project = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, id))
    .limit(1);

  return project[0] || null;
}

export async function getProjectByCode(claveProyecto: string) {
  const project = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.claveProyecto, claveProyecto))
    .limit(1);

  return project[0] || null;
}

export async function getProjectsBySocioformador(socioformadorId: number) {
  return await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.socioformadorId, socioformadorId))
    .orderBy(desc(proyectos.createdAt));
}

export async function getProjectsWithAvailability() {
  return await db
    .select()
    .from(proyectos)
    .where(and(eq(proyectos.activo, true), gt(proyectos.cupoDisponible, 0)))
    .orderBy(desc(proyectos.createdAt));
}

// =============================================================================
// PROJECT CODE QUERIES
// =============================================================================

export async function getProjectCodes(proyectoId: number) {
  return await db
    .select()
    .from(codigosProyecto)
    .where(eq(codigosProyecto.proyectoId, proyectoId))
    .orderBy(desc(codigosProyecto.createdAt));
}

export async function getUnusedCodes(proyectoId: number) {
  return await db
    .select()
    .from(codigosProyecto)
    .where(
      and(
        eq(codigosProyecto.proyectoId, proyectoId),
        eq(codigosProyecto.usado, false)
      )
    )
    .orderBy(desc(codigosProyecto.createdAt));
}

export async function validateProjectCode(proyectoId: number, codigoHash: string) {
  const code = await db
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

  return code[0] || null;
}

// =============================================================================
// ENROLLMENT QUERIES
// =============================================================================

export async function getStudentEnrollments(alumnoId: number) {
  return await db
    .select({
      inscripcion: inscripciones,
      proyecto: proyectos,
    })
    .from(inscripciones)
    .innerJoin(proyectos, eq(inscripciones.proyectoId, proyectos.id))
    .where(eq(inscripciones.alumnoId, alumnoId))
    .orderBy(desc(inscripciones.fechaInscripcion));
}

export async function getStudentEnrollmentByPeriod(alumnoId: number, periodo: string) {
  const enrollment = await db
    .select()
    .from(inscripciones)
    .where(
      and(
        eq(inscripciones.alumnoId, alumnoId),
        eq(inscripciones.periodo, periodo)
      )
    )
    .limit(1);

  return enrollment[0] || null;
}

export async function getProjectEnrollments(proyectoId: number) {
  return await db
    .select({
      inscripcion: inscripciones,
      alumno: usuarios,
    })
    .from(inscripciones)
    .innerJoin(usuarios, eq(inscripciones.alumnoId, usuarios.id))
    .where(eq(inscripciones.proyectoId, proyectoId))
    .orderBy(desc(inscripciones.fechaInscripcion));
}

export async function getEnrollmentByFolio(folio: string) {
  const enrollment = await db
    .select({
      inscripcion: inscripciones,
      alumno: usuarios,
      proyecto: proyectos,
    })
    .from(inscripciones)
    .innerJoin(usuarios, eq(inscripciones.alumnoId, usuarios.id))
    .innerJoin(proyectos, eq(inscripciones.proyectoId, proyectos.id))
    .where(eq(inscripciones.folio, folio))
    .limit(1);

  return enrollment[0] || null;
}

// =============================================================================
// DASHBOARD STATS QUERIES
// =============================================================================

// =============================================================================
// CHART DATA QUERIES
// =============================================================================

export async function getEnrollmentsByProject() {
  const results = await db
    .select({
      titulo: proyectos.titulo,
      claveProyecto: proyectos.claveProyecto,
      cupoTotal: proyectos.cupoTotal,
      cupoDisponible: proyectos.cupoDisponible,
      inscritos: sql<number>`(${proyectos.cupoTotal} - ${proyectos.cupoDisponible})`,
    })
    .from(proyectos)
    .where(eq(proyectos.activo, true))
    .orderBy(sql`(${proyectos.cupoTotal} - ${proyectos.cupoDisponible}) desc`)
    .limit(10);

  return results.map((r) => ({
    nombre: r.claveProyecto,
    titulo: r.titulo,
    inscritos: Number(r.inscritos),
    cupoTotal: r.cupoTotal,
  }));
}

export async function getEnrollmentTrend(days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const results = await db
    .select({
      fecha: sql<string>`DATE(${inscripciones.fechaInscripcion})`,
      count: sql<number>`count(*)`,
    })
    .from(inscripciones)
    .where(gte(inscripciones.fechaInscripcion, since))
    .groupBy(sql`DATE(${inscripciones.fechaInscripcion})`)
    .orderBy(sql`DATE(${inscripciones.fechaInscripcion})`);

  // Build cumulative series filling gaps
  const map = new Map(results.map((r) => [r.fecha, Number(r.count)]));
  const trend: { fecha: string; nuevos: number; acumulado: number }[] = [];
  let acumulado = 0;
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const nuevos = map.get(key) ?? 0;
    acumulado += nuevos;
    trend.push({ fecha: key, nuevos, acumulado });
  }
  return trend;
}

export async function getEnrollmentTrendByHour() {
  const results = await db
    .select({
      hora: sql<number>`EXTRACT(HOUR FROM ${inscripciones.fechaInscripcion})`,
      count: sql<number>`count(*)`,
    })
    .from(inscripciones)
    .where(sql`DATE(${inscripciones.fechaInscripcion}) = CURRENT_DATE`)
    .groupBy(sql`EXTRACT(HOUR FROM ${inscripciones.fechaInscripcion})`)
    .orderBy(sql`EXTRACT(HOUR FROM ${inscripciones.fechaInscripcion})`);

  const map = new Map(results.map((r) => [Number(r.hora), Number(r.count)]));
  const trend: { hora: string; nuevos: number; acumulado: number }[] = [];
  let acumulado = 0;
  for (let h = 0; h < 24; h++) {
    const nuevos = map.get(h) ?? 0;
    acumulado += nuevos;
    trend.push({ hora: `${String(h).padStart(2, '0')}:00`, nuevos, acumulado });
  }
  return trend;
}

export async function getSocioformadorStats(userId: number) {
  const alumnosResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(inscripciones)
    .innerJoin(proyectos, eq(inscripciones.proyectoId, proyectos.id))
    .where(and(eq(proyectos.socioformadorId, userId), eq(proyectos.activo, true)));

  const slotsResult = await db
    .select({ total: sql<number>`sum(${proyectos.cupoDisponible})` })
    .from(proyectos)
    .where(and(eq(proyectos.socioformadorId, userId), eq(proyectos.activo, true)));

  const codesResult = await db
    .select({
      total: sql<number>`count(*)`,
      usados: sql<number>`sum(case when ${codigosProyecto.usado} then 1 else 0 end)`,
    })
    .from(codigosProyecto)
    .innerJoin(proyectos, eq(codigosProyecto.proyectoId, proyectos.id))
    .where(eq(proyectos.socioformadorId, userId));

  const activeResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(proyectos)
    .where(and(eq(proyectos.socioformadorId, userId), eq(proyectos.activo, true)));

  return {
    totalAlumnos: Number(alumnosResult[0]?.count ?? 0),
    cuposDisponibles: Number(slotsResult[0]?.total ?? 0),
    codigosUsados: Number(codesResult[0]?.usados ?? 0),
    codigosTotal: Number(codesResult[0]?.total ?? 0),
    proyectosActivos: Number(activeResult[0]?.count ?? 0),
  };
}

export async function getSocioformadorProjectsCapacity(userId: number) {
  const results = await db
    .select({
      claveProyecto: proyectos.claveProyecto,
      titulo: proyectos.titulo,
      cupoTotal: proyectos.cupoTotal,
      cupoDisponible: proyectos.cupoDisponible,
    })
    .from(proyectos)
    .where(and(eq(proyectos.socioformadorId, userId), eq(proyectos.activo, true)));

  return results.map((r) => ({
    nombre: r.claveProyecto,
    titulo: r.titulo,
    inscritos: r.cupoTotal - r.cupoDisponible,
    disponibles: r.cupoDisponible,
  }));
}

export async function getSocioformadorEnrollmentsByHour(userId: number) {
  const results = await db
    .select({
      hora: sql<number>`EXTRACT(HOUR FROM ${inscripciones.fechaInscripcion})`,
      count: sql<number>`count(*)`,
    })
    .from(inscripciones)
    .innerJoin(proyectos, eq(inscripciones.proyectoId, proyectos.id))
    .where(
      and(
        eq(proyectos.socioformadorId, userId),
        sql`DATE(${inscripciones.fechaInscripcion}) = CURRENT_DATE`
      )
    )
    .groupBy(sql`EXTRACT(HOUR FROM ${inscripciones.fechaInscripcion})`)
    .orderBy(sql`EXTRACT(HOUR FROM ${inscripciones.fechaInscripcion})`);

  const map = new Map(results.map((r) => [Number(r.hora), Number(r.count)]));
  return Array.from({ length: 24 }, (_, h) => ({
    hora: `${String(h).padStart(2, '0')}:00`,
    nuevos: map.get(h) ?? 0,
  }));
}

export async function getDashboardStats(eventoId?: number) {
  const totalStudents = await db
    .select({ count: sql<number>`count(*)` })
    .from(usuarios)
    .where(and(eq(usuarios.rol, 'student'), isNull(usuarios.deletedAt)));

  let registeredCount = { count: 0 };
  let validatedCount = { count: 0 };

  if (eventoId) {
    const registered = await db
      .select({ count: sql<number>`count(*)` })
      .from(preRegistroFeria)
      .where(eq(preRegistroFeria.eventoFeriaId, eventoId));
    registeredCount = registered[0] || { count: 0 };

    const validated = await db
      .select({ count: sql<number>`count(*)` })
      .from(preRegistroFeria)
      .where(
        and(
          eq(preRegistroFeria.eventoFeriaId, eventoId),
          eq(preRegistroFeria.estado, PreRegistroEstado.VALIDATED)
        )
      );
    validatedCount = validated[0] || { count: 0 };
  }

  const activeProjects = await db
    .select({ count: sql<number>`count(*)` })
    .from(proyectos)
    .where(eq(proyectos.activo, true));

  const totalEnrollments = await db
    .select({ count: sql<number>`count(*)` })
    .from(inscripciones);

  const availableSlots = await db
    .select({ total: sql<number>`sum(cupo_disponible)` })
    .from(proyectos)
    .where(eq(proyectos.activo, true));

  return {
    totalStudents: Number(totalStudents[0]?.count || 0),
    registeredForFair: Number(registeredCount.count || 0),
    validatedStudents: Number(validatedCount.count || 0),
    activeProjects: Number(activeProjects[0]?.count || 0),
    totalEnrollments: Number(totalEnrollments[0]?.count || 0),
    availableSlots: Number(availableSlots[0]?.total || 0),
  };
}
