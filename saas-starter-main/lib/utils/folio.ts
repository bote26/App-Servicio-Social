import { createHash } from 'crypto';

export function generateFolio(
  alumnoId: number,
  proyectoId: number,
  periodo: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const base = `${alumnoId}-${proyectoId}-${periodo}-${timestamp}`;
  const hash = createHash('sha256').update(base).digest('hex').substring(0, 8).toUpperCase();
  
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  return `SS${year}${month}-${hash}-${random}`;
}

export function generateSystemConfirmation(
  folio: string,
  alumnoId: number,
  proyectoId: number
): string {
  const timestamp = new Date().toISOString();
  const data = `${folio}|${alumnoId}|${proyectoId}|${timestamp}`;
  const signature = createHash('sha256').update(data + process.env.AUTH_SECRET).digest('hex');
  
  return JSON.stringify({
    folio,
    timestamp,
    signature: signature.substring(0, 32),
    verified: true,
  });
}

export function verifySystemConfirmation(confirmacion: string): boolean {
  try {
    const data = JSON.parse(confirmacion);
    return data.verified === true && data.signature && data.folio;
  } catch {
    return false;
  }
}
