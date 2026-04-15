import { Router } from 'express';
import { createUser, getOrCreateDemoUser } from '../controllers/userController.js';

const router = Router();

router.post('/', createUser);
router.get('/demo', getOrCreateDemoUser);

export default router;