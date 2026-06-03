'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteSocioformador } from './actions';

interface Props {
  id: number;
  nombre: string;
}

export default function DeleteSocioformadorButton({ id, nombre }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar al socio formador "${nombre}"? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    await deleteSocioformador(id);
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
