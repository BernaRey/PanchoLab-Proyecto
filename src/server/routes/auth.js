import { Router } from 'express';
import { login, logout, me } from '../controllers/authController.js';
import { autenticado } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', autenticado, me);

export default router;
