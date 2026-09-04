import { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { asyncHandler } from '../lib/asyncHandler';

const commentRoutes = Router();
const commentController = new CommentController();

// Exclusão de comentário (apenas autor)
commentRoutes.delete('/:id', ensureAuthenticated, asyncHandler((req, res) => commentController.delete(req, res)));

export { commentRoutes };

