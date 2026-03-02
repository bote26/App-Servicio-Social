'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { proyectos, usuarios, NewProyecto, UserRole } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
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
