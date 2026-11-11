import { Router } from 'express';
import { confirmarPedido } from '../controllers/checkoutController.js';

const router = Router();

router.post('/', confirmarPedido);

export default router;
