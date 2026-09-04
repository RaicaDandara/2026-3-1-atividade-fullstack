import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { asyncHandler } from '../lib/asyncHandler';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/register', asyncHandler((req, res) => authController.register(req, res)));
authRoutes.post('/login', asyncHandler((req, res) => authController.login(req, res)));

export { authRoutes };
