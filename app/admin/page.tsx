import { getDashboardStats, getActiveEvents, getAllProjects, getEnrollmentsByProject, getEnrollmentTrendByHour } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, CheckCircle, FolderKanban,
  TrendingUp, Calendar, BarChart2, LineChart as LineChartIcon
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import EnrollmentChart from './_components/enrollment-chart';
import EnrollmentTrendChart from './_components/enrollment-trend-chart';

export default async function AdminDashboardPage() {
  const events = await getActiveEvents();
  const activeEventId = events[0]?.id;
  const stats = await getDashboardStats(activeEventId);
  const projects = await getAllProjects();
  const enrollmentsByProject = await getEnrollmentsByProject();
  const enrollmentTrend = await getEnrollmentTrendByHour();

  const recentProjects = projects.slice(0, 5);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Vista general del sistema de servicio social
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Estudiantes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
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
                <p className="text-sm font-medium text-gray-500">Registrados Feria</p>
                <p className="text-3xl font-bold text-gray-900">{stats.registeredForFair}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Proyectos Activos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FolderKanban className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Inscritos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Cupos Disponibles</p>
                <p className="text-3xl font-bold text-gray-900">{stats.availableSlots}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/projects">
                <Button variant="outline" size="sm" className="w-full">
                  Ver todos los proyectos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Evento Activo</p>
                <p className="text-xl font-bold text-gray-900">
                  {events[0]?.nombre || 'Sin evento activo'}
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/events">
                <Button variant="outline" size="sm" className="w-full">
                  Gestionar eventos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart2 className="h-5 w-5 text-blue-600" />
              Inscripciones por Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentChart data={enrollmentsByProject} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChartIcon className="h-5 w-5 text-indigo-600" />
              Inscripciones por Hora (hoy)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentTrendChart data={enrollmentTrend} />
          </CardContent>
        </Card>
      </div>

      {/* Quick actions and recent projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/projects/new">
              <Button variant="outline" className="w-full justify-start">
                <FolderKanban className="mr-2 h-4 w-4" />
                Crear nuevo proyecto
              </Button>
            </Link>
            <Link href="/admin/codes">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Generar códigos
              </Button>
            </Link>
            <Link href="/admin/events">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Gestionar eventos
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Proyectos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.titulo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {project.claveProyecto} • {project.cupoDisponible}/{project.cupoTotal} cupos
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.activo 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {project.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
