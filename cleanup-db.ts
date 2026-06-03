import { db } from './lib/db/drizzle';
import { sql } from 'drizzle-orm';

async function cleanup() {
    try {
        console.log('Dropping activity_logs and other team-related tables to ensure clean state...');
        await db.execute(sql`DROP TABLE IF EXISTS "activity_logs" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "invitations" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "team_members" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "teams" CASCADE`);

        console.log('Database cleanup successful. Ready for drizzle-kit push.');
    } catch (error) {
        console.error('Database cleanup failed:', error);
    } finally {
        process.exit(0);
    }
}

cleanup();
