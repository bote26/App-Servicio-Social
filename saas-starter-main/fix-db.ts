import { db } from './lib/db/drizzle';
import { sql } from 'drizzle-orm';

async function fix() {
    try {
        console.log('Dropping constraints and column from activity_logs...');
        await db.execute(sql`ALTER TABLE "activity_logs" DROP CONSTRAINT IF EXISTS "activity_logs_team_id_teams_id_fk"`);
        await db.execute(sql`ALTER TABLE "activity_logs" DROP COLUMN IF EXISTS "team_id"`);

        console.log('Dropping team-related tables...');
        await db.execute(sql`DROP TABLE IF EXISTS "invitations" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "team_members" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "teams" CASCADE`);

        console.log('Database sync successful.');
    } catch (error) {
        console.error('Database sync failed:', error);
    } finally {
        process.exit(0);
    }
}

fix();
