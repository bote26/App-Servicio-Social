'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Loader2, Power, FileSpreadsheet } from 'lucide-react';
import { fetchAllEvents, createEvent, toggleEventStatus, getPreRegistrationList } from './actions';
import * as XLSX from 'xlsx';

interface EventoFeria {
  id: number;
  nombre: string;
  fechaEvento: string;
  horaInicio: string | null;
  horaFin: string | null;
  activo: boolean;
  createdAt: Date;
}

const MX_TZ = 'America/Mexico_City';

function formatMXDate(date: Date | string) {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: MX_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date));
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventoFeria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [exportingId, setExportingId] = useState<number | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await fetchAllEvents();
      setEvents(data as EventoFeria[]);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreate = (formData: FormData) => {
    setError('');
    startTransition(async () => {
      const result = await createEvent(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setShowForm(false);
        loadEvents();
      }
    });
  };

  const handleToggle = async (eventId: number) => {
    await toggleEventStatus(eventId);
    loadEvents();
  };

  const handleExportExcel = async (event: EventoFeria) => {
    setExportingId(event.id);
    try {
      const rows = await getPreRegistrationList(event.id);

      if (rows.length === 0) {
        alert('No hay pre-registros para este evento.');
        return;
      }

      // Build worksheet data
      const wsData = [
        ['#', 'Nombre Completo', 'Matrícula', 'Correo Institucional', 'Horario', 'Estado', 'Fecha de Registro'],
        ...rows.map((r, i) => [
          i + 1,
          r.nombreCompleto ?? '',
          r.matricula ?? '',
          r.correo,
          r.horario,
          r.estado === 'validated' ? 'Validado' : 'Registrado',
          formatMXDate(r.fechaRegistro),
        ]),
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Column widths
      ws['!cols'] = [
        { wch: 4 },   // #
        { wch: 35 },  // Nombre
        { wch: 15 },  // Matrícula
        { wch: 35 },  // Correo
        { wch: 18 },  // Horario
        { wch: 14 },  // Estado
        { wch: 20 },  // Fecha
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Pre-registros');

      const fileName = `preregistro-${event.nombre.replace(/\s+/g, '_').toLowerCase()}-${event.fechaEvento}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Error exporting Excel:', err);
      alert('Error al generar el archivo Excel.');
    } finally {
      setExportingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos de Feria</h1>
          <p className="text-gray-600">Gestiona los eventos de servicio social</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Crear Nuevo Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nombre">Nombre del Evento *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Feria de Servicio Social Febrero-Junio 2026"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fechaEvento">Fecha *</Label>
                  <Input
                    id="fechaEvento"
                    name="fechaEvento"
                    type="date"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="horaInicio">Hora Inicio</Label>
                    <Input
                      id="horaInicio"
                      name="horaInicio"
                      type="time"
                    />
                  </div>
                  <div>
                    <Label htmlFor="horaFin">Hora Fin</Label>
                    <Input
                      id="horaFin"
                      name="horaFin"
                      type="time"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Crear Evento
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay eventos registrados</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className={!event.activo ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg">{event.nombre}</h3>
                        {event.activo && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">
                        {new Date(event.fechaEvento + 'T12:00:00').toLocaleDateString('es-MX', {
                          timeZone: MX_TZ,
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {event.horaInicio && ` • ${event.horaInicio} - ${event.horaFin}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportExcel(event)}
                      disabled={exportingId === event.id}
                      className="text-green-700 border-green-300 hover:bg-green-50"
                    >
                      {exportingId === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                      )}
                      Exportar Pre-registros
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(event.id)}
                      className={event.activo ? 'text-red-600' : 'text-green-600'}
                    >
                      <Power className="h-4 w-4 mr-1" />
                      {event.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
