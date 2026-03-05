import express from 'express';
import { validateRegistration } from '../middleware.js';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', login);

export default router;
