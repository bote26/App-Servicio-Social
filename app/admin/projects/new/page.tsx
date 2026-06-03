'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createProject, getSocioformadores } from '../actions';

interface Socioformador {
  id: number;
  nombre: string | null;
  correo: string;
}

export default function NewProjectPage() {
  const [socioformadores, setSocioformadores] = useState<Socioformador[]>([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    getSocioformadores().then(setSocioformadores);
  }, []);

  const handleSubmit = (formData: FormData) => {
    setError('');
    startTransition(async () => {
      const result = await createProject(formData);
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
          <CardTitle>Nuevo Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="claveProyecto">Clave del Proyecto *</Label>
                <Input
                  id="claveProyecto"
                  name="claveProyecto"
                  placeholder="WA1234-101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="periodo">Periodo *</Label>
                <Input
                  id="periodo"
                  name="periodo"
                  placeholder="Febrero - Junio 2026"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Nombre del proyecto"
                required
              />
            </div>

            <div>
              <Label htmlFor="organizacion">Organización</Label>
              <Input
                id="organizacion"
                name="organizacion"
                placeholder="Nombre de la organización"
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                placeholder="Descripción del proyecto..."
              />
            </div>

            <div>
              <Label htmlFor="objetivo">Objetivo</Label>
              <textarea
                id="objetivo"
                name="objetivo"
                rows={3}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                placeholder="Objetivo del proyecto..."
              />
            </div>

            <div>
              <Label htmlFor="actividades">Actividades (una por línea)</Label>
              <textarea
                id="actividades"
                name="actividades"
                rows={4}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                placeholder="Actividad 1&#10;Actividad 2&#10;Actividad 3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="tipoProyecto">Tipo de Proyecto *</Label>
                <select
                  id="tipoProyecto"
                  name="tipoProyecto"
                  className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Intensivo">Intensivo</option>
                  <option value="Semestral">Semestral</option>
                </select>
              </div>
              <div>
                <Label htmlFor="horas">Horas *</Label>
                <Input
                  id="horas"
                  name="horas"
                  type="number"
                  min="1"
                  placeholder="120"
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
                  placeholder="10"
                  required
                />
              </div>
              <div>
                <Label htmlFor="modalidad">Modalidad</Label>
                <select
                  id="modalidad"
                  name="modalidad"
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
                  placeholder="ICT, IRS, LPS"
                />
              </div>
              <div>
                <Label htmlFor="horarioProyecto">Horario del Proyecto</Label>
                <Input
                  id="horarioProyecto"
                  name="horarioProyecto"
                  placeholder="Lunes a viernes de 9:00 a 14:00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                name="ubicacion"
                placeholder="Dirección completa"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="socioformadorId">Socioformador</Label>
                <select
                  id="socioformadorId"
                  name="socioformadorId"
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
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                defaultChecked
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
                    Creando...
                  </>
                ) : (
                  'Crear Proyecto'
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
