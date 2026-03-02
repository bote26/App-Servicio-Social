import { createHash, randomBytes } from 'crypto';

export function generateProjectCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  
  return code;
}

export function hashCode(code: string): string {
  return createHash('sha256').update(code.toUpperCase()).digest('hex');
}

export function verifyCode(plainCode: string, hashedCode: string): boolean {
  const hash = hashCode(plainCode);
  return hash === hashedCode;
}

export function generateMultipleCodes(count: number, length: number = 8): string[] {
  const codes = new Set<string>();
  
  while (codes.size < count) {
    codes.add(generateProjectCode(length));
  }
  
  return Array.from(codes);
}

export interface CodeWithHash {
  codigo: string;
  codigoHash: string;
}

export function generateCodesWithHashes(count: number, length: number = 8): CodeWithHash[] {
  const codes = generateMultipleCodes(count, length);
  
  return codes.map(codigo => ({
    codigo,
    codigoHash: hashCode(codigo),
  }));
}
