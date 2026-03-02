import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  date,
  time,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// =============================================================================
// USUARIOS (Users)
// =============================================================================
export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  nombreCompleto: varchar('nombre_completo', { length: 150 }),
  correoInstitucional: varchar('correo_institucional', { length: 120 }).notNull().unique(),
  matricula: varchar('matricula', { length: 20 }).unique(),
  numeroPersonal: varchar('numero_personal', { length: 30 }),
  correoAlternativo: varchar('correo_alternativo', { length: 120 }),
  passwordHash: text('password_hash').notNull(),
  rol: varchar('rol', { length: 20 }).notNull().default('student'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// =============================================================================
// EVENTOS FERIA (Fair Events)
// =============================================================================
export const eventosFeria = pgTable('eventos_feria', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 150 }).notNull(),
  fechaEvento: date('fecha_evento').notNull(),
  horaInicio: time('hora_inicio'),
  horaFin: time('hora_fin'),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// =============================================================================
// PRE-REGISTRO FERIA (Fair Pre-Registration)
// =============================================================================
export const preRegistroFeria = pgTable('pre_registro_feria', {
  id: serial('id').primaryKey(),
  alumnoId: integer('alumno_id').notNull().references(() => usuarios.id),
  eventoFeriaId: integer('evento_feria_id').notNull().references(() => eventosFeria.id),
  horario: varchar('horario', { length: 50 }).notNull(),
  estado: varchar('estado', { length: 20 }).notNull().default('registered'),
  validadoPorId: integer('validado_por_id').references(() => usuarios.id),
  fechaValidacion: timestamp('fecha_validacion'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  unique('unique_alumno_evento').on(table.alumnoId, table.eventoFeriaId),
]);

// =============================================================================
// PROYECTOS (Projects)
// =============================================================================
export const proyectos = pgTable('proyectos', {
  id: serial('id').primaryKey(),
  claveProyecto: varchar('clave_proyecto', { length: 30 }).notNull().unique(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  organizacion: varchar('organizacion', { length: 150 }),
  descripcion: text('descripcion'),
  objetivo: text('objetivo'),
  actividades: text('actividades'),
  periodo: varchar('periodo', { length: 100 }).notNull(),
  eventoFeriaId: integer('evento_feria_id').references(() => eventosFeria.id),
  horas: integer('horas').notNull(),
  carrera: varchar('carrera', { length: 100 }),
  modalidad: varchar('modalidad', { length: 20 }),
  ubicacion: text('ubicacion'),
  horarioProyecto: varchar('horario_proyecto', { length: 100 }),
  cupoTotal: integer('cupo_total').notNull(),
  cupoDisponible: integer('cupo_disponible').notNull(),
  socioformadorId: integer('socioformador_id').references(() => usuarios.id),
  activo: boolean('activo').notNull().default(true),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// =============================================================================
// CODIGOS PROYECTO (Project Codes for Attendance Validation)
// =============================================================================
export const codigosProyecto = pgTable('codigos_proyecto', {
  id: serial('id').primaryKey(),
  proyectoId: integer('proyecto_id').notNull().references(() => proyectos.id),
  codigo: varchar('codigo', { length: 50 }).notNull(),
  codigoHash: varchar('codigo_hash', { length: 255 }).notNull(),
  usado: boolean('usado').notNull().default(false),
  usadoPorAlumnoId: integer('usado_por_alumno_id').references(() => usuarios.id),
  usadoEn: timestamp('usado_en'),
  expiraEn: timestamp('expira_en'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  unique('unique_proyecto_codigo').on(table.proyectoId, table.codigo),
]);

// =============================================================================
// INSCRIPCIONES (Enrollments)
// =============================================================================
export const inscripciones = pgTable('inscripciones', {
  id: serial('id').primaryKey(),
  alumnoId: integer('alumno_id').notNull().references(() => usuarios.id),
  proyectoId: integer('proyecto_id').notNull().references(() => proyectos.id),
  codigoId: integer('codigo_id').references(() => codigosProyecto.id),
  periodo: varchar('periodo', { length: 100 }).notNull(),
  folio: varchar('folio', { length: 40 }).notNull().unique(),
  fechaInscripcion: timestamp('fecha_inscripcion').notNull().defaultNow(),
  confirmacionSistema: text('confirmacion_sistema'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  unique('unique_alumno_periodo').on(table.alumnoId, table.periodo),
]);

// =============================================================================
// ACTIVITY LOGS (Keep existing functionality)
// =============================================================================
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => usuarios.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

// =============================================================================
// RELATIONS
// =============================================================================

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  preRegistros: many(preRegistroFeria, { relationName: 'alumno' }),
  inscripciones: many(inscripciones),
  activityLogs: many(activityLogs),
  proyectosAsignados: many(proyectos),
  validaciones: many(preRegistroFeria, { relationName: 'validador' }),
  codigosUsados: many(codigosProyecto),
}));

export const eventosFeriaRelations = relations(eventosFeria, ({ many }) => ({
  preRegistros: many(preRegistroFeria),
  proyectos: many(proyectos),
}));

export const preRegistroFeriaRelations = relations(preRegistroFeria, ({ one }) => ({
  alumno: one(usuarios, {
    fields: [preRegistroFeria.alumnoId],
    references: [usuarios.id],
    relationName: 'alumno',
  }),
  eventoFeria: one(eventosFeria, {
    fields: [preRegistroFeria.eventoFeriaId],
    references: [eventosFeria.id],
  }),
  validador: one(usuarios, {
    fields: [preRegistroFeria.validadoPorId],
    references: [usuarios.id],
    relationName: 'validador',
  }),
}));

export const proyectosRelations = relations(proyectos, ({ one, many }) => ({
  eventoFeria: one(eventosFeria, {
    fields: [proyectos.eventoFeriaId],
    references: [eventosFeria.id],
  }),
  socioformador: one(usuarios, {
    fields: [proyectos.socioformadorId],
    references: [usuarios.id],
  }),
  codigos: many(codigosProyecto),
  inscripciones: many(inscripciones),
}));

export const codigosProyectoRelations = relations(codigosProyecto, ({ one }) => ({
  proyecto: one(proyectos, {
    fields: [codigosProyecto.proyectoId],
    references: [proyectos.id],
  }),
  usadoPor: one(usuarios, {
    fields: [codigosProyecto.usadoPorAlumnoId],
    references: [usuarios.id],
  }),
}));

export const inscripcionesRelations = relations(inscripciones, ({ one }) => ({
  alumno: one(usuarios, {
    fields: [inscripciones.alumnoId],
    references: [usuarios.id],
  }),
  proyecto: one(proyectos, {
    fields: [inscripciones.proyectoId],
    references: [proyectos.id],
  }),
  codigo: one(codigosProyecto, {
    fields: [inscripciones.codigoId],
    references: [codigosProyecto.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(usuarios, {
    fields: [activityLogs.userId],
    references: [usuarios.id],
  }),
}));

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Usuario = typeof usuarios.$inferSelect;
export type NewUsuario = typeof usuarios.$inferInsert;

export type EventoFeria = typeof eventosFeria.$inferSelect;
export type NewEventoFeria = typeof eventosFeria.$inferInsert;

export type PreRegistroFeria = typeof preRegistroFeria.$inferSelect;
export type NewPreRegistroFeria = typeof preRegistroFeria.$inferInsert;

export type Proyecto = typeof proyectos.$inferSelect;
export type NewProyecto = typeof proyectos.$inferInsert;

export type CodigoProyecto = typeof codigosProyecto.$inferSelect;
export type NewCodigoProyecto = typeof codigosProyecto.$inferInsert;

export type Inscripcion = typeof inscripciones.$inferSelect;
export type NewInscripcion = typeof inscripciones.$inferInsert;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

// =============================================================================
// ENUMS
// =============================================================================

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
  SOCIOFORMADOR = 'socioformador',
  STAFF = 'staff',
}

export enum PreRegistroEstado {
  REGISTERED = 'registered',
  VALIDATED = 'validated',
}

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  FAIR_REGISTRATION = 'FAIR_REGISTRATION',
  PHYSICAL_VALIDATION = 'PHYSICAL_VALIDATION',
  PROJECT_ENROLLMENT = 'PROJECT_ENROLLMENT',
  CODE_USED = 'CODE_USED',
}
