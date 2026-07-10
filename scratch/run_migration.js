const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  const connStringMatch = envFile.match(/DATABASE_CONNECTION_STRING=(.*)/);
  if (!connStringMatch) {
    throw new Error('DATABASE_CONNECTION_STRING not found in .env.local');
  }
  const connectionString = connStringMatch[1].trim();

  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to Database.');

  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const files = [
    '20260708010000_update_profiles_select_policy.sql',
    '20260708020000_update_kanban_personal_mode.sql'
  ];

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`Applying migration: ${file}...`);
      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
      console.log(`Successfully applied: ${file}`);
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  }

  await client.end();
  console.log('Done.');
}

main().catch(console.error);
