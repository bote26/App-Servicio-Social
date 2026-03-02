'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Loader2, AlertCircle, Mail, Download } from 'lucide-react';
import { getMyProjects, getProjectStudents } from '../actions';

interface Project {
  id: number;
  claveProyecto: string;
  titulo: string;
}

interface StudentEntry {
  enrollment: {
    id: number;
    folio: string;
    periodo: string;
    fechaInscripcion: Date;
  };
  student: {
    id: number;
    nombreCompleto: string | null;
    matricula: string | null;
    correoInstitucional: string;
  };
}

export default function SocioformadorStudentsPage() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(
    initialProjectId ? Number(initialProjectId) : null
  );
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    async function loadStudents() {
      if (!selectedProject) return;
      setIsLoading(true);
      try {
        const data = await getProjectStudents(selectedProject);
        setStudents(data as StudentEntry[]);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStudents();
  }, [selectedProject]);

  const handleExport = () => {
    const headers = ['Nombre', 'Matrícula', 'Correo', 'Folio', 'Fecha Inscripción'];
    const rows = students.map(s => [
      s.student.nombreCompleto || '',
      s.student.matricula || '',
      s.student.correoInstitucional,
      s.enrollment.folio,
      new Date(s.enrollment.fechaInscripcion).toLocaleDateString('es-MX'),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudiantes-proyecto-${selectedProject}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Estudiantes Inscritos</h1>
        <p className="text-gray-600">Estudiantes inscritos en tus proyectos</p>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estudiantes ({students.length})
            </CardTitle>
            {students.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay estudiantes inscritos en este proyecto</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Estudiante</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Matrícula</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Folio</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Fecha</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-500">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((entry) => (
                      <tr key={entry.enrollment.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <p className="font-medium text-gray-900">
                            {entry.student.nombreCompleto || 'Sin nombre'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {entry.student.correoInstitucional}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm">
                            {entry.student.matricula || '-'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm text-blue-600">
                            {entry.enrollment.folio}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(entry.enrollment.fechaInscripcion).toLocaleDateString('es-MX')}
                        </td>
                        <td className="p-4 text-right">
                          <a 
                            href={`mailto:${entry.student.correoInstitucional}`}
                            className="inline-flex items-center text-purple-600 hover:text-purple-800"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
