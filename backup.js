const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function backupTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    return;
  }
  fs.writeFileSync(`./backup/${tableName}.json`, JSON.stringify(data, null, 2));
  console.log(`Backup for ${tableName} completed.`);
}

async function main() {
  const tables = ['expenses', 'categories', 'lendings', 'borrowings'];
  for (const table of tables) {
    await backupTable(table);
  }
}
main();
