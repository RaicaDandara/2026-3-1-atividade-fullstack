import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { asyncHandler } from '../lib/asyncHandler';

const userRoutes = Router();
const userController = new UserController();

// Rotas autenticadas do próprio usuário
userRoutes.get('/me', ensureAuthenticated, asyncHandler((req, res) => userController.me(req, res)));
userRoutes.patch('/me', ensureAuthenticated, asyncHandler((req, res) => userController.updateProfile(req, res)));

// Rota pública de consulta de perfil (Regra 5: Perfis são sempre públicos)
userRoutes.get('/profile/:username', asyncHandler((req, res) => userController.getProfile(req, res)));

export { userRoutes };
