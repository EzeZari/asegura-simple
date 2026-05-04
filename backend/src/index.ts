import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import 'dotenv/config'; // Esto asegura que Node lea tu variable DATABASE_URL del archivo .env
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// 1. Traemos la URL de tu base de datos
const connectionString = process.env.DATABASE_URL;

// 2. Creamos el adaptador que exige Prisma 7
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 3. Inicializamos Prisma pasándole el adaptador
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());


// ==========================================
// RUTA 1: REGISTRO DE USUARIO
// ==========================================
app.post('/api/auth/register', async (req, res): Promise<any> => {
  const { nombre, email, telefono, password } = req.body;

  try {
    // 1. Verificar si el email ya existe en la base de datos
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
    }

    // 2. Encriptar la contraseña (le damos 10 "vueltas" de seguridad)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Guardar el nuevo usuario en la base de datos
    const newUser = await prisma.user.create({
      data: {
        nombre,
        email,
        telefono,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'Cuenta creada exitosamente', userId: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
  }
});

// ==========================================
// RUTA 2: INICIO DE SESIÓN (LOGIN)
// ==========================================
app.post('/api/auth/login', async (req, res): Promise<any> => {
  const { email, password } = req.body;

  try {
    // 1. Buscar si el usuario existe por el email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Credenciales incorrectas. Verificá tu email o contraseña.' });
    }

    // 2. Comparar la contraseña ingresada con la encriptada en la base de datos
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales incorrectas. Verificá tu email o contraseña.' });
    }

    // 3. Login exitoso
    res.status(200).json({ 
      message: 'Ingreso exitoso', 
      user: { id: user.id, nombre: user.nombre, email: user.email } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});