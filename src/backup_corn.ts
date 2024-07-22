import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { put } from '@vercel/blob';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

async function backupTable(tableName: string): Promise<void> {
  const d = new Date();
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    return;
  }
  const filePath = `./backup/${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}/${tableName}.json`;
  const { url } = await put(filePath, JSON.stringify(data, null, 2), { access: 'public' });
  console.log(url);
  console.log(`Backup for ${tableName} completed.`);
}

async function main(): Promise<void> {
  const tables = (process.env.SUPABASE_TABLES as string).split(',');
  for (const table of tables) {
    console.log(`Backup for ${table} started...`);
    await backupTable(table);
  }
}
app.get('/', async (req: Request, res: Response) => {
  try {
    res.status(200).send('Server is Alive.');
  } catch (error) {
    console.error('Issues in server:', error);
    res.status(500).send('Issues in server.');
  }
});
app.get('/backup', async (req: Request, res: Response) => {
  try {
    await main();
    res.status(200).send('Backup completed successfully.');
  } catch (error) {
    console.error('Error during backup:', error);
    res.status(500).send('Backup failed.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
