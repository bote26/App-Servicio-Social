ALTER TABLE "inscripciones" DROP CONSTRAINT "unique_alumno_periodo";--> statement-breakpoint
ALTER TABLE "inscripciones" ADD COLUMN "tipo_proyecto" varchar(20) DEFAULT 'General' NOT NULL;--> statement-breakpoint
ALTER TABLE "proyectos" ADD COLUMN "tipo_proyecto" varchar(20);--> statement-breakpoint
ALTER TABLE "inscripciones" ADD CONSTRAINT "unique_alumno_periodo_tipo" UNIQUE("alumno_id","periodo","tipo_proyecto");