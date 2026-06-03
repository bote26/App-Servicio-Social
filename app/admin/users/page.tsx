import { getSocioformadores } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import DeleteSocioformadorButton from './delete-button';
import { formatMexicoDate } from '@/lib/utils/date';

export default async function AdminUsersPage() {
  const socioformadores = await getSocioformadores();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Socios Formadores</h1>
          <p className="text-gray-600">Gestión de usuarios socios formadores</p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Socio Formador
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Socios Formadores Registrados ({socioformadores.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {socioformadores.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sin socios formadores
              </h3>
              <p className="text-gray-600 mb-4">
                Crea el primer socio formador para asignarlo a proyectos.
              </p>
              <Link href="/admin/users/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Socio Formador
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Nombre</th>
                    <th className="pb-3 font-medium">Correo Institucional</th>
                    <th className="pb-3 font-medium">Número Personal</th>
                    <th className="pb-3 font-medium">Fecha Registro</th>
                    <th className="pb-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {socioformadores.map((sf) => (
                    <tr key={sf.id} className="py-3">
                      <td className="py-3 font-medium text-gray-900">
                        {sf.nombreCompleto || '—'}
                      </td>
                      <td className="py-3 text-gray-600">{sf.correoInstitucional}</td>
                      <td className="py-3 text-gray-600">{sf.numeroPersonal || '—'}</td>
                      <td className="py-3 text-gray-500">
                        {formatMexicoDate(sf.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <DeleteSocioformadorButton id={sf.id} nombre={sf.nombreCompleto || sf.correoInstitucional} />
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
