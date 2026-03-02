import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  
  if (!user) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    id: user.id,
    email: user.correoInstitucional,
    name: user.nombreCompleto,
    matricula: user.matricula,
    rol: user.rol,
    numeroPersonal: user.numeroPersonal,
    correoAlternativo: user.correoAlternativo,
  });
}
