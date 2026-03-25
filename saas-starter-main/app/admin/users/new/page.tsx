'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { createSocioformador } from '../actions';

export default function NewSocioformadorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createSocioformador(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/admin/users');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/users" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a usuarios
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Nuevo Socio Formador</h1>
        <p className="text-gray-600">Crea una cuenta de socio formador para gestionar proyectos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Datos del Socio Formador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
                <Input
                  id="nombreCompleto"
                  name="nombreCompleto"
                  type="text"
                  placeholder="Ej. Juan García López"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="correoInstitucional">Correo Institucional *</Label>
                <Input
                  id="correoInstitucional"
                  name="correoInstitucional"
                  type="email"
                  placeholder="correo@tec.mx"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="numeroPersonal">Número Personal</Label>
                <Input
                  id="numeroPersonal"
                  name="numeroPersonal"
                  type="text"
                  placeholder="Ej. L00123456"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">El socio formador podrá cambiarla después.</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Socio Formador
                  </>
                )}
              </Button>
              <Link href="/admin/users">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
