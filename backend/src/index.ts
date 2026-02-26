import express, { Request, Response } from 'express';

const app = express();
const port = 3001;

app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola Ezequiel! El backend de AseguraSimple está funcionando 🚀');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});