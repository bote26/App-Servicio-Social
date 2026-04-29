'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Upload, FileText, X, CheckCircle, AlertCircle,
  SkipForward, Download, UserCheck, UserX, TriangleAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  importProjectsFromCSV,
  validateSocioformadorEmails,
  type CsvImportResult,
  type SocioMatch,
} from '../actions';

// ── CSV headers ───────────────────────────────────────────────────────────────
const REQUIRED_HEADERS = ['claveProyecto', 'titulo', 'periodo', 'horas', 'cupoTotal', 'tipoProyecto'];
const ALL_HEADERS = [
  'claveProyecto', 'titulo', 'organizacion', 'periodo', 'tipoProyecto', 'horas', 'cupoTotal',
  'modalidad', 'ubicacion', 'horarioProyecto', 'carrera',
  'descripcion', 'objetivo', 'actividades',
  'socioformadorCorreo', 'logoUrl', 'activo',
];

// ── CSV template ──────────────────────────────────────────────────────────────
const TEMPLATE_HEADER = ALL_HEADERS.join(',');
const TEMPLATE_ROW =
  'WA1234-101,"Proyecto de ejemplo","Organizacion ABC",' +
  '"Febrero - Junio 2026",Semestral,120,10,Presencial,"Calle 123 Col. Centro",' +
  '"Lunes a viernes 9:00-14:00","ICT,IRS",' +
  '"Descripcion breve","Objetivo del proyecto","Actividad 1; Actividad 2",' +
  '"socio@org.mx","",true';

function downloadTemplate() {
  const csv = `${TEMPLATE_HEADER}\n${TEMPLATE_ROW}\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_proyectos.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Simple CSV parser (handles quoted fields) ─────────────────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQ = !inQ; }
    } else if (ch === ',' && !inQ) {
      result.push(cur.trim()); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } | { error: string } {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length < 2) return { error: 'El archivo debe tener encabezados y al menos una fila de datos.' };
  const headers = parseCSVLine(lines[0]);
  const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
  if (missing.length > 0) return { error: `Faltan columnas obligatorias: ${missing.join(', ')}` };
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
    rows.push(row);
  }
  return { headers, rows };
}

// ── Component ─────────────────────────────────────────────────────────────────
type Step = 'upload' | 'validating' | 'preview' | 'done';

export default function ImportProjectsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  // Map of lowercased email → SocioMatch (from server pre-validation)
  const [socioMap, setSocioMap] = useState<Record<string, SocioMatch | null>>({});
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasSocioCol = headers.includes('socioformadorCorreo');

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) { setParseError('Solo se aceptan archivos .csv'); return; }
    setFileName(file.name);
    setParseError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if ('error' in parsed) { setParseError(parsed.error); return; }
      setHeaders(parsed.headers);
      setRows(parsed.rows);

      // Pre-validate socioformador emails server-side
      const emails = parsed.rows
        .map(r => r.socioformadorCorreo?.trim())
        .filter(Boolean) as string[];

      if (emails.length > 0) {
        setStep('validating');
        startTransition(async () => {
          const map = await validateSocioformadorEmails(JSON.stringify(emails));
          setSocioMap(map);
          setStep('preview');
        });
      } else {
        setSocioMap({});
        setStep('preview');
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleImport() {
    startTransition(async () => {
      const res = await importProjectsFromCSV(JSON.stringify(rows));
      setResult(res);
      setStep('done');
    });
  }

  function reset() {
    setStep('upload');
    setFileName('');
    setParseError('');
    setHeaders([]);
    setRows([]);
    setSocioMap({});
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  // Socioformador summary for preview banner
  const socioEmails = hasSocioCol
    ? rows.map(r => r.socioformadorCorreo?.trim().toLowerCase()).filter(Boolean) as string[]
    : [];
  const matchedCount   = socioEmails.filter(e => socioMap[e] != null).length;
  const unmatchedCount = socioEmails.filter(e => e && socioMap[e] == null).length;

  // Preview columns: required first, then socioformadorCorreo pinned, then rest
  const previewCols = [
    ...REQUIRED_HEADERS.filter(h => headers.includes(h)),
    ...(hasSocioCol ? ['socioformadorCorreo'] : []),
    ...headers.filter(h => !REQUIRED_HEADERS.includes(h) && h !== 'socioformadorCorreo'),
  ].slice(0, 8);

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <Link href="/admin/projects" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver a proyectos
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Importar Proyectos desde CSV</h1>
          <p className="text-gray-600 text-sm mt-1">
            Sube un archivo CSV para crear multiples proyectos de forma automatica.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Descargar plantilla
        </Button>
      </div>

      {/* ── Step: upload ── */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seleccionar archivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
              <p className="font-medium text-gray-700">Arrastra tu archivo CSV aqui</p>
              <p className="text-sm text-gray-500 mt-1">o haz clic para seleccionar</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>

            {parseError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {parseError}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Columnas del CSV</p>
              <div className="flex flex-wrap gap-2">
                {ALL_HEADERS.map(h => (
                  <span key={h} className={`px-2 py-0.5 rounded text-xs font-mono ${
                    REQUIRED_HEADERS.includes(h) ? 'bg-blue-100 text-blue-700 font-semibold' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {h}{REQUIRED_HEADERS.includes(h) && ' *'}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Las columnas con <span className="text-blue-700 font-semibold">*</span> son obligatorias.
                {' '}El correo del socioformador debe coincidir exactamente con el registrado en el sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step: validating ── */}
      {step === 'validating' && (
        <Card>
          <CardContent className="py-16 text-center">
            <span className="inline-block h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-700 font-medium">Verificando correos de socioformadores...</p>
          </CardContent>
        </Card>
      )}

      {/* ── Step: preview ── */}
      {step === 'preview' && (
        <div className="space-y-4">
          {/* File info bar */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-blue-800">
              <FileText className="h-4 w-4" />
              <span className="font-medium text-sm">{fileName}</span>
              <span className="text-blue-600 text-sm">— {rows.length} fila{rows.length !== 1 ? 's' : ''}</span>
            </div>
            <button onClick={reset} className="text-blue-600 hover:text-blue-800"><X className="h-4 w-4" /></button>
          </div>

          {/* Socioformador validation summary */}
          {hasSocioCol && (matchedCount > 0 || unmatchedCount > 0) && (
            <div className={`rounded-lg border p-4 ${
              unmatchedCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
            }`}>
              <p className={`font-medium text-sm mb-2 flex items-center gap-2 ${
                unmatchedCount > 0 ? 'text-yellow-800' : 'text-green-800'
              }`}>
                {unmatchedCount > 0
                  ? <><TriangleAlert className="h-4 w-4" /> Algunos correos de socioformador no coinciden</>
                  : <><UserCheck className="h-4 w-4" /> Todos los socioformadores fueron encontrados</>
                }
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                {matchedCount > 0 && (
                  <span className="flex items-center gap-1 text-green-700">
                    <UserCheck className="h-3.5 w-3.5" />
                    {matchedCount} vinculado{matchedCount !== 1 ? 's' : ''}
                  </span>
                )}
                {unmatchedCount > 0 && (
                  <span className="flex items-center gap-1 text-yellow-700">
                    <UserX className="h-3.5 w-3.5" />
                    {unmatchedCount} no encontrado{unmatchedCount !== 1 ? 's' : ''} — se importaran sin socioformador
                  </span>
                )}
              </div>
              {unmatchedCount > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(socioMap)
                    .filter(([, v]) => v == null)
                    .map(([email]) => (
                      <span key={email} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-mono">
                        {email}
                      </span>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Preview table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Vista previa</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                      {previewCols.map(h => (
                        <th key={h} className={`px-4 py-2 text-left text-xs font-semibold uppercase ${
                          REQUIRED_HEADERS.includes(h) ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {h === 'socioformadorCorreo' ? 'Socioformador' : h}
                        </th>
                      ))}
                      {headers.length > previewCols.length && (
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase">
                          +{headers.length - previewCols.length} mas
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-400 text-xs">{i + 2}</td>
                        {previewCols.map(h => {
                          if (h === 'socioformadorCorreo') {
                            const email = row[h]?.trim();
                            const emailKey = email?.toLowerCase() ?? '';
                            const match = email ? socioMap[emailKey] : undefined;
                            return (
                              <td key={h} className="px-4 py-2 max-w-[180px]">
                                {!email ? (
                                  <span className="text-gray-300 italic text-xs">Sin asignar</span>
                                ) : match ? (
                                  <span className="flex items-center gap-1 text-green-700 text-xs">
                                    <UserCheck className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate" title={match.nombre ?? email}>
                                      {match.nombre ?? email}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-yellow-700 text-xs">
                                    <UserX className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate font-mono" title={email}>{email}</span>
                                  </span>
                                )}
                              </td>
                            );
                          }
                          return (
                            <td key={h} className="px-4 py-2 text-gray-700 max-w-[160px] truncate" title={row[h]}>
                              {row[h] || <span className="text-gray-300 italic">—</span>}
                            </td>
                          );
                        })}
                        {headers.length > previewCols.length && (
                          <td className="px-4 py-2 text-gray-400 text-xs">...</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={handleImport} disabled={isPending || rows.length === 0} className="bg-blue-600 hover:bg-blue-700">
              {isPending ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Importando {rows.length} proyectos...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar {rows.length} proyecto{rows.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={reset} disabled={isPending}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* ── Step: done ── */}
      {step === 'done' && result && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className={`grid gap-4 ${result.warnings.length > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-green-700">{result.created}</div>
              <div className="text-sm text-green-600">Creados</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <SkipForward className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-yellow-700">{result.skipped.length}</div>
              <div className="text-sm text-yellow-600">Omitidos (ya existen)</div>
            </div>
            {result.warnings.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                <TriangleAlert className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-orange-700">{result.warnings.length}</div>
                <div className="text-sm text-orange-600">Sin socioformador</div>
              </div>
            )}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-red-700">{result.errors.length}</div>
              <div className="text-sm text-red-600">Errores</div>
            </div>
          </div>

          {/* Skipped */}
          {result.skipped.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-700 flex items-center gap-2">
                  <SkipForward className="h-4 w-4" />
                  Proyectos omitidos (clave duplicada)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.skipped.map(c => (
                    <span key={c} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-mono">{c}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings — socioformador not found */}
          {result.warnings.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
                  <UserX className="h-4 w-4" />
                  Proyectos sin socioformador vinculado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-orange-600 mb-3">
                  Estos proyectos fueron creados correctamente pero el correo indicado no corresponde a ningun socioformador registrado.
                  Puedes asignarlo desde la edicion del proyecto.
                </p>
                <ul className="space-y-1">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                      <span className="text-orange-400 font-mono text-xs mt-0.5 shrink-0">Fila {w.row}</span>
                      <span className="font-mono text-xs bg-orange-50 px-1 rounded shrink-0">{w.clave}</span>
                      <span>{w.message}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Errors */}
          {result.errors.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Errores de validacion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                      <span className="text-red-400 font-mono text-xs mt-0.5 shrink-0">Fila {err.row}</span>
                      {err.clave && <span className="font-mono text-xs bg-red-50 px-1 rounded shrink-0">{err.clave}</span>}
                      <span>{err.message}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/admin/projects">Ver proyectos</Link>
            </Button>
            <Button variant="outline" onClick={reset}>Importar otro archivo</Button>
          </div>
        </div>
      )}
    </div>
  );
}
