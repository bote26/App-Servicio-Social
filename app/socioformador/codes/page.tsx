'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  KeyRound, Loader2, CheckCircle, Clock,
  Copy, AlertCircle, Printer, Plus
} from 'lucide-react';
import { getMyProjects, getProjectCodesForSocioformador, generateCodesForMyProject } from '../actions';

interface Project {
  id: number;
  claveProyecto: string;
  titulo: string;
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

export default function SocioformadorCodesPage() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(
    initialProjectId ? Number(initialProjectId) : null
  );
  const [codes, setCodes] = useState<CodeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [generateCount, setGenerateCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getMyProjects();
        setProjects(data);
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0].id);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    async function loadCodes() {
      if (!selectedProject) return;
      setIsLoading(true);
      try {
        const data = await getProjectCodesForSocioformador(selectedProject);
        setCodes(data as CodeEntry[]);
      } catch (error) {
        console.error('Error loading codes:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCodes();
  }, [selectedProject]);

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGenerate = async () => {
    if (!selectedProject) return;
    setIsGenerating(true);
    setGenerateMsg('');
    const result = await generateCodesForMyProject(selectedProject, generateCount);
    if (result?.error) {
      setGenerateMsg(`Error: ${result.error}`);
    } else {
      setGenerateMsg(`Se generaron ${result.count} códigos correctamente`);
      const data = await getProjectCodesForSocioformador(selectedProject);
      setCodes(data as CodeEntry[]);
    }
    setIsGenerating(false);
  };

  const handlePrint = () => {
    const availableCodes = codes.filter(c => !c.code.usado);
    const printContent = availableCodes.map(c => c.code.codigo).join('\n');
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Códigos de Proyecto</title>
            <style>
              body { font-family: monospace; font-size: 18px; padding: 20px; }
              .code { padding: 10px; margin: 5px 0; border: 1px solid #ccc; display: inline-block; margin-right: 10px; }
              h1 { font-family: sans-serif; }
            </style>
          </head>
          <body>
            <h1>Códigos de Inscripción</h1>
            <p>Proyecto: ${projects.find(p => p.id === selectedProject)?.titulo || ''}</p>
            <p>Total códigos disponibles: ${availableCodes.length}</p>
            <hr>
            <div>
              ${availableCodes.map(c => `<div class="code">${c.code.codigo}</div>`).join('')}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const usedCount = codes.filter(c => c.code.usado).length;
  const availableCount = codes.length - usedCount;

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Códigos de Proyecto</h1>
        <p className="text-gray-600">Códigos para distribuir a los estudiantes</p>
      </div>

      {/* Project selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <select
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(Number(e.target.value))}
            className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
          >
            <option value="">Seleccionar proyecto...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.claveProyecto} - {p.titulo}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedProject && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
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

          {/* Generate Codes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Generar Nuevos Códigos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Cantidad:</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={generateCount}
                    onChange={(e) => setGenerateCount(Math.min(100, Math.max(1, Number(e.target.value))))}
                    className="w-20 h-10 rounded-md border border-gray-200 px-3 text-sm"
                  />
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating} size="sm">
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generando...</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" />Generar Códigos</>
                  )}
                </Button>
                {generateMsg && (
                  <span className={`text-sm ${generateMsg.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {generateMsg}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Codes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Códigos Disponibles</CardTitle>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
                </div>
              ) : codes.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay códigos generados para este proyecto</p>
                  <p className="text-sm text-gray-400">Contacta al administrador</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {codes.filter(c => !c.code.usado).map((entry) => (
                    <div 
                      key={entry.code.id}
                      className="relative group p-4 bg-gray-50 rounded-lg border border-gray-200 text-center hover:border-purple-300 transition-colors"
                    >
                      <p className="font-mono font-bold text-lg">{entry.code.codigo}</p>
                      <button
                        onClick={() => copyCode(entry.code.codigo)}
                        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedCode === entry.code.codigo ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
