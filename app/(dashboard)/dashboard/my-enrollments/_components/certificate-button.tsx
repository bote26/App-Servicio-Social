'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { getCertificateData } from '../actions';
import type { CertificateData } from '@/lib/utils/certificate';

interface Props {
  folio: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
  className?: string;
}

export default function CertificateButton({
  folio,
  variant = 'outline',
  size = 'sm',
  className,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCertificateData(folio);
      if (!data) {
        setError('No se pudo cargar el certificado');
        return;
      }

      // Dynamic import so jsPDF is only loaded client-side
      const { generateCertificatePDF } = await import('@/lib/utils/certificate');
      const doc = generateCertificatePDF(data as CertificateData);
      doc.save(`Certificado-${folio}.pdf`);
    } catch (e) {
      console.error(e);
      setError('Error al generar el certificado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant={variant}
        size={size}
        onClick={handleDownload}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <FileDown className="h-4 w-4 mr-1" />
            Descargar Certificado
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
