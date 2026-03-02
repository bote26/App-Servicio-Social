import { getAllProjects } from '@/lib/db/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit, Users, Clock, MapPin } from 'lucide-react';
import { ToggleStatusButton } from './toggle-status-button';

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Proyectos</h1>
          <p className="text-gray-600">Administra los proyectos de servicio social</p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No hay proyectos registrados</p>
            <Button asChild>
              <Link href="/admin/projects/new">Crear primer proyecto</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className={!project.activo ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-900">{project.titulo}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        project.activo 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {project.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{project.organizacion}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="font-mono">{project.claveProyecto}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {project.horas} hrs
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.cupoDisponible}/{project.cupoTotal} cupos
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {project.modalidad || 'Sin modalidad'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ToggleStatusButton 
                      projectId={project.id} 
                      isActive={project.activo} 
                    />
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/projects/${project.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/codes?project=${project.id}`}>
                        Códigos
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Capacidad utilizada</span>
                    <span>{project.cupoTotal - project.cupoDisponible} de {project.cupoTotal}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${((project.cupoTotal - project.cupoDisponible) / project.cupoTotal) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
