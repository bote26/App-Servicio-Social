import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Users
    const organizer = await prisma.user.upsert({
        where: { email: 'admin@tec.mx' },
        update: {},
        create: {
            email: 'admin@tec.mx',
            name: 'Organizer Admin',
            passwordHash,
            role: Role.ORGANIZADOR,
        },
    });

    const partner = await prisma.user.upsert({
        where: { email: 'partner@org.com' },
        update: {},
        create: {
            email: 'partner@org.com',
            name: 'Socio Formador 1',
            passwordHash,
            role: Role.SOCIOFORMADOR,
        },
    });

    const student1 = await prisma.user.upsert({
        where: { email: 'a00123456@tec.mx' },
        update: {},
        create: {
            email: 'a00123456@tec.mx',
            name: 'Juan Perez',
            matricula: 'A00123456',
            passwordHash,
            role: Role.ALUMNO,
        },
    });

    const student2 = await prisma.user.upsert({
        where: { email: 'a00987654@tec.mx' },
        update: {},
        create: {
            email: 'a00987654@tec.mx',
            name: 'Maria Lopez',
            matricula: 'A00987654',
            passwordHash,
            role: Role.ALUMNO,
        },
    });

    // Projects
    const projectsData = [
        {
            name: 'Reforestación Urbana',
            description: 'Platado de arboles en parques locales.',
            period: 'FEB-JUN 2024',
            capacity: 5,
            secretCode: 'TREE24',
            ownerId: partner.id,
        },
        {
            name: 'Asesoría Matemática',
            description: 'Apoyo a niños de primaria.',
            period: 'FEB-JUN 2024',
            capacity: 10,
            secretCode: 'MATH24',
            ownerId: partner.id,
        },
        {
            name: 'Banco de Alimentos',
            description: 'Clasificación de alimentos.',
            period: 'FEB-JUN 2024',
            capacity: 20,
            secretCode: 'FOOD24',
            ownerId: partner.id,
        },
        {
            name: 'Limpieza de Playas',
            description: 'Recolección de basura en la costa.',
            period: 'AGO-DIC 2024',
            capacity: 15,
            secretCode: 'BEACH24',
            ownerId: partner.id,
        },
        {
            name: 'Taller de Lectura',
            description: 'Fomento a la lectura en bibliotecas.',
            period: 'AGO-DIC 2024',
            capacity: 8,
            secretCode: 'READ24',
            ownerId: partner.id,
        }
    ];

    for (const p of projectsData) {
        await prisma.project.create({
            data: p
        });
    }

    console.log('Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
