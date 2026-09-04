import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'O conteúdo do comentário é obrigatório.' })
    .min(1, 'O comentário não pode ficar vazio.')
    .max(500, 'O comentário deve ter no máximo 500 caracteres.'),
  parentId: z.string().uuid('ID de comentário pai inválido.').nullable().optional(),
});

interface CommentNode {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  replies: CommentNode[];
}

export class CommentController {
  async create(req: Request, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const { id: postId } = req.params;
    const { content, parentId } = createCommentSchema.parse(req.body);

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Publicação não encontrada.' });
    }

    // Se houver parentId, verificar se o comentário pai existe e pertence ao mesmo post
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.postId !== postId) {
        return res.status(400).json({ error: 'Comentário pai inválido ou não pertence a esta publicação.' });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: req.userId,
        parentId: parentId || null,
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
      },
    });

    return res.status(201).json(comment);
  }

  // Listar comentários organizados em árvore encadeada (Regra 3)
  async listByPost(req: Request, res: Response) {
    const { id: postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Publicação não encontrada.' });
    }

    const allComments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Construção da árvore hierárquica encadeada de comentários
    const commentMap = new Map<string, CommentNode>();
    const rootComments: CommentNode[] = [];

    // Primeiro passo: mapear todos com array vazio de respostas
    for (const comment of allComments) {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
      });
    }

    // Segundo passo: aninhar respostas nos comentários pais
    for (const comment of allComments) {
      const node = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        const parentNode = commentMap.get(comment.parentId)!;
        parentNode.replies.push(node);
      } else {
        rootComments.push(node);
      }
    }

    return res.json(rootComments);
  }

  async delete(req: Request, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado.' });
    }

    if (comment.authorId !== req.userId) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este comentário.' });
    }

    await prisma.comment.delete({
      where: { id },
    });

    return res.json({ message: 'Comentário excluído com sucesso.' });
  }
}

