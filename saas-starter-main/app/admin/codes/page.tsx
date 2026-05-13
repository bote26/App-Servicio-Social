'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  KeyRound, Download, Plus, Loader2, CheckCircle, 
  Clock, Copy, AlertCircle, FileText 
} from 'lucide-react';
import { 
  getProjectCodes, 
  generateCodes, 
  getProjectsForCodeGeneration,
  exportCodesToCSV,
  getAllProjectsWithCodes 
} from './actions';
import { jsPDF } from 'jspdf';

interface Project {
  id: number;
  claveProyecto: string;
  titulo: string;
  cupoTotal: number;
  cupoDisponible: number;
}

interface CodeEntry {
  code: {
    id: number;
    codigo: string;
    usado: boolean;
    usadoEn: Date | null;
    createdAt: Date;
  };
  usedBy: {
    nombreCompleto: string | null;
    matricula: string | null;
  } | null;
}

export default function CodesPage() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(
    initialProjectId ? Number(initialProjectId) : null
  );
  const [codes, setCodes] = useState<CodeEntry[]>([]);
  const [generateCount, setGenerateCount] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingAllPDF, setIsExportingAllPDF] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadProjects() {
      const data = await getProjectsForCodeGeneration();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0].id);
      }
      setIsLoading(false);
    }
    loadProjects();
  }, []);

  useEffect(() => {
    async function loadCodes() {
      if (!selectedProject) return;
      setIsLoading(true);
      try {
        const data = await getProjectCodes(selectedProject);
        setCodes(data as CodeEntry[]);
      } catch (error) {
        console.error('Error loading codes:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCodes();
  }, [selectedProject]);

  const handleGenerate = async () => {
    if (!selectedProject) return;
    
    setIsGenerating(true);
    setMessage(null);
    
    try {
      const result = await generateCodes(selectedProject, generateCount);
      if (result.success) {
        setMessage({ type: 'success', text: `${result.count} códigos generados exitosamente` });
        const newCodes = await getProjectCodes(selectedProject);
        setCodes(newCodes as CodeEntry[]);
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al generar códigos' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al generar códigos' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!selectedProject) return;
    
    try {
      const csv = await exportCodesToCSV(selectedProject);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codigos-proyecto-${selectedProject}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Draws the full-page cover for a single project and leaves the cursor after it. */
  const drawProjectCover = (
    doc: jsPDF,
    project: { claveProyecto: string; titulo: string; cupoTotal: number; cupoDisponible: number },
    availableCount: number,
    totalCount: number,
    organizacion?: string | null,
    periodo?: string | null,
    tipoProyecto?: string | null,
  ) => {
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const now = new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date());

    // ── Header band ──────────────────────────────────────────────────────────
    doc.setFillColor(30, 64, 175);   // blue-800
    doc.rect(0, 0, pw, 60, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('SISTEMA DE SERVICIO SOCIAL', pw / 2, 14, { align: 'center' });

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('CODIGOS DE INSCRIPCION', pw / 2, 28, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    const titleLines = doc.splitTextToSize(project.titulo, pw - 30);
    doc.text(titleLines, pw / 2, 42, { align: 'center' });

    // ── Clave chip ───────────────────────────────────────────────────────────
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(239, 246, 255);   // blue-50
    doc.setDrawColor(147, 197, 253);   // blue-300
    doc.roundedRect(pw / 2 - 30, 68, 60, 12, 3, 3, 'FD');
    doc.setFontSize(11);
    doc.setFont('courier', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(project.claveProyecto, pw / 2, 76.5, { align: 'center' });

    // ── Info block ───────────────────────────────────────────────────────────
    const infoY = 92;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);   // gray-600

    const infoLeft: string[] = [];
    if (organizacion) infoLeft.push(`Organizacion:   ${organizacion}`);
    if (periodo)       infoLeft.push(`Periodo:        ${periodo}`);
    if (tipoProyecto)  infoLeft.push(`Tipo:           ${tipoProyecto}`);

    infoLeft.forEach((line, i) => {
      doc.text(line, 20, infoY + i * 8);
    });

    // ── Stats cards ──────────────────────────────────────────────────────────
    const statsY = infoY + infoLeft.length * 8 + 12;
    const cardW = (pw - 50) / 3;
    const cardH = 28;
    const stats = [
      { label: 'Cupo Total',         value: String(project.cupoTotal),    bg: [239, 246, 255], accent: [30, 64, 175] },
      { label: 'Cupos Disponibles',  value: String(project.cupoDisponible), bg: [240, 253, 244], accent: [22, 163, 74] },
      { label: 'Codigos en PDF',     value: String(availableCount),        bg: [255, 251, 235], accent: [180, 83, 9] },
    ] as const;

    stats.forEach((s, i) => {
      const x = 20 + i * (cardW + 5);
      doc.setFillColor(s.bg[0], s.bg[1], s.bg[2]);
      doc.setDrawColor(s.accent[0], s.accent[1], s.accent[2]);
      doc.roundedRect(x, statsY, cardW, cardH, 3, 3, 'FD');
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(s.accent[0], s.accent[1], s.accent[2]);
      doc.text(s.value, x + cardW / 2, statsY + 14, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(s.label, x + cardW / 2, statsY + 23, { align: 'center' });
    });

    // ── Instructions ─────────────────────────────────────────────────────────
    const instY = statsY + cardH + 16;
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(209, 213, 219);
    doc.roundedRect(20, instY, pw - 40, 38, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('INSTRUCCIONES PARA EL SOCIOFORMADOR', 28, instY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    const instructions = [
      '1. Cada codigo es de uso unico. Entregue uno por estudiante autorizado.',
      '2. El estudiante debe ingresarlo en la plataforma para completar su inscripcion.',
      '3. Los codigos usados quedan marcados automaticamente en el sistema.',
    ];
    instructions.forEach((line, i) => {
      doc.text(line, 28, instY + 17 + i * 7);
    });

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(156, 163, 175);
    doc.text(`Generado el ${now}`, pw / 2, ph - 10, { align: 'center' });
  };

  /** Draws one or more 4×10 grid pages for an array of codes starting from a new page. */
  const drawCodeGridPages = (
    doc: jsPDF,
    codes: string[],
    projectLabel: string,
  ) => {
    const COLS = 4;
    const ROWS = 10;
    const PER_PAGE = COLS * ROWS;   // 40
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const margin = 12;
    const colGap = 4;
    const rowGap = 3;
    const cellW = (pw - margin * 2 - colGap * (COLS - 1)) / COLS;
    const cellH = (ph - margin * 2 - 14 - rowGap * (ROWS - 1)) / ROWS;   // 14 = header row

    let pageIndex = 0;

    for (let start = 0; start < codes.length; start += PER_PAGE) {
      doc.addPage();
      pageIndex++;
      const slice = codes.slice(start, start + PER_PAGE);

      // ── Page header ────────────────────────────────────────────────────────
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, pw, 10, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${projectLabel}   |   Hoja ${pageIndex}   |   Codigos ${start + 1}–${Math.min(start + PER_PAGE, codes.length)} de ${codes.length}`, pw / 2, 6.5, { align: 'center' });

      // ── Grid ───────────────────────────────────────────────────────────────
      const gridTop = 14;
      doc.setDrawColor(180, 180, 180);
      doc.setFontSize(12);
      doc.setFont('courier', 'bold');
      doc.setTextColor(0, 0, 0);

      slice.forEach((code, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = margin + col * (cellW + colGap);
        const y = gridTop + row * (cellH + rowGap);

        // Cell border only (no fill)
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, cellW, cellH, 'S');

        // Sequential number — top-left corner, tiny
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 180, 180);
        doc.text(String(start + i + 1), x + 2, y + 5);

        // Code — centered
        doc.setFontSize(11);
        doc.setFont('courier', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(code, x + cellW / 2, y + cellH / 2 + 2, { align: 'center' });
      });
    }
  };

  // ── Single-project PDF export ────────────────────────────────────────────────
  const handleExportPDF = () => {
    if (!selectedProject) return;

    const project = projects.find(p => p.id === selectedProject);
    if (!project) return;

    const availableCodes = codes.filter(c => !c.code.usado);

    const doc = new jsPDF();

    // Cover page
    drawProjectCover(doc, project, availableCodes.length, codes.length);

    // Grid pages (available codes only)
    if (availableCodes.length > 0) {
      drawCodeGridPages(
        doc,
        availableCodes.map(c => c.code.codigo),
        project.claveProyecto,
      );
    }

    doc.save(`codigos-${project.claveProyecto}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ── All-projects PDF export ──────────────────────────────────────────────────
  const handleExportAllPDF = async () => {
    setIsExportingAllPDF(true);

    try {
      const projectsWithCodes = await getAllProjectsWithCodes();

      if (projectsWithCodes.length === 0) {
        setMessage({ type: 'error', text: 'No hay códigos disponibles para exportar' });
        return;
      }

      const doc = new jsPDF();

      // ── Global cover page ──────────────────────────────────────────────────
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const now = new Intl.DateTimeFormat('es-MX', {
        timeZone: 'America/Mexico_City',
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date());
      const totalCodes = projectsWithCodes.reduce((s, p) => s + p.codes.length, 0);

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pw, ph, 'F');

      doc.setFillColor(30, 64, 175);
      doc.rect(0, ph / 2 - 50, pw, 100, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('CODIGOS DE INSCRIPCION', pw / 2, ph / 2 - 22, { align: 'center' });

      doc.setFontSize(13);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Servicio Social — Todos los Proyectos', pw / 2, ph / 2 - 6, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(147, 197, 253);
      doc.text(`${projectsWithCodes.length} proyectos  •  ${totalCodes} codigos en total`, pw / 2, ph / 2 + 10, { align: 'center' });

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generado el ${now}`, pw / 2, ph - 16, { align: 'center' });

      // ── Per-project: cover + grid ──────────────────────────────────────────
      for (const project of projectsWithCodes) {
        doc.addPage();
        drawProjectCover(
          doc,
          project,
          project.codes.length,
          project.codes.length,
          project.organizacion,
          null,
          null,
        );

        if (project.codes.length > 0) {
          drawCodeGridPages(
            doc,
            project.codes.map(c => c.codigo),
            project.claveProyecto,
          );
        }
      }

      doc.save(`todos-los-codigos-${new Date().toISOString().split('T')[0]}.pdf`);
      setMessage({ type: 'success', text: `PDF generado con ${projectsWithCodes.length} proyectos` });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setMessage({ type: 'error', text: 'Error al generar el PDF' });
    } finally {
      setIsExportingAllPDF(false);
    }
  };

  const usedCount = codes.filter(c => c.code.usado).length;
  const availableCount = codes.length - usedCount;

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Códigos</h1>
          <p className="text-gray-600">Genera y administra códigos de inscripción para proyectos</p>
        </div>
        <Button 
          onClick={handleExportAllPDF}
          disabled={isExportingAllPDF}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isExportingAllPDF ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Descargar PDF de Todos los Proyectos
        </Button>
      </div>

      {/* Project selector and generate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Seleccionar Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
            >
              <option value="">Seleccionar proyecto...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.claveProyecto} - {p.titulo} ({p.cupoDisponible}/{p.cupoTotal} cupos)
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generar Códigos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="count">Cantidad</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={100}
                value={generateCount}
                onChange={(e) => setGenerateCount(Number(e.target.value))}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedProject}
              className="w-full"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generar
            </Button>
          </CardContent>
        </Card>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {selectedProject && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Códigos</p>
                  <p className="text-2xl font-bold">{codes.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Disponibles</p>
                  <p className="text-2xl font-bold text-green-600">{availableCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Usados</p>
                  <p className="text-2xl font-bold text-gray-600">{usedCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Codes table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lista de Códigos</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : codes.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay códigos generados para este proyecto</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Código</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Estado</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Usado por</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-500">Fecha</th>
                        <th className="text-right p-4 text-sm font-medium text-gray-500">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {codes.map((entry) => (
                        <tr key={entry.code.id} className="hover:bg-gray-50">
                          <td className="p-4">
                            <span className="font-mono font-bold text-lg">
                              {entry.code.codigo}
                            </span>
                          </td>
                          <td className="p-4">
                            {entry.code.usado ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                <Clock className="h-3 w-3" />
                                Usado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                <CheckCircle className="h-3 w-3" />
                                Disponible
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {entry.usedBy ? (
                              <span>{entry.usedBy.nombreCompleto || entry.usedBy.matricula || '-'}</span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {entry.code.usado && entry.code.usadoEn
                              ? new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(entry.code.usadoEn))
                              : new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(entry.code.createdAt))}
                          </td>
                          <td className="p-4 text-right">
                            {!entry.code.usado && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyCode(entry.code.codigo)}
                              >
                                {copiedCode === entry.code.codigo ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
