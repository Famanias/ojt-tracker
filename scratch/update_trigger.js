const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local file to find connection string
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const connectionStringLine = envContent.split('\n').find(line => line.trim().startsWith('DATABASE_CONNECTION_STRING='));

if (!connectionStringLine) {
  console.error('DATABASE_CONNECTION_STRING not found in .env.local');
  process.exit(1);
}

const connectionString = connectionStringLine.split('=')[1].trim();

const sql = `
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role     public.user_role := 'ojt';
  v_role_str text;
  v_org_id   uuid;
  v_org_id_str text;
begin
  v_role_str := new.raw_user_meta_data->>'role';
  if v_role_str in ('ojt', 'supervisor', 'admin') then
    v_role := v_role_str::public.user_role;
  end if;

  v_org_id_str := new.raw_user_meta_data->>'org_id';
  if v_org_id_str is not null and v_org_id_str != '' then
    v_org_id := v_org_id_str::uuid;
  end if;

  insert into public.profiles (id, full_name, email, role, org_id, avatar_url)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    new.email,
    v_role,
    v_org_id,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do update
    set
      full_name  = coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), public.profiles.full_name),
      email      = excluded.email,
      avatar_url = coalesce(coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), public.profiles.avatar_url),
      updated_at = now();

  return new;
end;
$$ language plpgsql security definer set search_path = public, auth;
`;

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Supabase DB.');
    await client.query(sql);
    console.log('Successfully updated handle_new_user() trigger function!');
  } catch (err) {
    console.error('Error running SQL:', err);
  } finally {
    await client.end();
  }
}

main();
