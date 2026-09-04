import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').optional(),
  bio: z.string().max(280, 'A bio deve ter no máximo 280 caracteres.').nullable().optional(),
  avatarUrl: z.string().url('URL do avatar inválida.').nullable().optional().or(z.literal('')),
});

export class UserController {
  async me(req: Request, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json(user);
  }

  // Perfis são sempre públicos (Regra de Negócio 5)
  async getProfile(req: Request, res: Response) {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: 'Nome de usuário não informado.' });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json(user);
  }

  async updateProfile(req: Request, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const { name, bio, avatarUrl } = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
      },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return res.json(user);
  }
}

