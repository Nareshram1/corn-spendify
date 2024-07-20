const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const { put } =require("@vercel/blob")
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function backupTable(tableName) {
  const d = new Date()
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    return;
  }
  const { url } = await put(`./backup/${d.getDate()}-${d.getMonth()}-${d.getFullYear()}/${tableName}.json`, JSON.stringify(data, null, 2), { access: 'public' });
  console.log(url);
  console.log(`Backup for ${tableName} completed.`);
}

async function main() {

  const tables = process.env.SUPABASE_TABLES.split(',');
  for (const table of tables) {
      console.log(`Backup for ${table} started...`)
      await backupTable(table);
  }
}
main();
