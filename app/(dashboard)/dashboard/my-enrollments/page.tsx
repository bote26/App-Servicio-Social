'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle, Clock, MapPin, Calendar, Building2,
  FileText, Loader2, AlertCircle, Copy, ExternalLink
} from 'lucide-react';
import CertificateButton from './_components/certificate-button';
import { fetchMyEnrollments } from './actions';
import { formatMexicoDateLong } from '@/lib/utils/date';

interface Enrollment {
  inscripcion: {
    id: number;
    folio: string;
    periodo: string;
    fechaInscripcion: Date;
    confirmacionSistema: string | null;
  };
  proyecto: {
    id: number;
    claveProyecto: string;
    titulo: string;
    organizacion: string | null;
    horas: number;
    modalidad: string | null;
    ubicacion: string | null;
    horarioProyecto: string | null;
    logoUrl: string | null;
  };
}

export default function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedFolio, setCopiedFolio] = useState<string | null>(null);

  useEffect(() => {
    async function loadEnrollments() {
      try {
        const data = await fetchMyEnrollments();
        setEnrollments(data as Enrollment[]);
      } catch (error) {
        console.error('Error loading enrollments:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadEnrollments();
  }, []);

  const copyFolio = async (folio: string) => {
    await navigator.clipboard.writeText(folio);
    setCopiedFolio(folio);
    setTimeout(() => setCopiedFolio(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Mis Inscripciones
      </h1>

      {enrollments.length === 0 ? (
        <Card className="max-w-2xl">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes inscripciones
            </h3>
            <p className="text-gray-600 mb-6">
              Aún no te has inscrito a ningún proyecto de servicio social.
            </p>
            <Button asChild>
              <Link href="/dashboard/projects">Ver proyectos disponibles</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.inscripcion.id} className="overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Project logo/header */}
                <div className="lg:w-48 bg-gradient-to-br from-gray-100 to-gray-50 p-6 flex items-center justify-center">
                  {enrollment.proyecto.logoUrl ? (
                    <img 
                      src={enrollment.proyecto.logoUrl} 
                      alt={enrollment.proyecto.organizacion || ''} 
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : (
                    <Building2 className="h-16 w-16 text-gray-300" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-green-600">Inscrito</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {enrollment.proyecto.titulo}
                      </h2>
                      <p className="text-gray-600 mb-3">{enrollment.proyecto.organizacion}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {enrollment.proyecto.horas} horas
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {enrollment.proyecto.modalidad}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {enrollment.inscripcion.periodo}
                        </div>
                      </div>
                    </div>

                    {/* Folio card */}
                    <div className="bg-gray-50 rounded-lg p-4 min-w-[200px]">
                      <p className="text-xs text-gray-500 mb-1">Folio de inscripción</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-blue-600">
                          {enrollment.inscripcion.folio}
                        </p>
                        <button
                          onClick={() => copyFolio(enrollment.inscripcion.folio)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copiar folio"
                        >
                          {copiedFolio === enrollment.inscripcion.folio ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Inscrito el {formatMexicoDateLong(enrollment.inscripcion.fechaInscripcion)}
                      </p>
                    </div>
                  </div>

                  {/* Additional info */}
                  {enrollment.proyecto.ubicacion && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <strong>Ubicación:</strong> {enrollment.proyecto.ubicacion}
                      </p>
                    </div>
                  )}

                  {enrollment.proyecto.horarioProyecto && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <strong>Horario:</strong> {enrollment.proyecto.horarioProyecto}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/projects/${enrollment.proyecto.id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver detalles del proyecto
                      </Link>
                    </Button>
                    <CertificateButton folio={enrollment.inscripcion.folio} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
