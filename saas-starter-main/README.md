# Sistema de Gestión de Servicio Social

Plataforma web para la gestión de programas de servicio social universitario. Conecta estudiantes con proyectos aprobados y asegura un proceso de asignación seguro, justo y controlado.

## Características

### Para Estudiantes
- Registro y autenticación
- Pre-registro para ferias de servicio social
- Validación física de asistencia
- Búsqueda y filtrado de proyectos
- Inscripción con código de autorización
- Seguimiento de inscripciones

### Para Administradores
- Dashboard con estadísticas en tiempo real
- Gestión de proyectos (CRUD)
- Gestión de eventos de feria
- Validación de asistencia de estudiantes
- Generación de códigos de inscripción
- Exportación de datos (CSV)

### Para Socioformadores
- Visualización de proyectos asignados
- Acceso a códigos de inscripción
- Lista de estudiantes inscritos
- Exportación de datos

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Auth**: JWT con cookies HTTP-only

## Estructura de Base de Datos

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Cuentas de usuario (estudiantes, admin, socioformadores, staff) |
| `eventos_feria` | Eventos de feria de servicio social |
| `pre_registro_feria` | Pre-registros de estudiantes a ferias |
| `proyectos` | Proyectos de servicio social |
| `codigos_proyecto` | Códigos de autorización por proyecto |
| `inscripciones` | Inscripciones finales de estudiantes |
| `activity_logs` | Registro de actividad del sistema |

## Roles de Usuario

| Rol | Descripción |
|-----|-------------|
| `student` | Estudiante que busca servicio social |
| `admin` | Administrador con acceso completo |
| `socioformador` | Responsable de proyectos específicos |
| `staff` | Personal de validación en ferias |

## Flujo del Sistema

```
Estudiante:
Cuenta → Pre-registro Feria → Validación Física → Selección Proyecto → Inscripción Final

Socioformador:
Recibe códigos → Distribuye códigos a estudiantes

Admin:
Login → Dashboard → Gestión Proyectos → Validación → Reportes
```

## Instalación

```bash
git clone <repo-url>
cd saas-starter-main
pnpm install
```

## Configuración

Crea el archivo `.env`:

```bash
npm run db:setup
```

Variables requeridas:
- `POSTGRES_URL`: URL de conexión a PostgreSQL
- `AUTH_SECRET`: Secreto para JWT (genera con `openssl rand -base64 32`)

## Migraciones

```bash
npm run db:generate   # Genera migraciones
npm run db:migrate    # Ejecuta migraciones
npm run db:seed       # Crea datos de prueba
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Cuentas de Prueba

Después de ejecutar `npm run db:seed`:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@tec.mx | admin123 |
| Staff | staff@tec.mx | staff123 |
| Socioformador | socioformador@clima.org.mx | socio123 |
| Estudiante | A01234567@tec.mx | student123 |

## Reglas de Negocio

1. **Un estudiante no puede inscribirse dos veces al mismo proyecto**
2. **Los proyectos tienen capacidad fija** - cuando cupo = 0, se rechazan inscripciones
3. **Validación física requerida** antes de poder inscribirse
4. **Código de autorización requerido** proporcionado por socioformador
5. **Decrementos de capacidad atómicos** para evitar sobrecupos
6. **Base de datos es fuente de verdad** - exportaciones son solo vistas

## Producción

### Deploy a Vercel

1. Push tu código a GitHub
2. Conecta el repositorio a [Vercel](https://vercel.com/)
3. Configura las variables de entorno:
   - `POSTGRES_URL`
   - `AUTH_SECRET`

## Estructura del Proyecto

```
saas-starter-main/
├── app/
│   ├── (login)/           # Páginas de autenticación
│   ├── (dashboard)/       # Dashboard de estudiantes
│   ├── admin/             # Panel de administración
│   └── socioformador/     # Panel de socioformadores
├── components/            # Componentes UI reutilizables
├── lib/
│   ├── auth/              # Autenticación y middleware
│   ├── db/                # Schema, queries, transacciones
│   └── utils/             # Utilidades (folio, códigos)
└── public/                # Assets estáticos
```

## Licencia

MIT
