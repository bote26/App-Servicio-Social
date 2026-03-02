'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { updateProject } from '../../actions';
import { Proyecto } from '@/lib/db/schema';

interface Socioformador {
  id: number;
  nombre: string | null;
  correo: string;
}

interface EditProjectFormProps {
  project: Proyecto;
  socioformadores: Socioformador[];
}

export function EditProjectForm({ project, socioformadores }: EditProjectFormProps) {
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setError('');
    startTransition(async () => {
      const result = await updateProject(project.id, formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <Link 
        href="/admin/projects" 
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver a proyectos
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Editar Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="claveProyecto">Clave del Proyecto *</Label>
                <Input
                  id="claveProyecto"
                  name="claveProyecto"
                  defaultValue={project.claveProyecto}
                  required
                />
              </div>
              <div>
                <Label htmlFor="periodo">Periodo *</Label>
                <Input
                  id="periodo"
                  name="periodo"
                  defaultValue={project.periodo}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                name="titulo"
                defaultValue={project.titulo}
                required
              />
            </div>

            <div>
              <Label htmlFor="organizacion">Organización</Label>
              <Input
                id="organizacion"
                name="organizacion"
                defaultValue={project.organizacion || ''}
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                defaultValue={project.descripcion || ''}
              />
            </div>

            <div>
              <Label htmlFor="objetivo">Objetivo</Label>
              <textarea
                id="objetivo"
                name="objetivo"
                rows={3}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                defaultValue={project.objetivo || ''}
              />
            </div>

            <div>
              <Label htmlFor="actividades">Actividades (una por línea)</Label>
              <textarea
                id="actividades"
                name="actividades"
                rows={4}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                defaultValue={project.actividades || ''}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="horas">Horas *</Label>
                <Input
                  id="horas"
                  name="horas"
                  type="number"
                  min="1"
                  defaultValue={project.horas}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cupoTotal">Cupo Total *</Label>
                <Input
                  id="cupoTotal"
                  name="cupoTotal"
                  type="number"
                  min="1"
                  defaultValue={project.cupoTotal}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Actual: {project.cupoDisponible} disponibles de {project.cupoTotal}
                </p>
              </div>
              <div>
                <Label htmlFor="modalidad">Modalidad</Label>
                <select
                  id="modalidad"
                  name="modalidad"
                  defaultValue={project.modalidad || ''}
                  className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="carrera">Carreras (separadas por coma)</Label>
                <Input
                  id="carrera"
                  name="carrera"
                  defaultValue={project.carrera || ''}
                />
              </div>
              <div>
                <Label htmlFor="horarioProyecto">Horario del Proyecto</Label>
                <Input
                  id="horarioProyecto"
                  name="horarioProyecto"
                  defaultValue={project.horarioProyecto || ''}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                name="ubicacion"
                defaultValue={project.ubicacion || ''}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="socioformadorId">Socioformador</Label>
                <select
                  id="socioformadorId"
                  name="socioformadorId"
                  defaultValue={project.socioformadorId || ''}
                  className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
                >
                  <option value="">Sin asignar</option>
                  {socioformadores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre || s.correo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="logoUrl">URL del Logo</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  defaultValue={project.logoUrl || ''}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                defaultChecked={project.activo}
                className="rounded border-gray-300"
              />
              <Label htmlFor="activo" className="font-normal">
                Proyecto activo
              </Label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/projects">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
