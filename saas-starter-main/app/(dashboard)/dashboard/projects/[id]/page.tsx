'use client';

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { 
  ArrowLeft, Clock, MapPin, Users, Calendar, Building2, 
  Target, ListChecks, CheckCircle, AlertCircle, Loader2,
  KeyRound
} from 'lucide-react';
import { getProjectDetails, checkStudentEligibility, enrollInProject } from '../actions';
import CertificateButton from '../../my-enrollments/_components/certificate-button';

interface Project {
  id: number;
  claveProyecto: string;
  titulo: string;
  organizacion: string | null;
  descripcion: string | null;
  objetivo: string | null;
  actividades: string | null;
  periodo: string;
  horas: number;
  carrera: string | null;
  modalidad: string | null;
  ubicacion: string | null;
  horarioProyecto: string | null;
  cupoTotal: number;
  cupoDisponible: number;
  logoUrl: string | null;
}

interface Eligibility {
  eligible: boolean;
  reason: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ folio: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadData() {
      try {
        const [projectData, eligibilityData] = await Promise.all([
          getProjectDetails(projectId),
          checkStudentEligibility(),
        ]);
        setProject(projectData);
        setEligibility(eligibilityData);
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  const handleEnroll = () => {
    if (!code.trim()) {
      setError('Por favor ingresa el código del proyecto');
      return;
    }

    setError('');
    startTransition(async () => {
      const result = await enrollInProject(projectId, code);
      
      if (result.success && result.folio) {
        setSuccess({ folio: result.folio });
      } else {
        setError(result.error || 'Error al inscribirse');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 p-4 lg:p-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Proyecto no encontrado</h2>
          <p className="text-gray-600 mb-4">El proyecto que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link href="/dashboard/projects">Volver a proyectos</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex-1 p-4 lg:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Inscripción Exitosa!
            </h2>
            <p className="text-gray-600 mb-6">
              Te has inscrito correctamente al proyecto de servicio social.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-500 mb-1">Tu folio de inscripción:</p>
              <p className="text-2xl font-mono font-bold text-blue-600">{success.folio}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Próximos pasos:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Guarda tu folio de inscripción</li>
                <li>• Contacta a la organización para coordinar tu inicio</li>
                <li>• Consulta tus inscripciones en el panel de control</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <CertificateButton
                folio={success.folio}
                variant="default"
                size="default"
                className="bg-green-600 hover:bg-green-700 text-white"
              />
              <Button asChild variant="outline">
                <Link href="/dashboard/projects">Ver más proyectos</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/my-enrollments">Ver mis inscripciones</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFull = project.cupoDisponible === 0;
  const canEnroll = eligibility?.eligible && !isFull;

  return (
    <div className="flex-1 p-4 lg:p-8">
      {/* Back button */}
      <Link 
        href="/dashboard/projects" 
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver a proyectos
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {project.logoUrl ? (
                  <img 
                    src={project.logoUrl} 
                    alt={project.organizacion || ''} 
                    className="w-20 h-20 object-contain rounded-lg bg-gray-50 p-2"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.carrera?.split(', ').map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                    {project.titulo}
                  </h1>
                  <p className="text-gray-600">{project.organizacion}</p>
                  <p className="text-sm text-gray-500 font-mono mt-1">{project.claveProyecto}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objetivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{project.objetivo || project.descripcion || 'Sin descripción'}</p>
            </CardContent>
          </Card>

          {project.actividades && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Actividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {project.actividades.split('\n').map((activity, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Info grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Horas</p>
                    <p className="font-semibold">{project.horas} horas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Modalidad</p>
                    <p className="font-semibold">{project.modalidad || 'No especificada'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Horario</p>
                    <p className="font-semibold text-sm">{project.horarioProyecto || 'Por definir'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cupos disponibles</p>
                    <p className="font-semibold">{project.cupoDisponible} de {project.cupoTotal}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {project.ubicacion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{project.ubicacion}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Enrollment */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Inscripción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Capacity indicator */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Cupos disponibles</span>
                  <span className="font-medium">{project.cupoDisponible}/{project.cupoTotal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      isFull ? 'bg-red-500' : project.cupoDisponible <= 2 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(project.cupoDisponible / project.cupoTotal) * 100}%` }}
                  />
                </div>
              </div>

              {/* Eligibility messages */}
              {!eligibility?.eligible && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    {eligibility?.reason === 'not_registered_for_fair' && (
                      <>
                        Debes registrarte para la feria primero. {' '}
                        <Link href="/dashboard/fair-registration" className="underline font-medium">
                          Ir al registro
                        </Link>
                      </>
                    )}
                    {eligibility?.reason === 'not_validated' && (
                      'Tu asistencia a la feria debe ser validada primero.'
                    )}
                    {eligibility?.reason === 'already_enrolled' && (
                      'Ya tienes una inscripción activa para este periodo.'
                    )}
                  </p>
                </div>
              )}

              {isFull && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium">
                    Este proyecto no tiene cupos disponibles.
                  </p>
                </div>
              )}

              {/* Code input */}
              {canEnroll && (
                <>
                  <div>
                    <Label htmlFor="code" className="flex items-center gap-2 mb-2">
                      <KeyRound className="h-4 w-4" />
                      Código del Proyecto
                    </Label>
                    <Input
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Ej: ABC12345"
                      className="font-mono text-center text-lg tracking-wider"
                      maxLength={12}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa el código que te proporcionó el socioformador
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleEnroll}
                    disabled={isPending || !code.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      'Confirmar Inscripción'
                    )}
                  </Button>
                </>
              )}

              {!canEnroll && !isFull && eligibility?.eligible === false && (
                <Button disabled className="w-full">
                  Inscripción no disponible
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
