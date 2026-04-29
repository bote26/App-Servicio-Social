import { getActivityLogs } from '@/lib/db/queries';
import { formatTimeAgoMexico } from '@/lib/utils/date';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, LogIn, LogOut, UserPlus, Key, Trash, UserCog, Calendar, CheckCircle, FileText } from 'lucide-react';

const activityIcons: Record<string, any> = {
  SIGN_UP: UserPlus,
  SIGN_IN: LogIn,
  SIGN_OUT: LogOut,
  UPDATE_PASSWORD: Key,
  DELETE_ACCOUNT: Trash,
  UPDATE_ACCOUNT: UserCog,
  FAIR_REGISTRATION: Calendar,
  PHYSICAL_VALIDATION: CheckCircle,
  PROJECT_ENROLLMENT: FileText,
  CODE_USED: Key,
};

const activityLabels: Record<string, string> = {
  SIGN_UP: 'Registro de cuenta',
  SIGN_IN: 'Inicio de sesión',
  SIGN_OUT: 'Cierre de sesión',
  UPDATE_PASSWORD: 'Contraseña actualizada',
  DELETE_ACCOUNT: 'Cuenta eliminada',
  UPDATE_ACCOUNT: 'Cuenta actualizada',
  FAIR_REGISTRATION: 'Registro a feria',
  PHYSICAL_VALIDATION: 'Validación física',
  PROJECT_ENROLLMENT: 'Inscripción a proyecto',
  CODE_USED: 'Código utilizado',
};


export default async function ActivityPage() {
  const logs = await getActivityLogs();

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Mi Actividad
      </h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay actividad registrada
            </p>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => {
                const Icon = activityIcons[log.action] || Activity;
                const label = activityLabels[log.action] || log.action;
                
                return (
                  <div 
                    key={log.id} 
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-500">
                        {formatTimeAgoMexico(log.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
