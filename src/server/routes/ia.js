import { Router } from 'express';
import { recomendarSabor } from '../controllers/iaController.js';

const router = Router();

router.post('/recomendar', recomendarSabor);

export default router;
