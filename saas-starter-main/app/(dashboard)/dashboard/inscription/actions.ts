'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { registrations, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

const saveRegistrationsSchema = z.object({
    timeSlots: z.array(z.number().min(9).max(17)).max(3),
});

export async function saveRegistrations(data: { timeSlots: number[] }) {
    const user = await getUser();

    if (!user || user.role !== 'student') {
        return { error: 'Unauthorized or invalid role' };
    }

    const { timeSlots } = saveRegistrationsSchema.parse(data);

    if (timeSlots.length > 3) {
        return { error: 'You can select a maximum of 3 schedules.' };
    }

    // Delete existing registrations
    await db.delete(registrations).where(eq(registrations.userId, user.id));

    // Insert new registrations
    if (timeSlots.length > 0) {
        await db.insert(registrations).values(
            timeSlots.map((slot) => ({
                userId: user.id,
                timeSlot: slot,
            }))
        );
    }

    redirect('/dashboard');
}

export async function getRegistrations() {
    const user = await getUser();
    if (!user) return [];

    const userRegistrations = await db
        .select()
        .from(registrations)
        .where(eq(registrations.userId, user.id));

    return userRegistrations.map((r) => r.timeSlot);
}
