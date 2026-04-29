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

  const handleExportPDF = () => {
    if (!selectedProject) return;
    
    const project = projects.find(p => p.id === selectedProject);
    if (!project) return;

    const availableCodes = codes.filter(c => !c.code.usado);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CODIGOS DE INSCRIPCION', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Servicio Social', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setDrawColor(200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACION DEL PROYECTO', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Clave: ${project.claveProyecto}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Titulo: ${project.titulo}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Cupo Total: ${project.cupoTotal} | Disponible: ${project.cupoDisponible}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Codigos Disponibles: ${availableCodes.length} de ${codes.length}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Fecha de generacion: ${new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date())}`, margin, yPosition);
    yPosition += 15;

    doc.setDrawColor(200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CODIGOS DISPONIBLES PARA SOCIOFORMADOR', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Estos codigos son de uso unico. Entregar uno a cada estudiante autorizado.', margin, yPosition);
    yPosition += 12;

    const codesPerRow = 3;
    const codeBoxWidth = (pageWidth - margin * 2 - 20) / codesPerRow;
    const codeBoxHeight = 20;
    
    doc.setFontSize(14);
    doc.setFont('courier', 'bold');

    availableCodes.forEach((entry, index) => {
      const row = Math.floor(index / codesPerRow);
      const col = index % codesPerRow;
      const x = margin + col * (codeBoxWidth + 10);
      const y = yPosition + row * (codeBoxHeight + 8);

      if (y + codeBoxHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return;
      }

      doc.setDrawColor(100);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, codeBoxWidth, codeBoxHeight, 3, 3, 'FD');

      doc.setTextColor(0);
      doc.text(
        entry.code.codigo, 
        x + codeBoxWidth / 2, 
        y + codeBoxHeight / 2 + 2, 
        { align: 'center' }
      );

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`#${index + 1}`, x + 3, y + 5);
      doc.setFontSize(14);
      doc.setFont('courier', 'bold');
      doc.setTextColor(0);
    });

    const totalRows = Math.ceil(availableCodes.length / codesPerRow);
    yPosition += totalRows * (codeBoxHeight + 8) + 15;

    if (yPosition < pageHeight - 40) {
      doc.setDrawColor(200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text('INSTRUCCIONES:', margin, yPosition);
      yPosition += 5;
      doc.text('1. Cada codigo puede usarse una sola vez.', margin, yPosition);
      yPosition += 4;
      doc.text('2. El estudiante debe ingresar el codigo en la plataforma para completar su inscripcion.', margin, yPosition);
      yPosition += 4;
      doc.text('3. Los codigos usados seran marcados automaticamente en el sistema.', margin, yPosition);
    }

    doc.save(`codigos-${project.claveProyecto}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportAllPDF = async () => {
    setIsExportingAllPDF(true);
    
    try {
      const projectsWithCodes = await getAllProjectsWithCodes();
      
      if (projectsWithCodes.length === 0) {
        setMessage({ type: 'error', text: 'No hay códigos disponibles para exportar' });
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('CODIGOS DE INSCRIPCION', pageWidth / 2, 25, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Servicio Social - Todos los Proyectos', pageWidth / 2, 33, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generado: ${new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date())}`, pageWidth / 2, 40, { align: 'center' });

      let isFirstProject = true;

      for (const project of projectsWithCodes) {
        if (!isFirstProject) {
          doc.addPage();
        }
        isFirstProject = false;

        let yPosition = 20;

        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, pageWidth, 45, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('PROYECTO', margin, yPosition);
        yPosition += 8;

        doc.setFontSize(12);
        doc.text(`${project.claveProyecto}`, margin, yPosition);
        yPosition += 7;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const titleLines = doc.splitTextToSize(project.titulo, pageWidth - margin * 2);
        doc.text(titleLines, margin, yPosition);
        yPosition = 55;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        if (project.organizacion) {
          doc.text(`Organizacion: ${project.organizacion}`, margin, yPosition);
          yPosition += 6;
        }
        doc.text(`Cupo: ${project.cupoDisponible}/${project.cupoTotal} disponibles`, margin, yPosition);
        yPosition += 6;
        doc.text(`Codigos disponibles: ${project.codes.length}`, margin, yPosition);
        yPosition += 12;

        doc.setDrawColor(200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('CODIGOS PARA ENTREGAR A ESTUDIANTES:', margin, yPosition);
        yPosition += 10;

        const codesPerRow = 3;
        const codeBoxWidth = (pageWidth - margin * 2 - 16) / codesPerRow;
        const codeBoxHeight = 18;

        doc.setFontSize(13);
        doc.setFont('courier', 'bold');

        for (let i = 0; i < project.codes.length; i++) {
          const row = Math.floor(i / codesPerRow);
          const col = i % codesPerRow;
          const x = margin + col * (codeBoxWidth + 8);
          const y = yPosition + row * (codeBoxHeight + 6);

          if (y + codeBoxHeight > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${project.claveProyecto} - ${project.titulo} (continuacion)`, margin, yPosition);
            yPosition += 12;
            
            const newRow = Math.floor((i) / codesPerRow);
            const adjustedI = i;
            const newRowInPage = 0;
            const newY = yPosition + newRowInPage * (codeBoxHeight + 6);
            
            doc.setDrawColor(100);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(x, newY, codeBoxWidth, codeBoxHeight, 2, 2, 'FD');
            
            doc.setFontSize(13);
            doc.setFont('courier', 'bold');
            doc.setTextColor(0);
            doc.text(project.codes[i].codigo, x + codeBoxWidth / 2, newY + codeBoxHeight / 2 + 2, { align: 'center' });
            continue;
          }

          doc.setDrawColor(100);
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(x, y, codeBoxWidth, codeBoxHeight, 2, 2, 'FD');

          doc.setTextColor(0);
          doc.text(project.codes[i].codigo, x + codeBoxWidth / 2, y + codeBoxHeight / 2 + 2, { align: 'center' });
        }

        const totalRows = Math.ceil(project.codes.length / codesPerRow);
        const finalY = yPosition + totalRows * (codeBoxHeight + 6) + 10;

        if (finalY < pageHeight - 25) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(120);
          doc.text('Cada codigo es de uso unico. El estudiante lo ingresa en la plataforma para inscribirse.', margin, pageHeight - 15);
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
