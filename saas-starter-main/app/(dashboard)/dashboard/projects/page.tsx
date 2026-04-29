'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, Clock, MapPin, ChevronRight, Users, 
  AlertCircle, CheckCircle, Loader2, Filter, X 
} from 'lucide-react';
import { getAvailableProjects, checkStudentEligibility } from './actions';

interface Project {
  id: number;
  claveProyecto: string;
  titulo: string;
  organizacion: string | null;
  descripcion: string | null;
  periodo: string;
  tipoProyecto: string | null;
  horas: number;
  carrera: string | null;
  modalidad: string | null;
  ubicacion: string | null;
  cupoTotal: number;
  cupoDisponible: number;
  logoUrl: string | null;
}

interface Eligibility {
  eligible: boolean;
  reason: string;
  enrolledTypes?: string[];
  enrollment?: any;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCarrera, setSelectedCarrera] = useState('all');
  const [selectedModalidad, setSelectedModalidad] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [projectsData, eligibilityData] = await Promise.all([
          getAvailableProjects(),
          checkStudentEligibility(),
        ]);
        setProjects(projectsData);
        setEligibility(eligibilityData);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.organizacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.claveProyecto.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCarrera = 
      selectedCarrera === 'all' || 
      p.carrera?.includes(selectedCarrera) || 
      p.carrera === 'Todas';

    const matchesModalidad = 
      selectedModalidad === 'all' || 
      p.modalidad === selectedModalidad;

    return matchesSearch && matchesCarrera && matchesModalidad;
  });

  const uniqueCarreras = [...new Set(projects.flatMap(p => p.carrera?.split(', ') || []))].filter(Boolean);
  const uniqueModalidades = [...new Set(projects.map(p => p.modalidad).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-gray-50 min-h-screen p-4 lg:p-8">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
        Proyectos de Servicio Social
      </h1>
      <p className="text-gray-600 mb-6">
        {projects[0]?.periodo || 'Febrero - Junio 2026'}
      </p>

      {/* Eligibility / enrollment status banner */}
      {eligibility && (
        <>
          {eligibility.reason === 'not_registered_for_fair' && (
            <div className="mb-6 p-4 rounded-lg border bg-yellow-50 border-yellow-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Registro a la feria requerido</p>
                <p className="text-sm text-yellow-700">
                  Debes registrarte para la feria antes de inscribirte.{' '}
                  <Link href="/dashboard/fair-registration" className="underline font-medium">Ir al registro</Link>
                </p>
              </div>
            </div>
          )}
          {eligibility.reason === 'already_enrolled_both' && (
            <div className="mb-6 p-4 rounded-lg border bg-green-50 border-green-200 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Inscripciones completas</p>
                <p className="text-sm text-green-700">
                  Ya tienes un proyecto Intensivo y uno Semestral para este periodo.{' '}
                  <Link href="/dashboard/my-enrollments" className="underline font-medium">Ver mis inscripciones</Link>
                </p>
              </div>
            </div>
          )}
          {eligibility.eligible && (eligibility.enrolledTypes?.length ?? 0) > 0 && (
            <div className="mb-6 p-4 rounded-lg border bg-blue-50 border-blue-200 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Inscripcion parcial</p>
                <p className="text-sm text-blue-700">
                  Ya tienes: <span className="font-semibold">{eligibility.enrolledTypes?.join(', ')}</span>.
                  {' '}Aún puedes inscribirte en {eligibility.enrolledTypes?.includes('Intensivo') ? 'Semestral' : 'Intensivo'}.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            className="pl-12 h-12 bg-white border-gray-200 rounded-xl shadow-sm"
            placeholder="Buscar proyectos u organizaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedCarrera}
          onChange={(e) => setSelectedCarrera(e.target.value)}
          className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm shadow-sm"
        >
          <option value="all">Todas las carreras</option>
          {uniqueCarreras.map((carrera) => (
            <option key={carrera} value={carrera}>{carrera}</option>
          ))}
        </select>

        <select
          value={selectedModalidad}
          onChange={(e) => setSelectedModalidad(e.target.value)}
          className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm shadow-sm"
        >
          <option value="all">Todas las modalidades</option>
          {uniqueModalidades.map((mod) => (
            <option key={mod} value={mod!}>{mod}</option>
          ))}
        </select>

        {(searchTerm || selectedCarrera !== 'all' || selectedModalidad !== 'all') && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm('');
              setSelectedCarrera('all');
              setSelectedModalidad('all');
            }}
            className="h-12 px-4"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-600 mb-4">
        {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''}
      </p>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            canEnroll={eligibility?.eligible || false}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron proyectos con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, canEnroll }: { project: Project; canEnroll: boolean }) {
  const availabilityPercentage = (project.cupoDisponible / project.cupoTotal) * 100;
  const isLowAvailability = availabilityPercentage <= 20;
  const isFull = project.cupoDisponible === 0;

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Header with logo */}
      <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-6 relative">
        {project.logoUrl ? (
          <img 
            src={project.logoUrl} 
            alt={project.organizacion || ''} 
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-4xl font-bold text-gray-200">
            {project.organizacion?.charAt(0) || 'P'}
          </div>
        )}
        
        {/* Capacity badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
          isFull 
            ? 'bg-red-100 text-red-700'
            : isLowAvailability
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
        }`}>
          {isFull ? 'Sin cupos' : `${project.cupoDisponible} cupos`}
        </div>

        {/* Tipo badge */}
        {project.tipoProyecto && (
          <div className={`absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
            project.tipoProyecto === 'Intensivo'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-purple-100 text-purple-700'
          }`}>
            {project.tipoProyecto}
          </div>
        )}

        {/* Carrera tags */}
        <div className="absolute top-3 left-3 flex gap-1 flex-wrap max-w-[60%]">
          {project.carrera?.split(', ').slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-semibold rounded-full"
            >
              {tag}
            </span>
          ))}
          {(project.carrera?.split(', ').length || 0) > 2 && (
            <span className="px-2 py-0.5 bg-gray-500 text-white text-[10px] font-semibold rounded-full">
              +{(project.carrera?.split(', ').length || 0) - 2}
            </span>
          )}
        </div>
      </div>

      <CardContent className="flex-1 flex flex-col p-5">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {project.titulo}
          </h2>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            {project.organizacion}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {project.descripcion || 'Sin descripción disponible.'}
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{project.horas} horas</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{project.modalidad}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-gray-400" />
              <span>{project.cupoDisponible}/{project.cupoTotal}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">
              {project.claveProyecto}
            </span>
            <Button 
              asChild 
              size="sm"
              className={`rounded-full ${
                isFull 
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-900 hover:bg-blue-600'
              }`}
              disabled={isFull}
            >
              <Link href={`/dashboard/projects/${project.id}`}>
                Ver más
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
