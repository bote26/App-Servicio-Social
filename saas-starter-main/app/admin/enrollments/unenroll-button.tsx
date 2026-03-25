'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserMinus, Loader2 } from 'lucide-react';
import { unenrollStudent } from './actions';

interface Props {
  inscripcionId: number;
  alumnoNombre: string;
  proyectoTitulo: string;
}

export default function UnenrollButton({ inscripcionId, alumnoNombre, proyectoTitulo }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUnenroll = async () => {
    const confirmed = confirm(
      `¿Desinscribir a "${alumnoNombre}" del proyecto "${proyectoTitulo}"?\n\nEsta acción liberará el cupo y el código de verificación.`
    );
    if (!confirmed) return;

    setLoading(true);
    const result = await unenrollStudent(inscripcionId);
    if (result?.error) {
      alert(`Error: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUnenroll}
      disabled={loading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <UserMinus className="h-4 w-4 mr-1" />
          Desinscribir
        </>
      )}
    </Button>
  );
}
