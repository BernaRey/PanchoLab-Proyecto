import { Router } from 'express';
import { actualizarEstado, obtenerEstado } from '../controllers/tiendaController.js';
import { autenticado, soloAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/estado', obtenerEstado);
router.patch('/estado', autenticado, soloAdmin, actualizarEstado);

export default router;
