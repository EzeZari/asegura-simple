import { Router } from 'express';
import * as siniestrosController from '../controllers/siniestros.controller';
import { verificarToken } from '../middlewares/auth.middleware'; // 🔥 Importamos el Auth
import { verificarSuscripcionActiva } from '../middlewares/suscripcion.middleware'; // 🔥 Importamos el Patovica
import { verificarRol } from '../middlewares/role.middleware'; // 🔥 Importamos el Guardia de Roles

const router = Router();

// 🟢 LECTURA: Pasan los GET (Protegidos por Token y Suscripción)
router.get('/', verificarToken, verificarSuscripcionActiva, siniestrosController.getSiniestros);
router.get('/:id', verificarToken, verificarSuscripcionActiva, siniestrosController.getSiniestroById);

// 🔴 ESCRITURA: Se bloquean los POST/PUT/DELETE si es Vendedor (VIEWER)
router.post('/', verificarToken, verificarSuscripcionActiva, verificarRol(['DUENO', 'PRODUCTOR']), siniestrosController.createSiniestro);
router.post('/:id/notas', verificarToken, verificarSuscripcionActiva, verificarRol(['DUENO', 'PRODUCTOR']), siniestrosController.agregarNota);
router.put('/:id', verificarToken, verificarSuscripcionActiva, verificarRol(['DUENO', 'PRODUCTOR']), siniestrosController.updateSiniestro);
router.delete('/:id', verificarToken, verificarSuscripcionActiva, verificarRol(['DUENO', 'PRODUCTOR']), siniestrosController.deleteSiniestro);

// 🔥 NUEVAS RUTAS DE CONSULTA EXTERNA
// Generar el link lo hace el Productor, así que requiere rol autorizado
router.post('/:id/generar-link', verificarToken, verificarSuscripcionActiva, verificarRol(['DUENO', 'PRODUCTOR']), siniestrosController.obtenerOGenerarLink); 

// 🔓 API PÚBLICA (USADA POR EL CLIENTE FINAL) - NO LLEVA MIDDLEWARES
router.get('/publico/consulta/:token', siniestrosController.getSiniestroPublicoPorToken); 

export default router;