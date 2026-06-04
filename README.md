# Sistema de Gestión de Servicio Social

Plataforma web para la gestión de programas de servicio social universitario. Conecta estudiantes con proyectos aprobados y asegura un proceso de asignación seguro, justo y controlado.

## Características

### Para Estudiantes
- Registro y autenticación (sign-up redirige automáticamente al pre-registro de feria)
- Pre-registro para ferias de servicio social (requiere nombre completo, matrícula y correo alternativo)
- Validación física de asistencia (realizada por staff en la feria)
- Búsqueda y filtrado de proyectos activos con cupo disponible
- Inscripción con código de autorización de un solo uso
- Descarga de certificado PDF con firma digital Ed25519
- Seguimiento de inscripciones y actividad de cuenta
- Actualización de datos de perfil y contraseña
- Eliminación de cuenta (soft delete)

### Para Administradores
- Dashboard con estadísticas en tiempo real: total de estudiantes, registros a feria, validados, proyectos activos, inscripciones y cupos disponibles
- Gráficas de inscripciones por proyecto, tendencia diaria (30 días) e inscripciones por hora del día actual
- Gestión completa de proyectos (CRUD) con importación masiva desde CSV
- Activar/desactivar proyectos sin borrarlos
- Ajuste de cupo total (el cupo disponible se recalcula proporcionalmente)
- Gestión de eventos de feria (crear, activar/desactivar)
- Lista de pre-registros por evento
- Validación de asistencia de estudiantes en feria
- Generación de hasta 100 códigos de autorización por proyecto
- Exportación de códigos a CSV
- Desinscripción de estudiantes (restaura cupo y reutiliza código)
- Descarga de certificados PDF de cualquier inscripción por folio
- Gestión de usuarios: crear y eliminar socioformadores

### Para Socioformadores
- Dashboard con estadísticas de sus proyectos: alumnos inscritos, cupos disponibles, códigos usados/total, proyectos activos
- Gráficas de capacidad por proyecto e inscripciones por hora del día actual
- Visualización de sus proyectos asignados (admin ve todos)
- Generación de hasta 100 códigos por proyecto
- Lista de estudiantes inscritos por proyecto
- Exportación de datos

### Para Staff
- Acceso a `/admin/validation` para validar asistencia de estudiantes en feria

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router + Turbopack) |
| Features experimentales | Partial Pre-Rendering (`ppr`), `clientSegmentCache` |
| Base de datos | [PostgreSQL 16](https://www.postgresql.org/) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| UI | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Estilos | [Tailwind CSS 4](https://tailwindcss.com/) |
| Gráficas | [Recharts](https://recharts.org/) |
| Auth | JWT (HS256) firmado con [JOSE](https://github.com/panva/jose), cookies HTTP-only |
| Contraseñas | bcrypt con 10 salt rounds |
| Firma digital | Ed25519 (RFC 8032) vía Node.js `crypto` |
| Generación de PDF | [jsPDF](https://github.com/parallax/jsPDF) (cliente) |
| Exportación CSV | [xlsx](https://github.com/SheetJS/sheetjs) |
| Validación | [Zod](https://zod.dev/) |
| Lenguaje | TypeScript 5 |

---

## Estructura del Proyecto

```
App-Servicio-Social/
├── app/
│   ├── (login)/                    # Páginas de autenticación (sign-in, sign-up)
│   ├── (dashboard)/                # Dashboard de estudiantes
│   │   └── dashboard/
│   │       ├── activity/           # Registro de actividad del usuario
│   │       ├── fair-registration/  # Pre-registro a ferias
│   │       ├── my-enrollments/     # Mis inscripciones + descarga de certificado
│   │       ├── projects/           # Catálogo de proyectos y detalle
│   │       └── general/            # Datos generales del perfil
│   ├── admin/                      # Panel de administración
│   │   ├── codes/                  # Gestión de códigos de autorización
│   │   ├── enrollments/            # Gestión de inscripciones
│   │   ├── events/                 # Gestión de eventos de feria
│   │   ├── projects/               # CRUD de proyectos + importación CSV
│   │   └── users/                  # Gestión de usuarios (socioformadores)
│   ├── socioformador/              # Panel de socioformadores
│   │   ├── codes/                  # Códigos de su(s) proyecto(s)
│   │   └── students/               # Estudiantes inscritos
│   └── api/
│       └── user/                   # Endpoint REST de usuario actual
├── components/
│   └── ui/                         # Componentes shadcn/ui
├── lib/
│   ├── auth/
│   │   ├── session.ts              # JWT sign/verify, hashPassword, setSession
│   │   ├── middleware.ts           # validatedAction, requireAdmin, requireStaffOrAdmin, requireSocioformador
│   │   └── roles.ts                # ROLE_PERMISSIONS, canAccessRoute
│   ├── db/
│   │   ├── schema.ts               # Tablas, relaciones, enums
│   │   ├── queries.ts              # Todas las queries de lectura
│   │   ├── transactions.ts         # enrollStudentInProject, validateStudentAttendance
│   │   ├── migrations/             # Archivos SQL de Drizzle Kit
│   │   ├── seed.ts                 # Datos de prueba
│   │   └── setup.ts                # Asistente interactivo para crear .env
│   ├── scripts/
│   │   └── generate-keys.ts        # Genera par de llaves Ed25519
│   └── utils/
│       ├── folio.ts                # generateFolio, generateSystemConfirmation, verifySystemConfirmation
│       ├── codes.ts                # generateProjectCode, hashCode, generateCodesWithHashes
│       ├── signing.ts              # signEnrollment, verifyEnrollment
│       ├── certificate.ts          # generateCertificatePDF (jsPDF)
│       └── date.ts                 # mexicoTodayString (zona horaria America/Mexico_City)
├── middleware.ts                   # Protección de rutas y renovación de sesión
├── .env.example                    # Plantilla de variables de entorno
├── docker-compose.yml              # PostgreSQL local vía Docker
└── drizzle.config.ts               # Configuración de Drizzle Kit
```

---

## Estructura de Base de Datos

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Cuentas de usuario. Soft delete via `deleted_at`. |
| `eventos_feria` | Eventos de feria de servicio social |
| `pre_registro_feria` | Pre-registros de estudiantes a ferias. Estado: `registered` / `validated`. Unique: `(alumno_id, evento_feria_id)`. |
| `proyectos` | Proyectos de servicio social. `tipo_proyecto`: `Intensivo`, `Semestral` o `General`. |
| `codigos_proyecto` | Códigos de autorización. Se almacena el hash SHA-256, nunca el código en texto plano. Tienen campo `expira_en` opcional. |
| `inscripciones` | Inscripciones finales. Unique: `(alumno_id, periodo, tipo_proyecto)` — permite 1 Intensivo + 1 Semestral por periodo. `folio` único global. |
| `activity_logs` | Registro de eventos: `SIGN_UP`, `SIGN_IN`, `SIGN_OUT`, `UPDATE_PASSWORD`, `DELETE_ACCOUNT`, `UPDATE_ACCOUNT`, `FAIR_REGISTRATION`, `PHYSICAL_VALIDATION`, `PROJECT_ENROLLMENT`, `CODE_USED`. |

> **Nota sobre migraciones:** la migración `0000` tenía la restricción `UNIQUE(alumno_id, periodo)` (una sola inscripción por periodo). La migración `0001` la cambió a `UNIQUE(alumno_id, periodo, tipo_proyecto)` para permitir 1 Intensivo + 1 Semestral. Ambas migraciones deben aplicarse en orden (`pnpm db:migrate`).

---

## Roles de Usuario y Permisos

| Permiso | `student` | `admin` | `socioformador` | `staff` |
|---------|:---------:|:-------:|:---------------:|:-------:|
| Acceder al dashboard | ✅ | ✅ | ✅ | ✅ |
| Pre-registrarse a feria | ✅ | — | — | — |
| Ver proyectos | ✅ | ✅ | ✅ | ✅ |
| Inscribirse a proyecto | ✅ | — | — | — |
| Gestionar proyectos | — | ✅ | — | — |
| Validar asistencia en feria | — | ✅ | — | ✅ |
| Gestionar usuarios | — | ✅ | — | — |
| Ver todas las inscripciones | — | ✅ | — | ✅ |
| Generar códigos | — | ✅ | ✅ | — |

---

## Flujo del Sistema

```
Estudiante:
  Registro → Pre-registro Feria (nombre, matrícula, correo alternativo, horario)
           → Validación Física por Staff en evento
           → Catálogo de Proyectos → Inscripción con código de un solo uso
           → Descarga de Certificado PDF firmado digitalmente

Socioformador:
  Login → Ver proyectos asignados → Generar/distribuir códigos a estudiantes
        → Ver lista de inscritos → Exportar datos

Admin:
  Login → Dashboard (estadísticas + gráficas) → CRUD Proyectos / Importar CSV
        → Crear Eventos → Validar Asistencia → Generar Códigos
        → Gestionar Inscripciones / Desinscribir → Descargar Certificados
        → Crear/Eliminar Socioformadores → Exportar reportes
```

---

## Instalación y Configuración Local

### Requisitos previos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker (recomendado para PostgreSQL) o instancia de PostgreSQL 16 accesible

### 1. Clonar el repositorio

```bash
git clone https://github.com/bote26/App-Servicio-Social.git
cd App-Servicio-Social
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Levantar PostgreSQL con Docker

```bash
docker compose up -d
```

Levanta PostgreSQL en el puerto **54322** con usuario `postgres`, contraseña `postgres` y base de datos `postgres`.

> Si ya tienes PostgreSQL instalado, sáltate este paso y ajusta `POSTGRES_URL` en el siguiente.

### 4. Configurar variables de entorno

El script `db:setup` es un asistente interactivo que crea el `.env`. Pregunta si usas Docker o una URL remota y **genera automáticamente `POSTGRES_URL`, `BASE_URL` y `AUTH_SECRET`**. Las llaves de firma se generan por separado en el paso 5.

```bash
pnpm db:setup
```

O copia y edita manualmente:

```bash
cp .env.example .env
```

> ⚠️ El `.env.example` usa puerto `5432` y base `serviceweb` como ejemplo genérico. Con Docker la URL correcta es `postgres://postgres:postgres@localhost:54322/postgres`.

Variables requeridas:

| Variable | Descripción | Cómo obtenerla |
|----------|-------------|----------------|
| `POSTGRES_URL` | URL de conexión a PostgreSQL | Con Docker: `postgres://postgres:postgres@localhost:54322/postgres` |
| `BASE_URL` | URL base de la app | `http://localhost:3000` en desarrollo |
| `AUTH_SECRET` | Secreto para firmar JWT (HS256) | Generado por `db:setup`, o: `openssl rand -base64 32` |
| `SIGNING_PRIVATE_KEY` | Llave privada Ed25519 PKCS8 DER en base64 | `pnpm keys:generate` (paso 5) |
| `SIGNING_PUBLIC_KEY` | Llave pública Ed25519 SPKI DER en base64 | `pnpm keys:generate` (paso 5) |

### 5. Generar el par de llaves criptográficas

`db:setup` **no genera estas llaves**. Ejecuta este comando y copia las dos líneas resultantes al final de tu `.env`:

```bash
pnpm keys:generate
```

Salida esperada:

```
SIGNING_PRIVATE_KEY=MC4CAQAwBQYDK2VwBCIEI...
SIGNING_PUBLIC_KEY=MCowBQYDK2VwAyEA...
```

> ⚠️ **`SIGNING_PRIVATE_KEY` debe mantenerse secreta.** Nunca la incluyas en el repositorio ni la expongas en logs.

### 6. Ejecutar migraciones y seed

```bash
pnpm db:migrate   # Aplica las dos migraciones en orden (0000 y 0001)
pnpm db:seed      # Crea usuarios de prueba, un evento de feria y 3 proyectos de ejemplo
```

### 7. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Cuentas de Prueba

Disponibles después de `pnpm db:seed`:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@tec.mx | admin123 |
| Staff | staff@tec.mx | staff123 |
| Socioformador | socioformador@clima.org.mx | socio123 |
| Estudiante | A01234567@tec.mx | student123 |

El seed también crea el evento **"Feria de Servicio Social Febrero-Junio 2026"** y 3 proyectos con sus códigos de autorización.

---

## Comandos Disponibles

```bash
pnpm dev            # Servidor de desarrollo (Turbopack)
pnpm build          # Build de producción
pnpm start          # Servidor de producción

pnpm db:setup       # Asistente interactivo para crear .env
pnpm db:generate    # Genera archivos de migración a partir del schema
pnpm db:migrate     # Ejecuta las migraciones pendientes en orden
pnpm db:push        # Push directo del schema sin generar migraciones (útil en desarrollo)
pnpm db:seed        # Inserta datos de prueba
pnpm db:studio      # Abre Drizzle Studio (UI web para explorar la BD)

pnpm keys:generate  # Genera par de llaves Ed25519 para firma de certificados
```

---

## Protección de Rutas por Rol

El middleware (`middleware.ts`) protege todas las rutas y redirige según el rol:

| Ruta | Acceso requerido |
|------|-----------------|
| `/`, `/sign-in`, `/sign-up` | Público |
| `/dashboard/*` | Cualquier usuario autenticado |
| `/admin/*` | Solo `admin` |
| `/admin/validation` | `admin` o `staff` (definido en `lib/auth/roles.ts`) |
| `/socioformador/*` | `admin` o `socioformador` |

Sin sesión → redirige a `/sign-in`. Con sesión pero rol incorrecto en `/admin` → redirige a `/dashboard`.

**Sesión con ventana deslizante de 24 horas:** cada petición GET renueva automáticamente la cookie JWT. Una sesión activa nunca expira mientras el usuario siga usando la app. El token usa algoritmo HS256 y se almacena en una cookie `httpOnly`, `secure`, `sameSite: lax`.

**Redirección post-login por rol:**
- `admin` → `/admin`
- `staff` → `/admin/validation`
- `socioformador` → `/socioformador`
- `student` → `/dashboard`

---

## Importación Masiva de Proyectos (CSV)

Los administradores pueden importar proyectos desde `/admin/projects/import`. La página incluye un botón "Descargar plantilla" que genera el CSV de ejemplo.

### Columnas del CSV

| Columna | Requerida | Descripción |
|---------|:---------:|-------------|
| `claveProyecto` | ✅ | Clave única (ej. `WA1065-101`). Se omite la fila si ya existe. |
| `titulo` | ✅ | Nombre del proyecto |
| `periodo` | ✅ | Periodo (ej. `Febrero - Junio 2026`) |
| `horas` | ✅ | Horas de servicio (entero) |
| `cupoTotal` | ✅ | Capacidad total. `cupo_disponible` se inicializa con este valor. |
| `tipoProyecto` | ✅ | `Intensivo`, `Semestral` o `General` |
| `organizacion` | — | Nombre de la organización |
| `modalidad` | — | `Presencial`, `Remoto`, etc. |
| `ubicacion` | — | Dirección |
| `horarioProyecto` | — | Horario (ej. `Lunes a viernes 9:00-14:00`) |
| `carrera` | — | Carreras compatibles (ej. `ICT,IRS`) |
| `descripcion` | — | Descripción general |
| `objetivo` | — | Objetivo del proyecto |
| `actividades` | — | Actividades separadas por `;` |
| `socioformadorCorreo` | — | Correo del socioformador. Debe existir en el sistema con rol `socioformador`. |
| `logoUrl` | — | URL de imagen/logo |
| `activo` | — | `true` o `false` (default: `true`) |

Si `socioformadorCorreo` no coincide con ningún usuario registrado, el proyecto se crea sin socioformador y se muestra advertencia por fila. Los proyectos con `claveProyecto` duplicada se omiten (no generan error).

---

## Generación de Códigos de Autorización

Los códigos se generan con `lib/utils/codes.ts`:

- **Formato:** 8 caracteres alfanuméricos en mayúsculas, usando el alfabeto `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (se excluyen `I`, `O`, `1`, `0` para evitar confusión visual)
- **Almacenamiento:** solo el hash SHA-256 del código se guarda en la BD (`codigo_hash`). El código en texto plano se muestra una sola vez al generarlo.
- **Verificación:** al inscribirse, el sistema hashea el código ingresado y lo compara con `codigo_hash`
- **Expiración:** el campo `expira_en` permite códigos con fecha límite. Si está configurado y la fecha ya pasó, el código se rechaza.
- **Límite de generación:** máximo 100 códigos por operación (validado en servidor)
- **Unicidad:** constraint `UNIQUE(proyecto_id, codigo)` — no pueden existir dos códigos iguales para el mismo proyecto

---

## Formato del Folio de Inscripción

Cada inscripción recibe un folio único con el formato:

```
SS{año2d}{mes2d}-{HASH8}-{RANDOM6}

Ejemplo: SS2604-A1B2C3D4-XYZ789
```

Donde:
- `SS` — prefijo fijo (Servicio Social)
- `{año2d}{mes2d}` — año y mes de la inscripción (ej. `2604` = abril 2026)
- `{HASH8}` — primeros 8 chars del SHA-256 de `alumnoId + proyectoId + periodo + timestamp`
- `{RANDOM6}` — 6 chars aleatorios en base36 en mayúsculas

---

## Firma Digital de Certificados

El sistema usa **Ed25519** (RFC 8032) implementado con el módulo `crypto` de Node.js para firmar cada certificado. La firma se produce en el servidor con la llave privada; la verificación puede hacerse offline con la llave pública.

### Mensaje canónico firmado

```
<folio>|<alumnoId>|<proyectoId>|<timestamp ISO>

Ejemplo:
SS2604-A1B2C3D4-XYZ789|42|7|2026-04-15T10:30:00.000Z
```

### Estructura del campo `confirmacion_sistema`

La columna `confirmacion_sistema` en `inscripciones` guarda un JSON:

```json
{
  "algorithm": "Ed25519",
  "folio":     "SS2604-A1B2C3D4-XYZ789",
  "timestamp": "2026-04-15T10:30:00.000Z",
  "message":   "SS2604-A1B2C3D4-XYZ789|42|7|2026-04-15T10:30:00.000Z",
  "signature": "<base64, 64 bytes / 88 chars>",
  "publicKey": "<SIGNING_PUBLIC_KEY en base64>"
}
```

Los campos `message`, `signature` y `publicKey` son suficientes para verificación offline.

> **Modo legacy SHA-256:** inscripciones anteriores a la migración Ed25519 tienen `{ "timestamp": "...", "signature": "..." }` y muestran el badge `SHA-256 LEGACY` en el PDF. Son históricamente válidas pero no verificables con el comando OpenSSL de abajo.

### Verificación offline

```bash
echo -n "SS2604-A1B2C3D4-XYZ789|42|7|2026-04-15T10:30:00.000Z" > message.txt
echo "<publicKey del JSON>" | base64 -d > pubkey.der
echo "<signature del JSON>" | base64 -d > signature.bin
openssl pkeyutl -verify -pubin -keyform DER -inkey pubkey.der \
  -in message.txt -sigfile signature.bin
```

### Rotación de llaves

1. Genera un nuevo par: `pnpm keys:generate`
2. Actualiza `SIGNING_PRIVATE_KEY` y `SIGNING_PUBLIC_KEY` en `.env` y en producción
3. Las inscripciones antiguas conservan su firma original (verificable con la llave anterior)
4. Las nuevas inscripciones usarán la nueva llave

---

## Reglas de Negocio

1. **Validación física requerida** — el estudiante debe asistir a la feria y ser validado por staff antes de poder inscribirse a cualquier proyecto
2. **Pre-registro actualiza perfil** — al registrarse a una feria se actualizan `nombre_completo`, `matricula` y `correo_alternativo` del usuario
3. **Código de autorización de un solo uso** — una vez usado, el campo `usado` se marca `true` y no puede reutilizarse
4. **Capacidad atómica** — la inscripción, el marcado del código como usado y el decremento del cupo ocurren en una sola transacción de base de datos
5. **Límite por tipo y periodo** — un estudiante puede tener máximo 1 inscripción `Intensivo` + 1 `Semestral` por periodo. Los proyectos `General` comparten el slot de `Semestral` (constraint `UNIQUE(alumno_id, periodo, tipo_proyecto)`)
6. **Desinscripción atómica** — al desinscribir un estudiante se restaura el cupo y se reutiliza el código en una sola transacción
7. **Cupo nunca negativo** — el decremento usa `GREATEST(cupo_disponible - 1, 0)` y el incremento usa `LEAST(cupo_disponible + 1, cupo_total)`
8. **Ajuste proporcional de cupo** — al editar `cupo_total` desde admin, `cupo_disponible` se ajusta proporcionalmente: `nuevo_disponible = MAX(0, disponible_actual + (nuevo_total - total_actual))`
9. **Soft delete en usuarios** — al eliminar una cuenta, `deleted_at` se marca y el correo se renombra a `{correo}-{id}-deleted` para liberar el unique constraint
10. **Todas las queries excluyen usuarios eliminados** — `isNull(deletedAt)` en todas las consultas de usuarios

---

## Deploy a Producción (Vercel)

1. Push tu código a GitHub
2. Conecta el repositorio en [Vercel](https://vercel.com/)
3. Genera el par de llaves: `pnpm keys:generate`
4. Configura las variables de entorno en el dashboard de Vercel:
   - `POSTGRES_URL` — URL de tu base de datos de producción
   - `BASE_URL` — URL pública (ej. `https://tu-app.vercel.app`)
   - `AUTH_SECRET`
   - `SIGNING_PRIVATE_KEY`
   - `SIGNING_PUBLIC_KEY`
5. Aplica las migraciones apuntando a producción:
   ```bash
   POSTGRES_URL=<tu-url-prod> pnpm db:migrate
   ```

> **Nota:** el `next.config.ts` habilita `ppr: true` (Partial Pre-Rendering) y `clientSegmentCache: true`, ambas features experimentales de Next.js 15. Verifica compatibilidad con tu versión de Next.js si actualizas.

---

## Licencia

MIT
