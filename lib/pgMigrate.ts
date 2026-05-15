import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

export async function getMigrationFiles() {
  const migrationsFolder = path.join(process.cwd(), 'supabase', 'migrations');
  if (!fs.existsSync(migrationsFolder)) {
    return [];
  }

  return fs
    .readdirSync(migrationsFolder)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL no está configurado');
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const migrations = await getMigrationFiles();
    for (const fileName of migrations) {
      const filePath = path.join(process.cwd(), 'supabase', 'migrations', fileName);
      const sql = fs.readFileSync(filePath, 'utf-8');
      await client.query(sql);
    }
  } finally {
    await client.end();
  }
}
