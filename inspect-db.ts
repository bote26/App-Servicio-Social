import { db } from './lib/db/drizzle';
import { sql } from 'drizzle-orm';
import fs from 'fs';

async function inspect() {
    try {
        const tables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        const columns = await db.execute(sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'activity_logs'`);
        const constraints = await db.execute(sql`SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'activity_logs'`);

        const output = {
            tables,
            columns,
            constraints
        };

        fs.writeFileSync('db-schema.json', JSON.stringify(output, null, 2), 'utf8');
        console.log('Schema written to db-schema.json');
    } catch (error) {
        console.error('Inspection failed:', error);
    } finally {
        process.exit(0);
    }
}

inspect();
