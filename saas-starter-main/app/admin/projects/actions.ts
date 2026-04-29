'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { proyectos, usuarios, NewProyecto, UserRole } from '@/lib/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/middleware';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const projectSchema = z.object({
  claveProyecto: z.string().min(1, 'La clave es obligatoria').max(30),
  titulo: z.string().min(1, 'El título es obligatorio').max(255),
  organizacion: z.string().max(150).optional(),
  descripcion: z.string().optional(),
  objetivo: z.string().optional(),
  actividades: z.string().optional(),
  periodo: z.string().min(1, 'El periodo es obligatorio').max(100),
  tipoProyecto: z.enum(['Intensivo', 'Semestral', 'General', '']).optional(),
  horas: z.coerce.number().min(1, 'Las horas son obligatorias'),
  carrera: z.string().max(100).optional(),
  modalidad: z.string().max(20).optional(),
  ubicacion: z.string().optional(),
  horarioProyecto: z.string().max(100).optional(),
  cupoTotal: z.coerce.number().min(1, 'El cupo es obligatorio'),
  socioformadorId: z.coerce.number().optional(),
  logoUrl: z.string().optional(),
  activo: z.coerce.boolean().optional(),
});

export async function createProject(formData: FormData) {
  await requireAdmin();

  const rawData = Object.fromEntries(formData);
  const parsed = projectSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const data = parsed.data;

  const existing = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.claveProyecto, data.claveProyecto))
    .limit(1);

  if (existing.length > 0) {
    return { error: 'Ya existe un proyecto con esta clave' };
  }

  const newProject: NewProyecto = {
    claveProyecto: data.claveProyecto,
    titulo: data.titulo,
    organizacion: data.organizacion || null,
    descripcion: data.descripcion || null,
    objetivo: data.objetivo || null,
    actividades: data.actividades || null,
    periodo: data.periodo,
    tipoProyecto: data.tipoProyecto || null,
    horas: data.horas,
    carrera: data.carrera || null,
    modalidad: data.modalidad || null,
    ubicacion: data.ubicacion || null,
    horarioProyecto: data.horarioProyecto || null,
    cupoTotal: data.cupoTotal,
    cupoDisponible: data.cupoTotal,
    socioformadorId: data.socioformadorId || null,
    logoUrl: data.logoUrl || null,
    activo: data.activo ?? true,
  };

  await db.insert(proyectos).values(newProject);

  revalidatePath('/admin/projects');
  redirect('/admin/projects');
}

export async function updateProject(projectId: number, formData: FormData) {
  await requireAdmin();

  const rawData = Object.fromEntries(formData);
  const parsed = projectSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const data = parsed.data;

  const existing = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, projectId))
    .limit(1);

  if (!existing[0]) {
    return { error: 'Proyecto no encontrado' };
  }

  const cupoChange = data.cupoTotal - existing[0].cupoTotal;
  const newCupoDisponible = Math.max(0, existing[0].cupoDisponible + cupoChange);

  await db
    .update(proyectos)
    .set({
      claveProyecto: data.claveProyecto,
      titulo: data.titulo,
      organizacion: data.organizacion || null,
      descripcion: data.descripcion || null,
      objetivo: data.objetivo || null,
      actividades: data.actividades || null,
      periodo: data.periodo,
      tipoProyecto: data.tipoProyecto || null,
      horas: data.horas,
      carrera: data.carrera || null,
      modalidad: data.modalidad || null,
      ubicacion: data.ubicacion || null,
      horarioProyecto: data.horarioProyecto || null,
      cupoTotal: data.cupoTotal,
      cupoDisponible: newCupoDisponible,
      socioformadorId: data.socioformadorId || null,
      logoUrl: data.logoUrl || null,
      activo: data.activo ?? true,
      updatedAt: new Date(),
    })
    .where(eq(proyectos.id, projectId));

  revalidatePath('/admin/projects');
  redirect('/admin/projects');
}

export async function toggleProjectStatus(projectId: number) {
  await requireAdmin();

  const project = await db
    .select()
    .from(proyectos)
    .where(eq(proyectos.id, projectId))
    .limit(1);

  if (!project[0]) {
    return { error: 'Proyecto no encontrado' };
  }

  await db
    .update(proyectos)
    .set({ activo: !project[0].activo, updatedAt: new Date() })
    .where(eq(proyectos.id, projectId));

  revalidatePath('/admin/projects');
  return { success: true };
}

export async function getSocioformadores() {
  return await db
    .select({
      id: usuarios.id,
      nombre: usuarios.nombreCompleto,
      correo: usuarios.correoInstitucional,
    })
    .from(usuarios)
    .where(eq(usuarios.rol, UserRole.SOCIOFORMADOR));
}

// ── CSV bulk import ───────────────────────────────────────────────────────────

export interface CsvImportResult {
  created: number;
  skipped: string[];   // claves that already existed
  errors:   { row: number; clave: string; message: string }[];
  warnings: { row: number; clave: string; message: string }[];  // e.g. socioformador not found
}

// ── Socioformador email pre-validation ────────────────────────────────────────

export interface SocioMatch {
  id: number;
  nombre: string | null;
  correo: string;
}

/**
 * Given a JSON-encoded array of emails, returns a map { email → SocioMatch | null }
 * for all unique addresses.  Used by the import preview to show matched/unmatched
 * socioformadores before the user confirms the import.
 */
export async function validateSocioformadorEmails(
  emailsJson: string
): Promise<Record<string, SocioMatch | null>> {
  await requireAdmin();

  const emails: string[] = JSON.parse(emailsJson);
  const unique = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(Boolean))];

  if (unique.length === 0) return {};

  // Fetch all socioformadores whose lowercased email matches any of the provided emails.
  // We do a full scan of socioformadores and filter in JS to avoid SQL injection.
  const allSocios = await db
    .select({
      id:     usuarios.id,
      nombre: usuarios.nombreCompleto,
      correo: usuarios.correoInstitucional,
    })
    .from(usuarios)
    .where(eq(usuarios.rol, UserRole.SOCIOFORMADOR));

  const matches = allSocios.filter(s => unique.includes(s.correo.toLowerCase()));

  const result: Record<string, SocioMatch | null> = {};
  for (const email of unique) {
    result[email] = null;
  }
  for (const m of matches) {
    result[m.correo.toLowerCase()] = m;
  }
  return result;
}

/**
 * Receives a JSON-serialised array of raw row objects (string values) parsed
 * client-side from the CSV.  Validates each row, skips duplicates and inserts
 * the rest.  Returns a summary so the UI can display results.
 */
export async function importProjectsFromCSV(rowsJson: string): Promise<CsvImportResult> {
  await requireAdmin();

  const rows: Record<string, string>[] = JSON.parse(rowsJson);
  const result: CsvImportResult = { created: 0, skipped: [], errors: [], warnings: [] };

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowNum = i + 2; // +1 header, +1 for 1-based display
    const clave = raw.claveProyecto?.trim() ?? '';

    const parsed = projectSchema.safeParse({
      claveProyecto:   raw.claveProyecto?.trim(),
      titulo:          raw.titulo?.trim(),
      organizacion:    raw.organizacion?.trim() || undefined,
      descripcion:     raw.descripcion?.trim()  || undefined,
      objetivo:        raw.objetivo?.trim()      || undefined,
      actividades:     raw.actividades?.trim()   || undefined,
      periodo:         raw.periodo?.trim(),
      tipoProyecto:    raw.tipoProyecto?.trim()  || undefined,
      horas:           raw.horas?.trim(),
      carrera:         raw.carrera?.trim()         || undefined,
      modalidad:       raw.modalidad?.trim()       || undefined,
      ubicacion:       raw.ubicacion?.trim()       || undefined,
      horarioProyecto: raw.horarioProyecto?.trim() || undefined,
      cupoTotal:       raw.cupoTotal?.trim(),
      logoUrl:         raw.logoUrl?.trim()         || undefined,
      activo:          raw.activo?.trim()          || 'true',
    });

    if (!parsed.success) {
      result.errors.push({
        row: rowNum,
        clave,
        message: parsed.error.errors[0].message,
      });
      continue;
    }

    const data = parsed.data;

    // Resolve socioformador by email — case-insensitive, role-filtered
    let socioformadorId: number | null = null;
    const socioEmail = raw.socioformadorCorreo?.trim();
    if (socioEmail) {
      const socio = await db
        .select({ id: usuarios.id, nombre: usuarios.nombreCompleto })
        .from(usuarios)
        .where(
          and(
            eq(usuarios.rol, UserRole.SOCIOFORMADOR),
            sql`lower(${usuarios.correoInstitucional}) = lower(${socioEmail})`
          )
        )
        .limit(1);

      if (socio[0]) {
        socioformadorId = socio[0].id;
      } else {
        // Email provided but no matching socioformador found — warn but still create the project
        result.warnings.push({
          row: rowNum,
          clave,
          message: `Socioformador con correo "${socioEmail}" no encontrado. El proyecto se creó sin socioformador asignado.`,
        });
      }
    }

    // Skip if clave already exists
    const existing = await db
      .select({ id: proyectos.id })
      .from(proyectos)
      .where(eq(proyectos.claveProyecto, data.claveProyecto))
      .limit(1);

    if (existing.length > 0) {
      result.skipped.push(data.claveProyecto);
      continue;
    }

    await db.insert(proyectos).values({
      claveProyecto:   data.claveProyecto,
      titulo:          data.titulo,
      organizacion:    data.organizacion    ?? null,
      descripcion:     data.descripcion     ?? null,
      objetivo:        data.objetivo        ?? null,
      actividades:     data.actividades     ?? null,
      periodo:         data.periodo,
      tipoProyecto:    data.tipoProyecto    || null,
      horas:           data.horas,
      carrera:         data.carrera         ?? null,
      modalidad:       data.modalidad       ?? null,
      ubicacion:       data.ubicacion       ?? null,
      horarioProyecto: data.horarioProyecto ?? null,
      cupoTotal:       data.cupoTotal,
      cupoDisponible:  data.cupoTotal,
      socioformadorId,
      logoUrl:         data.logoUrl         ?? null,
      activo:          data.activo          ?? true,
    });

    result.created++;
  }

  revalidatePath('/admin/projects');
  return result;
}
