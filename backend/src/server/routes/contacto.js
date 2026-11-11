import { Router } from 'express';
import { prepararMensajeWhatsApp } from '../controllers/contactoController.js';

const router = Router();

router.post('/', prepararMensajeWhatsApp);

export default router;
