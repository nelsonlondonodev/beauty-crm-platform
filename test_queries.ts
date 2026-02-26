import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key.trim()] = val.trim();
  return acc;
}, {} as Record<string, string>);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: appointments, error: e1 } = await supabase.from('appointments').select('id, created_at, servicio, client:clientes_fidelizacion(nombre)').order('created_at', { ascending: false }).limit(2);
  console.log('Appointments:', appointments, e1);

  const { data: clients, error: e2 } = await supabase.from('clientes_fidelizacion').select('id, created_at, nombre').order('created_at', { ascending: false }).limit(2);
  console.log('Clients:', clients, e2);

  const { data: facturas, error: e3 } = await supabase.from('facturas').select('id, fecha_venta, total').order('fecha_venta', { ascending: false }).limit(2);
  console.log('Facturas:', facturas, e3);

  const { data: bonos, error: e4 } = await supabase.from('bonos').select('id, fecha_canje, client:clientes_fidelizacion(nombre), tipo').not('fecha_canje', 'is', null).order('fecha_canje', { ascending: false }).limit(2);
  console.log('Bonos:', bonos, e4);
}
test();
