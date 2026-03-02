'use server';

import { getUser, getStudentEnrollments } from '@/lib/db/queries';

export async function fetchMyEnrollments() {
  const user = await getUser();
  
  if (!user) {
    return [];
  }

  const enrollments = await getStudentEnrollments(user.id);
  return enrollments;
}
