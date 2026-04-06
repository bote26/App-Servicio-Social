import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FolderKanban, Users, Clock, MapPin, KeyRound,
  AlertCircle, BarChart2, LineChart as LineChartIcon,
  UserCheck, Key,
} from 'lucide-react';
import { requireSocioformador } from '@/lib/auth/middleware';
import {
  getSocioformadorStats,
  getSocioformadorProjectsCapacity,
  getSocioformadorEnrollmentsByHour,
} from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { proyectos } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import CapacityChart from './_components/capacity-chart';
import HourlyChart from './_components/hourly-chart';

export default async function SocioformadorDashboard() {
  const user = await requireSocioformador();

  const myProjects =
    user.rol === 'admin'
      ? await db.select().from(proyectos).orderBy(desc(proyectos.createdAt))
      : await db
          .select()
          .from(proyectos)
          .where(eq(proyectos.socioformadorId, user.id))
          .orderBy(desc(proyectos.createdAt));

  const [stats, capacityData, hourlyData] = await Promise.all([
    getSocioformadorStats(user.id),
    getSocioformadorProjectsCapacity(user.id),
    getSocioformadorEnrollmentsByHour(user.id),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen de tus proyectos de servicio social</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Alumnos Inscritos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAlumnos}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Cupos Disponibles</p>
                <p className="text-3xl font-bold text-gray-900">{stats.cuposDisponibles}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Códigos Usados</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.codigosUsados}
                  <span className="text-lg font-normal text-gray-400"> / {stats.codigosTotal}</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Key className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Proyectos Activos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.proyectosActivos}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FolderKanban className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-5 w-5 text-purple-600" />
              Capacidad por Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CapacityChart data={capacityData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChartIcon className="h-5 w-5 text-purple-600" />
              Inscripciones por Hora (hoy)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HourlyChart data={hourlyData} />
          </CardContent>
        </Card>
      </div>

      {/* Project cards */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Mis Proyectos</h2>

      {myProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin proyectos asignados</h3>
            <p className="text-gray-600">
              Actualmente no tienes proyectos asignados. Contacta al administrador.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myProjects.map((project) => (
            <Card key={project.id} className={!project.activo ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">
                      {project.titulo}
                    </h3>
                    <p className="text-sm text-gray-500">{project.organizacion}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full shrink-0 ml-2 ${
                      project.activo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
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
                        width: `${((project.cupoTotal - project.cupoDisponible) / project.cupoTotal) * 100}%`,
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
