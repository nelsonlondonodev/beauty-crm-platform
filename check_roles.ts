import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const env = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key.trim()] = val.trim();
  return acc;
}, {} as Record<string, string>);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const adminUid = '9fb857ba-165b-4e29-ba32-2bbb90f82d7a';

  // Check roles
  console.log("Checking user_roles for admin UID:", adminUid);
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', adminUid);

  console.log("Roles:", roleData, roleError);

  // If not admin, let's make it admin
  if (!roleData || roleData.length === 0) {
      console.log("Assigning 'admin' role to", adminUid);
      const { data: insertData, error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: adminUid, role: 'admin' })
          .select();
      console.log("Insert result:", insertData, insertError);
  }

  // Check empleados
  console.log("Checking empleados for admin UID:", adminUid);
  const { data: empData, error: empError } = await supabase
    .from('empleados')
    .select('*')
    .or(`email.eq.contacto@narbossalon.com`);
  console.log("Empleados:", empData, empError);
}

run();
