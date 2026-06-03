'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { getCertificateDataAdmin } from './actions';
import type { CertificateData } from '@/lib/utils/certificate';

interface Props {
  folio: string;
}

export default function AdminCertificateButton({ folio }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const data = await getCertificateDataAdmin(folio);
      if (!data) {
        alert('No se pudo cargar el certificado');
        return;
      }
      const { generateCertificatePDF } = await import('@/lib/utils/certificate');
      const doc = generateCertificatePDF(data as CertificateData);
      doc.save(`Certificado-${folio}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Error al generar el certificado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
    </Button>
  );
}
