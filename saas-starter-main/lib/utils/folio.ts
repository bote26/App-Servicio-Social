import { createHash } from 'crypto';
import {
  signEnrollment,
  verifyEnrollment,
  buildSignatureMessage,
  getPublicKeyB64,
} from './signing';

export function generateFolio(
  alumnoId:   number,
  proyectoId: number,
  periodo:    string,
): string {
  const timestamp = Date.now();
  const random    = Math.random().toString(36).substring(2, 8).toUpperCase();

  const base = `${alumnoId}-${proyectoId}-${periodo}-${timestamp}`;
  const hash = createHash('sha256').update(base).digest('hex').substring(0, 8).toUpperCase();

  const year  = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

  return `SS${year}${month}-${hash}-${random}`;
}

export function generateSystemConfirmation(
  folio:      string,
  alumnoId:   number,
  proyectoId: number,
): string {
  const timestamp = new Date().toISOString();
  const message   = buildSignatureMessage(folio, alumnoId, proyectoId, timestamp);
  const signature = signEnrollment(folio, alumnoId, proyectoId, timestamp);

  return JSON.stringify({
    algorithm:  'Ed25519',
    folio,
    timestamp,
    message,                       // mensaje canónico que fue firmado
    signature,                     // base64, 64 bytes (512 bits)
    publicKey:  getPublicKeyB64(), // llave pública para verificación offline
  });
}

/**
 * Verifica criptográficamente que la confirmación fue emitida por este sistema.
 * Funciona offline: solo necesita la llave pública (incluida en el JSON).
 */
export function verifySystemConfirmation(confirmacion: string): boolean {
  try {
    const data = JSON.parse(confirmacion);

    if (data.algorithm !== 'Ed25519') return false;
    if (!data.folio || !data.timestamp || !data.signature || !data.message) return false;

    const [folio, alumnoId, proyectoId, timestamp] = data.message.split('|');
    if (!folio || !alumnoId || !proyectoId || !timestamp) return false;

    return verifyEnrollment(
      folio,
      Number(alumnoId),
      Number(proyectoId),
      timestamp,
      data.signature,
    );
  } catch {
    return false;
  }
}
