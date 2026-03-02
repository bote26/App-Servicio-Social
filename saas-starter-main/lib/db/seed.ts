import { db } from './drizzle';
import {
  usuarios,
  eventosFeria,
  proyectos,
  codigosProyecto,
  UserRole,
} from './schema';
import { hashPassword } from '../auth/session';
import { generateCodesWithHashes } from '../utils/codes';

async function seed() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const adminPasswordHash = await hashPassword('admin123');
  const [admin] = await db
    .insert(usuarios)
    .values({
      nombreCompleto: 'Administrador Sistema',
      correoInstitucional: 'admin@tec.mx',
      passwordHash: adminPasswordHash,
      rol: UserRole.ADMIN,
    })
    .onConflictDoNothing()
    .returning();
  console.log('✅ Admin user created:', admin?.correoInstitucional || 'already exists');

  // Create Staff User
  const staffPasswordHash = await hashPassword('staff123');
  const [staff] = await db
    .insert(usuarios)
    .values({
      nombreCompleto: 'Personal Validador',
      correoInstitucional: 'staff@tec.mx',
      passwordHash: staffPasswordHash,
      rol: UserRole.STAFF,
    })
    .onConflictDoNothing()
    .returning();
  console.log('✅ Staff user created:', staff?.correoInstitucional || 'already exists');

  // Create Socioformador User
  const socioPasswordHash = await hashPassword('socio123');
  const [socioformador] = await db
    .insert(usuarios)
    .values({
      nombreCompleto: 'María García López',
      correoInstitucional: 'socioformador@clima.org.mx',
      passwordHash: socioPasswordHash,
      rol: UserRole.SOCIOFORMADOR,
    })
    .onConflictDoNothing()
    .returning();
  console.log('✅ Socioformador user created:', socioformador?.correoInstitucional || 'already exists');

  // Create Test Student
  const studentPasswordHash = await hashPassword('student123');
  const [student] = await db
    .insert(usuarios)
    .values({
      nombreCompleto: 'Juan Pérez Rodríguez',
      correoInstitucional: 'A01234567@tec.mx',
      matricula: 'A01234567',
      numeroPersonal: '1234567890',
      correoAlternativo: 'juan.perez@gmail.com',
      passwordHash: studentPasswordHash,
      rol: UserRole.STUDENT,
    })
    .onConflictDoNothing()
    .returning();
  console.log('✅ Student user created:', student?.correoInstitucional || 'already exists');

  // Create Fair Event
  const [evento] = await db
    .insert(eventosFeria)
    .values({
      nombre: 'Feria de Servicio Social Febrero-Junio 2026',
      fechaEvento: '2026-03-15',
      horaInicio: '09:00',
      horaFin: '17:00',
      activo: true,
    })
    .onConflictDoNothing()
    .returning();
  console.log('✅ Fair event created:', evento?.nombre || 'already exists');

  // Create Projects
  const projectsData = [
    {
      claveProyecto: 'WA1065-101',
      titulo: 'Apoyo en el desarrollo de habilidades de vida independiente para personas con Autismo',
      organizacion: 'Clínica Mexicana de Autismo y Alteraciones del Desarrollo A.C.',
      descripcion: 'Programa de intervención individualizada para personas con TEA.',
      objetivo: 'Lograr el máximo desarrollo y la inclusión de personas con TEA, dando intervención individualizada.',
      actividades: 'Intervención en personas con TEA.\nAcompañamiento en el diseño de programas de independencia.',
      periodo: 'Febrero - Junio 2026',
      eventoFeriaId: evento?.id,
      horas: 60,
      carrera: 'LPS',
      modalidad: 'Presencial',
      ubicacion: 'Van Dick 66, Colonia Santa María Nonoalco Alcaldía Benito Juárez CDMX',
      horarioProyecto: 'Lunes a viernes de 9:00 a 14:00 hrs.',
      cupoTotal: 5,
      cupoDisponible: 5,
      socioformadorId: socioformador?.id,
      logoUrl: 'https://clima.org.mx/wp-content/uploads/2021/03/logo-clima.png',
    },
    {
      claveProyecto: 'WA1067-404',
      titulo: 'Programa de Mejora Continua Primaria Níger',
      organizacion: 'Escuela Primaria Níger',
      descripcion: 'Fortalecer los procesos de enseñanza-aprendizaje y la infraestructura escolar.',
      objetivo: 'Fortalecer los procesos de enseñanza-aprendizaje y la infraestructura escolar.',
      actividades: 'Apoyo en regularización académica.\nMantenimiento de áreas comunes.\nTalleres extraescolares.',
      periodo: 'Febrero - Junio 2026',
      eventoFeriaId: evento?.id,
      horas: 120,
      carrera: 'ICT, IDM, IRS, ITC',
      modalidad: 'Presencial',
      ubicacion: 'Calle Falsa 123, Col. Centro',
      horarioProyecto: 'Lunes a jueves de 8:00 a 13:00 hrs.',
      cupoTotal: 10,
      cupoDisponible: 10,
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Logo_SEP_2018.png',
    },
    {
      claveProyecto: 'WA1067-403',
      titulo: 'Apoyando mi aprendizaje y fortalecer mi lectura',
      organizacion: 'Escuela Primaria de tiempo completo Somalia',
      descripcion: 'Mejorar el nivel de comprensión lectora en estudiantes de primaria.',
      objetivo: 'Mejorar el nivel de comprensión lectora en estudiantes de primaria.',
      actividades: 'Círculos de lectura.\nActividades de ortografía y redacción.\nDinámicas grupales.',
      periodo: 'Febrero - Junio 2026',
      eventoFeriaId: evento?.id,
      horas: 120,
      carrera: 'Todas',
      modalidad: 'Presencial',
      ubicacion: 'Av. Somalia 456, Col. Progreso',
      horarioProyecto: 'Lunes a viernes de 14:00 a 18:00 hrs.',
      cupoTotal: 8,
      cupoDisponible: 8,
    },
  ];

  for (const projectData of projectsData) {
    const [project] = await db
      .insert(proyectos)
      .values(projectData)
      .onConflictDoNothing()
      .returning();

    if (project) {
      console.log('✅ Project created:', project.claveProyecto);

      // Generate codes for each project
      const codes = generateCodesWithHashes(project.cupoTotal);
      for (const code of codes) {
        await db
          .insert(codigosProyecto)
          .values({
            proyectoId: project.id,
            codigo: code.codigo,
            codigoHash: code.codigoHash,
          })
          .onConflictDoNothing();
      }
      console.log(`   📝 Generated ${codes.length} codes for project ${project.claveProyecto}`);
    }
  }

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('Test accounts:');
  console.log('─────────────────────────────────────');
  console.log('Admin:         admin@tec.mx / admin123');
  console.log('Staff:         staff@tec.mx / staff123');
  console.log('Socioformador: socioformador@clima.org.mx / socio123');
  console.log('Student:       A01234567@tec.mx / student123');
  console.log('─────────────────────────────────────\n');

  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
