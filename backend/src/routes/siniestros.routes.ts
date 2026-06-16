import { Router } from 'express';
import * as siniestrosController from '../controllers/siniestros.controller';
import { verificarToken } from '../middlewares/auth.middleware'; // 🔥 Importamos el Auth
import { verificarSuscripcionActiva } from '../middlewares/suscripcion.middleware'; // 🔥 Importamos el Patovica

const router = Router();

// 🛡️ RUTAS ESTÁNDAR DE GESTIÓN PRIVADA (Protegidas)
// Pasan los GET, se bloquean los POST/PUT/DELETE si no pagó.
router.get('/', verificarToken, verificarSuscripcionActiva, siniestrosController.getSiniestros);
router.get('/:id', verificarToken, verificarSuscripcionActiva, siniestrosController.getSiniestroById);
router.post('/', verificarToken, verificarSuscripcionActiva, siniestrosController.createSiniestro);
router.post('/:id/notas', verificarToken, verificarSuscripcionActiva, siniestrosController.agregarNota);
router.put('/:id', verificarToken, verificarSuscripcionActiva, siniestrosController.updateSiniestro);
router.delete('/:id', verificarToken, verificarSuscripcionActiva, siniestrosController.deleteSiniestro);

// 🔥 NUEVAS RUTAS DE CONSULTA EXTERNA
// Generar el link lo hace el Productor, así que requiere suscripción y token
router.post('/:id/generar-link', verificarToken, verificarSuscripcionActiva, siniestrosController.obtenerOGenerarLink); 

// 🔓 API PÚBLICA (USADA POR EL CLIENTE FINAL) - NO LLEVA MIDDLEWARES
router.get('/publico/consulta/:token', siniestrosController.getSiniestroPublicoPorToken); 

export default router;