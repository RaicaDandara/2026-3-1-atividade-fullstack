import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { RatingController } from '../controllers/RatingController';
import { CommentController } from '../controllers/CommentController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import { optionalAuth } from '../middlewares/optionalAuth';
import { asyncHandler } from '../lib/asyncHandler';

const postRoutes = Router();
const postController = new PostController();
const ratingController = new RatingController();
const commentController = new CommentController();

// Rotas de Posts
postRoutes.post('/', ensureAuthenticated, asyncHandler((req, res) => postController.create(req, res)));
postRoutes.get('/feed', optionalAuth, asyncHandler((req, res) => postController.feed(req, res)));
postRoutes.get('/my', ensureAuthenticated, asyncHandler((req, res) => postController.myPosts(req, res)));
postRoutes.get('/search', optionalAuth, asyncHandler((req, res) => postController.search(req, res)));
postRoutes.get('/user/:username', optionalAuth, asyncHandler((req, res) => postController.getByUser(req, res)));
postRoutes.get('/:id', optionalAuth, asyncHandler((req, res) => postController.getById(req, res)));
postRoutes.delete('/:id', ensureAuthenticated, asyncHandler((req, res) => postController.delete(req, res)));

// Rotas de Avaliação vinculadas ao Post (Regra 4)
postRoutes.post('/:id/rate', ensureAuthenticated, asyncHandler((req, res) => ratingController.rate(req, res)));

// Rotas de Comentários vinculadas ao Post (Regra 3)
postRoutes.post('/:id/comments', ensureAuthenticated, asyncHandler((req, res) => commentController.create(req, res)));
postRoutes.get('/:id/comments', asyncHandler((req, res) => commentController.listByPost(req, res)));

export { postRoutes };

