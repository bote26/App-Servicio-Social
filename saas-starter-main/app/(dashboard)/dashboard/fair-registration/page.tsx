'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { 
  registerForFair, 
  getActiveEventsForRegistration, 
  checkRegistrationStatus 
} from './actions';
import useSWR from 'swr';

interface UserData {
  id: number;
  email: string;
  name: string | null;
  matricula: string | null;
  numeroPersonal: string | null;
  correoAlternativo: string | null;
}

interface EventoFeria {
  id: number;
  nombre: string;
  fechaEvento: string;
  horaInicio: string | null;
  horaFin: string | null;
  activo: boolean;
}

interface RegistrationStatus {
  status: string;
  registration: any;
  event?: EventoFeria;
  isValidated?: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TIME_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];

export default function FairRegistrationPage() {
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get('success') === 'true';
  
  const { data: user } = useSWR<UserData>('/api/user', fetcher);
  const [eventos, setEventos] = useState<EventoFeria[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | null>(null);
  const [selectedEvento, setSelectedEvento] = useState<number | null>(null);
  const [selectedHorarios, setSelectedHorarios] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [evts, status] = await Promise.all([
          getActiveEventsForRegistration(),
          checkRegistrationStatus(),
        ]);
        setEventos(evts as EventoFeria[]);
        setRegistrationStatus(status);
        if (evts.length > 0 && !selectedEvento) {
          setSelectedEvento(evts[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setError('');
    startTransition(async () => {
      const result = await registerForFair(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (registrationStatus?.status !== 'not_registered' && registrationStatus?.registration) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
          Registro a la Feria
        </h1>

        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <CardTitle>¡Registro Completado!</CardTitle>
                <CardDescription>
                  {registrationStatus.event?.nombre}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-medium text-green-600">Registrado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horarios seleccionados:</span>
                <span className="font-medium text-right">{registrationStatus.registration.horario}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha del evento:</span>
                <span className="font-medium">
                  {registrationStatus.event?.fechaEvento 
                    ? new Date(registrationStatus.event.fechaEvento).toLocaleDateString('es-MX', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '-'}
                </span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                <strong>¡Excelente!</strong> Tu registro está completo. 
                Ahora puedes proceder a seleccionar un proyecto de servicio social.
              </p>
              <Button asChild className="mt-4 bg-green-600 hover:bg-green-700">
                <a href="/dashboard/projects">Ver Proyectos Disponibles</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (eventos.length === 0) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
          Registro a la Feria
        </h1>
        <Card className="max-w-2xl">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay eventos activos
            </h3>
            <p className="text-gray-600">
              Actualmente no hay ferias de servicio social programadas. 
              Vuelve más tarde para registrarte.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Registro a la Feria de Servicio Social
      </h1>

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">¡Registro exitoso!</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Tu pre-registro ha sido guardado. Recuerda asistir al evento para la validación física.
          </p>
        </div>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Formulario de Pre-Registro
          </CardTitle>
          <CardDescription>
            Completa tu información y selecciona los horarios en que puedes asistir a la feria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="eventoFeriaId" value={selectedEvento || ''} />

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Evento</h3>
              <div className="grid gap-3">
                {eventos.map((evento) => (
                  <label
                    key={evento.id}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedEvento === evento.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="evento"
                      value={evento.id}
                      checked={selectedEvento === evento.id}
                      onChange={() => setSelectedEvento(evento.id)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{evento.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(evento.fechaEvento).toLocaleDateString('es-MX', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {evento.horaInicio && ` • ${evento.horaInicio} - ${evento.horaFin}`}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      selectedEvento === evento.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedEvento === evento.id && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Datos Personales</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
                  <Input
                    id="nombreCompleto"
                    name="nombreCompleto"
                    defaultValue={user?.name || ''}
                    placeholder="Juan Pérez García"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="matricula">Matrícula *</Label>
                  <Input
                    id="matricula"
                    name="matricula"
                    defaultValue={user?.matricula || ''}
                    placeholder="A01234567"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="correoAlternativo">Correo Alternativo *</Label>
                <Input
                  id="correoAlternativo"
                  name="correoAlternativo"
                  type="email"
                  defaultValue={user?.correoAlternativo || ''}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Selecciona tus Horarios *</h3>
                <span className="text-sm text-gray-500">
                  {selectedHorarios.length} seleccionado{selectedHorarios.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Puedes seleccionar hasta 3 horarios en los que podrías asistir a la feria.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedHorarios.includes(slot);
                  const isDisabled = !isSelected && selectedHorarios.length >= 3;
                  return (
                    <label
                      key={slot}
                      className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all text-sm ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : isDisabled
                        ? 'border-gray-200 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                    }`}
                    >
                      <input
                        type="checkbox"
                        name="horarios"
                        value={slot}
                        checked={isSelected}
                        disabled={!isSelected && selectedHorarios.length >= 3}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHorarios([...selectedHorarios, slot]);
                          } else {
                            setSelectedHorarios(selectedHorarios.filter(h => h !== slot));
                          }
                        }}
                        className="sr-only"
                      />
                      <span className="flex items-center gap-2">
                        {isSelected && <CheckCircle className="h-4 w-4" />}
                        {slot}
                      </span>
                    </label>
                  );
                })}
              </div>
              <input type="hidden" name="horario" value={selectedHorarios.join(', ')} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending || !selectedEvento || selectedHorarios.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Confirmar Pre-Registro'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
