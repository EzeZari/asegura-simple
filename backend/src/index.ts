import 'dotenv/config'; 
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const app = express();
const port = 3001;

// 1. Leemos la URL de tu .env
const connectionString = process.env.DATABASE_URL;

// 2. Configuramos el adaptador oficial de Postgres que exige Prisma ahora
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola Ezequiel! El backend de AseguraSimple está funcionando 🚀');
});

// Ruta de prueba
app.get('/api/asegurados', async (req: Request, res: Response) => {
  try {
    const asegurados = await prisma.asegurado.findMany();
    res.json(asegurados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un error al buscar los asegurados' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});