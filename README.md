# Sistema de Gestión de Servicio Social

Plataforma web para la gestión de programas de servicio social universitario. Conecta estudiantes con proyectos aprobados y asegura un proceso de asignación seguro, justo y controlado.

## Características

### Para Estudiantes
- Registro y autenticación
- Pre-registro para ferias de servicio social
- Validación física de asistencia
- Búsqueda y filtrado de proyectos
- Inscripción con código de autorización
- Descarga de certificado PDF con firma digital Ed25519
- Seguimiento de inscripciones

### Para Administradores
- Dashboard con estadísticas en tiempo real y gráficas por hora
- Gestión de proyectos (CRUD)
- Gestión de eventos de feria
- Validación de asistencia de estudiantes
- Generación de códigos de inscripción
- Desinscripción de estudiantes (restaura cupo y código)
- Descarga de certificados PDF de cualquier inscripción
- Exportación de datos (CSV)

### Para Socioformadores
- Dashboard con estadísticas y gráficas de capacidad e inscripciones por hora
- Visualización de proyectos asignados
- Generación y acceso a códigos de inscripción
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

| Variable | Descripción | Cómo generarla |
|----------|-------------|----------------|
| `POSTGRES_URL` | URL de conexión a PostgreSQL | — |
| `AUTH_SECRET` | Secreto para firmar JWT | `openssl rand -base64 32` |
| `SIGNING_PRIVATE_KEY` | Llave privada Ed25519 (PKCS8 DER en base64) | `npm run keys:generate` |
| `SIGNING_PUBLIC_KEY` | Llave pública Ed25519 (SPKI DER en base64) | `npm run keys:generate` |

## Firma Digital de Certificados

El sistema usa **Ed25519** (RFC 8032) para firmar criptográficamente cada certificado de inscripción.

### ¿Qué se firma?

El mensaje canónico tiene el formato:

```
<folio>|<alumnoId>|<proyectoId>|<timestamp ISO>

Ejemplo:
SS2604-A1B2C3D4-XYZ789|42|7|2026-04-15T10:30:00.000Z
```

La firma es producida por la **llave privada del sistema** (solo vive en el servidor) y puede verificarse con la **llave pública** (incluida en cada PDF).

### Generar el par de llaves

Ejecuta esto **una sola vez** antes del primer deploy:

```bash
npm run keys:generate
```

Salida esperada:

```
SIGNING_PRIVATE_KEY=MC4CAQAwBQYDK2VwBCIEI...
SIGNING_PUBLIC_KEY=MCowBQYDK2VwAyEA...
```

Copia ambas líneas a tu archivo `.env`.

> ⚠️ **`SIGNING_PRIVATE_KEY` debe mantenerse secreta.** Nunca la incluyas en el repositorio ni la expongas en logs.  
> Si se compromete, genera un nuevo par de llaves y vuelve a firmar las inscripciones existentes.

### Verificación offline

Cualquier persona con la llave pública puede verificar un certificado sin acceder al sistema:

```bash
# Verificar con OpenSSL
echo -n "SS2604-A1B2C3D4-XYZ789|42|7|2026-04-15T10:30:00.000Z" > message.txt
echo "<SIGNING_PUBLIC_KEY_BASE64>" | base64 -d > pubkey.der
echo "<SIGNATURE_BASE64>" | base64 -d > signature.bin
openssl pkeyutl -verify -pubin -keyform DER -inkey pubkey.der \
  -in message.txt -sigfile signature.bin
```

### Rotación de llaves

Si necesitas rotar el par de llaves (por seguridad o porque la llave privada fue comprometida):

1. Genera un nuevo par: `npm run keys:generate`
2. Actualiza `SIGNING_PRIVATE_KEY` y `SIGNING_PUBLIC_KEY` en `.env` y en producción
3. Las inscripciones antiguas conservan su firma original (verificable con la llave pública anterior)
4. Las nuevas inscripciones usarán la nueva llave

---

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
3. Genera el par de llaves localmente: `npm run keys:generate`
4. Configura las variables de entorno en el dashboard de Vercel:
   - `POSTGRES_URL`
   - `AUTH_SECRET`
   - `SIGNING_PRIVATE_KEY`
   - `SIGNING_PUBLIC_KEY`

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
│   ├── scripts/           # Scripts de utilidad (generate-keys.ts)
│   └── utils/             # Utilidades (folio, códigos, signing, certificate)
└── public/                # Assets estáticos
```

## Licencia

MIT
