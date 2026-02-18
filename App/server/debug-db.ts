import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    try {
        console.log('Attempting to connect to database...');
        await prisma.$connect();
        console.log('Successfully connected to database!');
    } catch (e) {
        console.error('Failed to connect to database:');
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
