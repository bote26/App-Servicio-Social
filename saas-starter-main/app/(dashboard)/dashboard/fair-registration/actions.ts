'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { 
  preRegistroFeria, 
  usuarios, 
  eventosFeria,
  activityLogs,
  ActivityType,
  PreRegistroEstado,
  NewPreRegistroFeria,
  NewActivityLog 
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

const fairRegistrationSchema = z.object({
  eventoFeriaId: z.coerce.number().min(1),
  horario: z.string().min(1),
  nombreCompleto: z.string().min(1, 'El nombre completo es obligatorio'),
  matricula: z.string().min(1, 'La matrícula es obligatoria'),
  correoAlternativo: z.string().email('El correo alternativo debe ser válido').min(1, 'El correo alternativo es obligatorio'),
});

export async function registerForFair(formData: FormData) {
  const user = await getUser();
  
  if (!user || user.rol !== 'student') {
    return { error: 'No autorizado' };
  }

  const rawData = Object.fromEntries(formData);
  const parsed = fairRegistrationSchema.safeParse(rawData);
  
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { eventoFeriaId, horario, nombreCompleto, matricula, correoAlternativo } = parsed.data;

  const evento = await db
    .select()
    .from(eventosFeria)
    .where(and(eq(eventosFeria.id, eventoFeriaId), eq(eventosFeria.activo, true)))
    .limit(1);

  if (!evento[0]) {
    return { error: 'El evento no existe o no está activo' };
  }

  const existingRegistration = await db
    .select()
    .from(preRegistroFeria)
    .where(
      and(
        eq(preRegistroFeria.alumnoId, user.id),
        eq(preRegistroFeria.eventoFeriaId, eventoFeriaId)
      )
    )
    .limit(1);

  if (existingRegistration[0]) {
    return { error: 'Ya estás registrado para este evento' };
  }

  await db
    .update(usuarios)
    .set({
      nombreCompleto,
      matricula,
      correoAlternativo,
      updatedAt: new Date(),
    })
    .where(eq(usuarios.id, user.id));

  const newRegistration: NewPreRegistroFeria = {
    alumnoId: user.id,
    eventoFeriaId,
    horario,
    estado: PreRegistroEstado.REGISTERED,
  };

  await db.insert(preRegistroFeria).values(newRegistration);

  const activityLog: NewActivityLog = {
    userId: user.id,
    action: ActivityType.FAIR_REGISTRATION,
    ipAddress: '',
  };
  await db.insert(activityLogs).values(activityLog);

  redirect('/dashboard/fair-registration?success=true');
}

export async function getActiveEventsForRegistration() {
  return await db
    .select()
    .from(eventosFeria)
    .where(eq(eventosFeria.activo, true));
}

export async function getMyFairRegistrations() {
  const user = await getUser();
  if (!user) return [];

  return await db
    .select({
      registration: preRegistroFeria,
      event: eventosFeria,
    })
    .from(preRegistroFeria)
    .innerJoin(eventosFeria, eq(preRegistroFeria.eventoFeriaId, eventosFeria.id))
    .where(eq(preRegistroFeria.alumnoId, user.id));
}

export async function checkRegistrationStatus() {
  const user = await getUser();
  if (!user) return null;

  const registrations = await db
    .select({
      registration: preRegistroFeria,
      event: eventosFeria,
    })
    .from(preRegistroFeria)
    .innerJoin(eventosFeria, eq(preRegistroFeria.eventoFeriaId, eventosFeria.id))
    .where(eq(preRegistroFeria.alumnoId, user.id));

  if (registrations.length === 0) {
    return { status: 'not_registered', registration: null };
  }

  const latestReg = registrations[0];
  
  return {
    status: latestReg.registration.estado,
    registration: latestReg.registration,
    event: latestReg.event,
    isValidated: latestReg.registration.estado === PreRegistroEstado.VALIDATED,
  };
}
