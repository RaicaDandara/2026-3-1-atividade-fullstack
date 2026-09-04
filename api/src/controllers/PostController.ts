import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// Regra 1: Publicações contêm apenas textos
const createPostSchema = z.object({
  content: z
    .string({ required_error: 'O conteúdo da publicação é obrigatório.' })
    .min(1, 'A publicação não pode ser vazia.')
    .max(500, 'A publicação deve conter no máximo 500 caracteres.'),
});

interface PostWithRelations {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  comments: { id: string }[];
  ratings: { userId: string; stars: number }[];
}

function formatPost(post: PostWithRelations, currentUserId?: string) {
  const ratingsCount = post.ratings.length;
  const sum = post.ratings.reduce((acc, r) => acc + r.stars, 0);
  const averageRating = ratingsCount > 0 ? Number((sum / ratingsCount).toFixed(1)) : 0;

  const userRatingObj = currentUserId
    ? post.ratings.find((r) => r.userId === currentUserId)
    : undefined;

  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    commentsCount: post.comments.length,
    ratingsCount,
    averageRating,
    userRating: userRatingObj ? userRatingObj.stars : null,
  };
}

export class PostController {
  // Criar publicação (apenas texto - Regra 1)
  async create(req: Request, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const { content } = createPostSchema.parse(req.body);

    const post = await prisma.post.create({
      data: {
        content,
        authorId: req.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        comments: { select: { id: true } },
        ratings: { select: { userId: true, stars: true } },
      },
    });

    return res.status(201).json(formatPost(post, req.userId));
  }

  // Feed principal: publicações de outros usuários (Regra 2)
  async feed(req: Request, res: Response) {
    const currentUserId = req.userId;

    const posts = await prisma.post.findMany({
      where: currentUserId ? { authorId: { not: currentUserId } } : {},
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        comments: { select: { id: true } },
        ratings: { select: { userId: true, stars: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(posts.map((post) => formatPost(post, currentUserId)));
  }

  // Minhas publicações (Regra 2)
  async myPosts(req: Request, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: req.userId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        comments: { select: { id: true } },
        ratings: { select: { userId: true, stars: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(posts.map((post) => formatPost(post, req.userId)));
  }

  // Pesquisa de publicações (Regra 2)
  async search(req: Request, res: Response) {
    const q = req.query.q as string;

    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: q.trim(),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        comments: { select: { id: true } },
        ratings: { select: { userId: true, stars: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(posts.map((post) => formatPost(post, req.userId)));
  }

  // Publicações de um perfil específico (Regra 5 - Perfis públicos)
  async getByUser(req: Request, res: Response) {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        comments: { select: { id: true } },
        ratings: { select: { userId: true, stars: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(posts.map((post) => formatPost(post, req.userId)));
  }

  // Obter publicação por ID
  async getById(req: Request, res: Response) {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
        comments: { select: { id: true } },
        ratings: { select: { userId: true, stars: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Publicação não encontrada.' });
    }

    return res.json(formatPost(post, req.userId));
  }

  // Excluir publicação
  async delete(req: Request, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: 'Publicação não encontrada.' });
    }

    if (post.authorId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir esta publicação.' });
    }

    await prisma.post.delete({
      where: { id },
    });

    return res.json({ message: 'Publicação excluída com sucesso.' });
  }
}

