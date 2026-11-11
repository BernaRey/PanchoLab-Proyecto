import { Router } from 'express';
import {
  listar, obtener, crear, actualizar, eliminar,
} from '../controllers/productController.js';
import { autenticado, soloAdmin } from '../middleware/auth.js';
import { validarId, validarProducto } from '../middleware/validate.js';

const router = Router();

router.get('/', listar);
router.get('/:id', validarId, obtener);
router.post('/', autenticado, soloAdmin, validarProducto, crear);
router.put('/:id', autenticado, soloAdmin, validarId, validarProducto, actualizar);
router.delete('/:id', autenticado, soloAdmin, validarId, eliminar);

export default router;
