import { Router } from 'express';
import { atenderChat } from '../controllers/chatController.js';

const router = Router();

router.post('/', atenderChat);

export default router;
