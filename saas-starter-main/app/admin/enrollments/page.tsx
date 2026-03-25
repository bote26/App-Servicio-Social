import { getAllEnrollments, getProjectsWithEnrollments } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import UnenrollButton from './unenroll-button';

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string }>;
}) {
  const params = await searchParams;
  const selectedProjectId = params.proyecto ? Number(params.proyecto) : null;

  const [allEnrollments, projects] = await Promise.all([
    getAllEnrollments(),
    getProjectsWithEnrollments(),
  ]);

  const enrollments = selectedProjectId
    ? allEnrollments.filter((e) => e.proyectoId === selectedProjectId)
    : allEnrollments;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Inscripciones</h1>
        <p className="text-gray-600">Gestión de inscripciones a proyectos</p>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <form method="GET" className="flex items-center gap-4">
            <label className="text-sm text-gray-600 font-medium">Filtrar por proyecto:</label>
            <select
              name="proyecto"
              defaultValue={selectedProjectId ?? ''}
              className="h-10 rounded-md border border-gray-200 px-3 text-sm min-w-[280px]"
              onChange={(e) => {
                const form = e.target.closest('form') as HTMLFormElement;
                form?.submit();
              }}
            >
              <option value="">Todos los proyectos</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.claveProyecto} — {p.titulo}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {enrollments.length} inscripción{enrollments.length !== 1 ? 'es' : ''}
            </span>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Inscripciones Registradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay inscripciones registradas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Estudiante</th>
                    <th className="pb-3 font-medium">Matrícula</th>
                    <th className="pb-3 font-medium">Proyecto</th>
                    <th className="pb-3 font-medium">Período</th>
                    <th className="pb-3 font-medium">Folio</th>
                    <th className="pb-3 font-medium">Fecha</th>
                    <th className="pb-3 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">
                        {e.alumnoNombre || e.alumnoCorreo}
                      </td>
                      <td className="py-3 text-gray-600 font-mono text-xs">
                        {e.alumnoMatricula || '—'}
                      </td>
                      <td className="py-3">
                        <span className="text-gray-900">{e.proyectoTitulo}</span>
                        <br />
                        <span className="text-xs text-gray-400 font-mono">{e.proyectoClave}</span>
                      </td>
                      <td className="py-3 text-gray-600">{e.periodo}</td>
                      <td className="py-3 font-mono text-xs text-gray-500">{e.folio}</td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(e.fechaInscripcion).toLocaleDateString('es-MX')}
                      </td>
                      <td className="py-3 text-right">
                        <UnenrollButton
                          inscripcionId={e.id}
                          alumnoNombre={e.alumnoNombre || e.alumnoCorreo || ''}
                          proyectoTitulo={e.proyectoTitulo}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
