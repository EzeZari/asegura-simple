import { Router } from 'express';
import { prisma } from '../config/db';
import { verificarToken } from '../middlewares/auth.middleware';
// 🔥 IMPORTAMOS EL CONTROLADOR NUEVO (EL CEREBRO)
import { getDashboardStats } from '../controllers/dashboard.controller'; 

const router = Router();

// =======================================================
// RUTA 1: ESTADÍSTICAS BÁSICAS DE INICIO (dashboard/KPIs)
// =======================================================
// 🔥 Ahora delegamos todo el trabajo pesado al controlador
router.get('/stats', verificarToken, getDashboardStats);


// =======================================================
// RUTA 2: OBTENER COMUNICADO GLOBAL (BANNER PARA USUARIOS)
// =======================================================
router.get('/comunicado', verificarToken, async (req, res) => {
  try {
    const comunicado = await prisma.comunicadoAdmin.findUnique({ where: { id: 1 } });
    res.json(comunicado || { activo: false, mensaje: "" });
  } catch (error) {
    console.error("Error al obtener comunicado:", error);
    res.status(500).json({ error: 'Error al obtener comunicado' });
  }
});

export default router;