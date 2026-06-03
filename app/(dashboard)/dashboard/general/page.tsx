'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { updateAccount } from '@/app/(login)/actions';
import useSWR from 'swr';
import { Suspense } from 'react';

interface UserData {
  id: number;
  email: string;
  name: string | null;
  matricula: string | null;
  numeroPersonal: string | null;
  correoAlternativo: string | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = {
  nombreCompleto?: string;
  error?: string;
  success?: string;
};

function AccountFormWithData({ state }: { state: ActionState }) {
  const { data: user } = useSWR<UserData>('/api/user', fetcher);
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="nombreCompleto" className="mb-2">
            Nombre Completo *
          </Label>
          <Input
            id="nombreCompleto"
            name="nombreCompleto"
            placeholder="Tu nombre completo"
            defaultValue={state.nombreCompleto || user?.name || ''}
            required
          />
        </div>
        <div>
          <Label htmlFor="correoInstitucional" className="mb-2">
            Correo Institucional *
          </Label>
          <Input
            id="correoInstitucional"
            name="correoInstitucional"
            type="email"
            placeholder="correo@tec.mx"
            defaultValue={user?.email || ''}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="matricula" className="mb-2">
            Matrícula
          </Label>
          <Input
            id="matricula"
            name="matricula"
            placeholder="A01234567"
            defaultValue={user?.matricula || ''}
          />
        </div>
        <div>
          <Label htmlFor="numeroPersonal" className="mb-2">
            Número Personal (INE)
          </Label>
          <Input
            id="numeroPersonal"
            name="numeroPersonal"
            placeholder="1234567890"
            defaultValue={user?.numeroPersonal || ''}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="correoAlternativo" className="mb-2">
          Correo Alternativo
        </Label>
        <Input
          id="correoAlternativo"
          name="correoAlternativo"
          type="email"
          placeholder="correo@ejemplo.com"
          defaultValue={user?.correoAlternativo || ''}
        />
      </div>
    </>
  );
}

function AccountFormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function GeneralPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    {}
  );

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Mi Perfil
      </h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={formAction}>
            <Suspense fallback={<AccountFormSkeleton />}>
              <AccountFormWithData state={state} />
            </Suspense>
            
            {state.error && (
              <p className="text-red-500 text-sm">{state.error}</p>
            )}
            {state.success && (
              <p className="text-green-500 text-sm">{state.success}</p>
            )}
            
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isPending}
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
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
