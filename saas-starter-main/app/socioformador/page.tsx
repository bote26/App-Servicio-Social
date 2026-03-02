'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FolderKanban, Users, Clock, MapPin, KeyRound, 
  Loader2, AlertCircle 
} from 'lucide-react';
import { getMyProjects } from './actions';

interface Project {
  id: number;
  claveProyecto: string;
  titulo: string;
  organizacion: string | null;
  horas: number;
  modalidad: string | null;
  cupoTotal: number;
  cupoDisponible: number;
  activo: boolean;
}

export default function SocioformadorDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getMyProjects();
        setProjects(data);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Mis Proyectos</h1>
        <p className="text-gray-600">
          Proyectos de servicio social asignados a ti
        </p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sin proyectos asignados
            </h3>
            <p className="text-gray-600">
              Actualmente no tienes proyectos asignados. Contacta al administrador.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className={!project.activo ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.titulo}</CardTitle>
                    <p className="text-sm text-gray-500">{project.organizacion}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.activo 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {project.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="font-mono">{project.claveProyecto}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {project.horas} hrs
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {project.modalidad || 'Sin modalidad'}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Cupos ocupados</span>
                    <span className="font-medium">
                      {project.cupoTotal - project.cupoDisponible} de {project.cupoTotal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ 
                        width: `${((project.cupoTotal - project.cupoDisponible) / project.cupoTotal) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/socioformador/codes?project=${project.id}`}>
                      <KeyRound className="h-4 w-4 mr-1" />
                      Ver Códigos
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/socioformador/students?project=${project.id}`}>
                      <Users className="h-4 w-4 mr-1" />
                      Estudiantes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
