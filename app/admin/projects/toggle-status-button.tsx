'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Power, Loader2 } from 'lucide-react';
import { toggleProjectStatus } from './actions';
import { useRouter } from 'next/navigation';

interface ToggleStatusButtonProps {
  projectId: number;
  isActive: boolean;
}

export function ToggleStatusButton({ projectId, isActive }: ToggleStatusButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsPending(true);
    try {
      await toggleProjectStatus(projectId);
      router.refresh();
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Power className="h-4 w-4 mr-1" />
          {isActive ? 'Desactivar' : 'Activar'}
        </>
      )}
    </Button>
  );
}
