import { jsPDF } from 'jspdf';

export interface CertificateData {
  student: {
    nombreCompleto: string;
    matricula: string | null;
    correoInstitucional: string;
  };
  project: {
    claveProyecto: string;
    titulo: string;
    organizacion: string | null;
    horas: number;
    modalidad: string | null;
    periodo: string;
    ubicacion: string | null;
  };
  inscription: {
    folio: string;
    fechaInscripcion: Date | string;
    confirmacionSistema: string | null;
  };
}

interface ParsedConfirmacion {
  algorithm: string;
  timestamp: string;
  message:   string;
  signature: string;
  publicKey: string;
}

function parseConfirmacion(raw: string | null): ParsedConfirmacion {
  try {
    if (!raw) throw new Error('empty');
    const d = JSON.parse(raw);
    if (!d.algorithm) {
      return { algorithm: 'SHA-256 (legacy)', timestamp: d.timestamp ?? '', message: '', signature: d.signature ?? '', publicKey: '' };
    }
    return { algorithm: d.algorithm ?? 'Ed25519', timestamp: d.timestamp ?? '', message: d.message ?? '', signature: d.signature ?? '', publicKey: d.publicKey ?? '' };
  } catch {
    return { algorithm: '', timestamp: '', message: '', signature: '', publicKey: '' };
  }
}

function rr(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, style: 'F' | 'S' | 'FD' = 'S') {
  doc.roundedRect(x, y, w, h, r, r, style);
}

/**
 * Layout vertical (todas las medidas en mm, origen = top-left):
 *
 *  margin = 15
 *  ph     = 279.4  (letter)
 *
 *  Sección                y inicio    altura    y fin
 *  ─────────────────────────────────────────────────
 *  Header bg              11          38        49
 *  y_content start        59          —         —
 *  "Se certifica" text    59          —         —
 *  (gap)                             8
 *  Student block          67          24        91
 *  (gap)                             7
 *  Project label          98          —         —
 *  (gap)                             4
 *  Project block          102         40        142
 *  (gap)                             7
 *  Folio label            149         —         —
 *  (gap)                             4
 *  Folio block            153         16        169
 *  (gap)                             7
 *  Sig label              176         —         —
 *  (gap)                             4
 *  Sig block              180         62        242
 *  (gap)                             6
 *  Footer text            248         —         —
 *  Bottom accent line     262.4       —         —
 *  Footer labels          265         —         —
 */
export function generateCertificatePDF(data: CertificateData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  const pw      = doc.internal.pageSize.getWidth();   // 215.9
  const ph      = doc.internal.pageSize.getHeight();  // 279.4
  const margin  = 15;
  const cw      = pw - margin * 2;                    // 185.9
  const cx      = pw / 2;

  const conf        = parseConfirmacion(data.inscription.confirmacionSistema);
  const isEd25519   = conf.algorithm === 'Ed25519';
  const enrollDate  = new Date(data.inscription.fechaInscripcion);
  const dateStr     = enrollDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr     = enrollDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  // ─── Page borders ────────────────────────────────────────────────────────
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1.2);
  rr(doc, margin - 4, margin - 4, cw + 8, ph - (margin - 4) * 2, 4, 'S');

  doc.setDrawColor(96, 165, 250);
  doc.setLineWidth(0.4);
  rr(doc, margin - 2, margin - 2, cw + 4, ph - (margin - 2) * 2, 3, 'S');

  // ─── Header (height = 38) ────────────────────────────────────────────────
  const hdrH  = 38;
  const hdrY  = margin - 4;   // 11

  doc.setFillColor(30, 58, 138);
  rr(doc, hdrY, hdrY, cw + 8, hdrH, 4, 'F');
  // Square off bottom corners
  doc.rect(hdrY, hdrY + hdrH - 10, cw + 8, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(147, 197, 253);
  doc.text('TECNOLOGICO DE MONTERREY', cx, hdrY + 9, { align: 'center' });

  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text('CERTIFICADO DE INSCRIPCION', cx, hdrY + 21, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254);
  doc.text('Sistema de Servicio Social  -  Documento Oficial', cx, hdrY + 30, { align: 'center' });

  // ─── Content start ───────────────────────────────────────────────────────
  let y = margin + 44; // 59

  // "Se certifica que"
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text('Se certifica que el siguiente estudiante ha sido inscrito al programa de Servicio Social:', cx, y, { align: 'center' });

  y += 8; // 67

  // ─── Student block (h = 24) ──────────────────────────────────────────────
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.5);
  rr(doc, margin, y, cw, 24, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text(data.student.nombreCompleto, cx, y + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128);
  const studentMeta = [
    data.student.matricula ? `Matricula: ${data.student.matricula}` : null,
    `Correo: ${data.student.correoInstitucional}`,
  ].filter(Boolean).join('   -   ');
  doc.text(studentMeta, cx, y + 19, { align: 'center' });

  y += 24 + 7; // 98

  // ─── Project label ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(99, 102, 241);
  doc.text('PROYECTO DE SERVICIO SOCIAL', margin, y);

  y += 4; // 102

  // ─── Project block (h = 40) ──────────────────────────────────────────────
  doc.setFillColor(250, 245, 255);
  doc.setDrawColor(196, 181, 253);
  doc.setLineWidth(0.5);
  rr(doc, margin, y, cw, 40, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(76, 29, 149);
  const titleLines = doc.splitTextToSize(data.project.titulo, cw - 10) as string[];
  doc.text(titleLines, cx, y + 8, { align: 'center' });

  const titleH = titleLines.length * 5.2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128);
  doc.text(data.project.organizacion ?? '', cx, y + 8 + titleH + 2, { align: 'center' });

  const projMeta = [
    `Clave: ${data.project.claveProyecto}`,
    `Periodo: ${data.project.periodo}`,
    `${data.project.horas} horas`,
    data.project.modalidad ?? '',
  ].filter(Boolean).join('   -   ');

  doc.setFontSize(8);
  doc.text(projMeta, cx, y + 8 + titleH + 10, { align: 'center' });

  if (data.project.ubicacion) {
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    const ubLines = doc.splitTextToSize(`Ubicacion: ${data.project.ubicacion}`, cw - 10) as string[];
    doc.text(ubLines, cx, y + 8 + titleH + 18, { align: 'center' });
  }

  y += 40 + 7; // 149

  // ─── Folio label ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(99, 102, 241);
  doc.text('FOLIO DE INSCRIPCION', margin, y);

  y += 4; // 153

  // ─── Folio block (h = 16) ────────────────────────────────────────────────
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(165, 180, 252);
  doc.setLineWidth(0.8);
  rr(doc, margin, y, cw, 16, 3, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(67, 56, 202);
  doc.text(data.inscription.folio, cx, y + 10.5, { align: 'center' });

  y += 16 + 7; // 176

  // ─── Signature label ─────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('FIRMA DIGITAL', margin, y);

  y += 4; // 180

  // ─── Signature block (h = 62) ────────────────────────────────────────────
  const sigH = 62;

  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(110, 231, 183);
  doc.setLineWidth(0.5);
  rr(doc, margin, y, cw, sigH, 3, 'FD');

  // Badge
  const badgeW = isEd25519 ? 50 : 44;
  doc.setFillColor(...(isEd25519 ? [16, 185, 129] as const : [245, 158, 11] as const));
  rr(doc, margin + 5, y + 5, badgeW, 8, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    isEd25519 ? 'Ed25519 VERIFICADO' : 'SHA-256 LEGACY',
    margin + 5 + badgeW / 2, y + 10.2,
    { align: 'center' },
  );

  // Emisor — derecha de la misma fila que el badge
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(6, 78, 59);
  doc.text('Sistema de Servicio Social - TEC', margin + cw - 5, y + 10.2, { align: 'right' });

  // Algoritmo + Fecha en una fila horizontal
  const infoY = y + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(6, 78, 59);
  doc.text('Algoritmo:', margin + 5, infoY);
  doc.setFont('courier', 'normal');
  doc.setTextColor(4, 120, 87);
  doc.text(conf.algorithm || 'Ed25519', margin + 28, infoY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text('Fecha de emision:', cx + 2, infoY);
  doc.setFont('courier', 'normal');
  doc.setTextColor(4, 120, 87);
  doc.text(`${dateStr}  ${timeStr}`, cx + 32, infoY);

  // Separador
  doc.setDrawColor(167, 243, 208);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, y + 22, margin + cw - 5, y + 22);

  // Filas de datos criptograficos
  const lx  = margin + 5;
  const vx  = margin + 32;
  const vw  = cw - 37;
  let   ry  = y + 28;

  const row = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(6, 78, 59);
    doc.text(label, lx, ry);
    doc.setFont('courier', 'normal');
    doc.setTextColor(4, 120, 87);
    const lines = doc.splitTextToSize(value, vw) as string[];
    doc.text(lines, vx, ry);
    ry += lines.length > 1 ? 6 + (lines.length - 1) * 4.5 : 6;
  };

  row('Mensaje:', conf.message || '—');
  row('Firma:', conf.signature || '—');
  if (conf.publicKey) {
    row('Llave pub.:', conf.publicKey.slice(0, 48) + '...');
  }

  y += sigH + 6; // 248

  // ─── Footer text ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(156, 163, 175);
  doc.text(
    'Certificado firmado con Ed25519 (RFC 8032). Verificable offline con la llave publica incluida en este documento.',
    cx, y, { align: 'center' },
  );

  // ─── Bottom accent line ───────────────────────────────────────────────────
  const bottomLineY = ph - margin - 2; // 262.4
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.8);
  doc.line(margin, bottomLineY, margin + cw, bottomLineY);

  const genDate = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generado el ${genDate}`, margin, bottomLineY + 4);
  doc.text('Tecnologico de Monterrey - Servicio Social', margin + cw, bottomLineY + 4, { align: 'right' });

  return doc;
}
