'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { eventosFeria, NewEventoFeria } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';

export async function fetchAllEvents() {
  await requireAdmin();
  
  return await db
    .select()
    .from(eventosFeria)
    .orderBy(desc(eventosFeria.createdAt));
}

const eventSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(150),
  fechaEvento: z.string().min(1, 'La fecha es obligatoria'),
  horaInicio: z.string().optional(),
  horaFin: z.string().optional(),
});

export async function createEvent(formData: FormData) {
  await requireAdmin();

  const rawData = Object.fromEntries(formData);
  const parsed = eventSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { nombre, fechaEvento, horaInicio, horaFin } = parsed.data;

  const newEvent: NewEventoFeria = {
    nombre,
    fechaEvento,
    horaInicio: horaInicio || null,
    horaFin: horaFin || null,
    activo: true,
  };

  await db.insert(eventosFeria).values(newEvent);

  revalidatePath('/admin/events');
  return { success: true };
}

export async function toggleEventStatus(eventId: number) {
  await requireAdmin();

  const event = await db
    .select()
    .from(eventosFeria)
    .where(eq(eventosFeria.id, eventId))
    .limit(1);

  if (!event[0]) {
    return { error: 'Evento no encontrado' };
  }

  await db
    .update(eventosFeria)
    .set({ activo: !event[0].activo })
    .where(eq(eventosFeria.id, eventId));

  revalidatePath('/admin/events');
  return { success: true };
}
