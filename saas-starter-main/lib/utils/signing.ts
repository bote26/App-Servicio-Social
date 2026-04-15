/**
 * Firma digital con Ed25519 (RFC 8032).
 *
 * Ed25519 es un esquema de firma de curva elíptica (Curve25519) que:
 *  - Usa SHA-512 internamente para el hash del mensaje
 *  - Produce firmas de 64 bytes (512 bits) — 88 chars en base64
 *  - La llave privada firma; la llave pública verifica (asimétrico)
 *  - Nadie puede falsificar la firma sin la llave privada
 *
 * Mensaje canónico firmado:
 *   "<folio>|<alumnoId>|<proyectoId>|<timestamp ISO>"
 *
 * Variables de entorno requeridas:
 *   SIGNING_PRIVATE_KEY  — DER PKCS8 en base64 (solo servidor)
 *   SIGNING_PUBLIC_KEY   — DER SPKI en base64  (puede ser pública)
 *
 * Para generar el par de llaves ejecuta:
 *   npx tsx lib/scripts/generate-keys.ts
 */

import { createPrivateKey, createPublicKey, sign, verify } from 'crypto';

// ── Helpers para cargar llaves ────────────────────────────────────────────────

function loadPrivateKey() {
  const b64 = process.env.SIGNING_PRIVATE_KEY;
  if (!b64) throw new Error('SIGNING_PRIVATE_KEY no está definida en .env');
  return createPrivateKey({
    key:    Buffer.from(b64, 'base64'),
    format: 'der',
    type:   'pkcs8',
  });
}

function loadPublicKey() {
  const b64 = process.env.SIGNING_PUBLIC_KEY;
  if (!b64) throw new Error('SIGNING_PUBLIC_KEY no está definida en .env');
  return createPublicKey({
    key:    Buffer.from(b64, 'base64'),
    format: 'der',
    type:   'spki',
  });
}

// ── Mensaje canónico ──────────────────────────────────────────────────────────

export function buildSignatureMessage(
  folio:      string,
  alumnoId:   number,
  proyectoId: number,
  timestamp:  string,
): string {
  return `${folio}|${alumnoId}|${proyectoId}|${timestamp}`;
}

// ── Firma ────────────────────────────────────────────────────────────────────
//
//  sign(null, ...) → null indica que Ed25519 maneja el hash internamente.
//  No se puede especificar otro algoritmo de hash para Ed25519.

export function signEnrollment(
  folio:      string,
  alumnoId:   number,
  proyectoId: number,
  timestamp:  string,
): string {
  const message    = buildSignatureMessage(folio, alumnoId, proyectoId, timestamp);
  const privateKey = loadPrivateKey();
  const sigBuffer  = sign(null, Buffer.from(message, 'utf8'), privateKey);
  return sigBuffer.toString('base64');
}

// ── Verificación ─────────────────────────────────────────────────────────────

export function verifyEnrollment(
  folio:        string,
  alumnoId:     number,
  proyectoId:   number,
  timestamp:    string,
  signatureB64: string,
): boolean {
  try {
    const message   = buildSignatureMessage(folio, alumnoId, proyectoId, timestamp);
    const publicKey = loadPublicKey();
    return verify(
      null,
      Buffer.from(message, 'utf8'),
      publicKey,
      Buffer.from(signatureB64, 'base64'),
    );
  } catch {
    return false;
  }
}

// ── Llave pública en base64 (para incrustar en el certificado) ────────────────

export function getPublicKeyB64(): string {
  return process.env.SIGNING_PUBLIC_KEY ?? '';
}
