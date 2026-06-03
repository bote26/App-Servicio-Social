CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "codigos_proyecto" (
	"id" serial PRIMARY KEY NOT NULL,
	"proyecto_id" integer NOT NULL,
	"codigo" varchar(50) NOT NULL,
	"codigo_hash" varchar(255) NOT NULL,
	"usado" boolean DEFAULT false NOT NULL,
	"usado_por_alumno_id" integer,
	"usado_en" timestamp,
	"expira_en" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_proyecto_codigo" UNIQUE("proyecto_id","codigo")
);
--> statement-breakpoint
CREATE TABLE "eventos_feria" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(150) NOT NULL,
	"fecha_evento" date NOT NULL,
	"hora_inicio" time,
	"hora_fin" time,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inscripciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"alumno_id" integer NOT NULL,
	"proyecto_id" integer NOT NULL,
	"codigo_id" integer,
	"periodo" varchar(100) NOT NULL,
	"folio" varchar(40) NOT NULL,
	"fecha_inscripcion" timestamp DEFAULT now() NOT NULL,
	"confirmacion_sistema" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inscripciones_folio_unique" UNIQUE("folio"),
	CONSTRAINT "unique_alumno_periodo" UNIQUE("alumno_id","periodo")
);
--> statement-breakpoint
CREATE TABLE "pre_registro_feria" (
	"id" serial PRIMARY KEY NOT NULL,
	"alumno_id" integer NOT NULL,
	"evento_feria_id" integer NOT NULL,
	"horario" varchar(50) NOT NULL,
	"estado" varchar(20) DEFAULT 'registered' NOT NULL,
	"validado_por_id" integer,
	"fecha_validacion" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_alumno_evento" UNIQUE("alumno_id","evento_feria_id")
);
--> statement-breakpoint
CREATE TABLE "proyectos" (
	"id" serial PRIMARY KEY NOT NULL,
	"clave_proyecto" varchar(30) NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"organizacion" varchar(150),
	"descripcion" text,
	"objetivo" text,
	"actividades" text,
	"periodo" varchar(100) NOT NULL,
	"evento_feria_id" integer,
	"horas" integer NOT NULL,
	"carrera" varchar(100),
	"modalidad" varchar(20),
	"ubicacion" text,
	"horario_proyecto" varchar(100),
	"cupo_total" integer NOT NULL,
	"cupo_disponible" integer NOT NULL,
	"socioformador_id" integer,
	"activo" boolean DEFAULT true NOT NULL,
	"logo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "proyectos_clave_proyecto_unique" UNIQUE("clave_proyecto")
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_completo" varchar(150),
	"correo_institucional" varchar(120) NOT NULL,
	"matricula" varchar(20),
	"numero_personal" varchar(30),
	"correo_alternativo" varchar(120),
	"password_hash" text NOT NULL,
	"rol" varchar(20) DEFAULT 'student' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "usuarios_correo_institucional_unique" UNIQUE("correo_institucional"),
	CONSTRAINT "usuarios_matricula_unique" UNIQUE("matricula")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_usuarios_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codigos_proyecto" ADD CONSTRAINT "codigos_proyecto_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "codigos_proyecto" ADD CONSTRAINT "codigos_proyecto_usado_por_alumno_id_usuarios_id_fk" FOREIGN KEY ("usado_por_alumno_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_alumno_id_usuarios_id_fk" FOREIGN KEY ("alumno_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_codigo_id_codigos_proyecto_id_fk" FOREIGN KEY ("codigo_id") REFERENCES "public"."codigos_proyecto"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pre_registro_feria" ADD CONSTRAINT "pre_registro_feria_alumno_id_usuarios_id_fk" FOREIGN KEY ("alumno_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pre_registro_feria" ADD CONSTRAINT "pre_registro_feria_evento_feria_id_eventos_feria_id_fk" FOREIGN KEY ("evento_feria_id") REFERENCES "public"."eventos_feria"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pre_registro_feria" ADD CONSTRAINT "pre_registro_feria_validado_por_id_usuarios_id_fk" FOREIGN KEY ("validado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_evento_feria_id_eventos_feria_id_fk" FOREIGN KEY ("evento_feria_id") REFERENCES "public"."eventos_feria"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_socioformador_id_usuarios_id_fk" FOREIGN KEY ("socioformador_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;