/**
 * Genera un par de llaves Ed25519 para firma de certificados.
 *
 * Uso:
 *   npx tsx lib/scripts/generate-keys.ts
 *
 * Copia las dos líneas que imprime en tu archivo .env
 */

import { generateKeyPairSync } from 'crypto';

const { privateKey, publicKey } = generateKeyPairSync('ed25519', {
  privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  publicKeyEncoding:  { type: 'spki',  format: 'der' },
});

console.log('\n✅  Par de llaves Ed25519 generado. Añade estas líneas a tu .env:\n');
console.log(`SIGNING_PRIVATE_KEY=${privateKey.toString('base64')}`);
console.log(`SIGNING_PUBLIC_KEY=${publicKey.toString('base64')}`);
console.log('\n⚠️   Guarda SIGNING_PRIVATE_KEY en un lugar seguro. Nunca la expongas públicamente.\n');
