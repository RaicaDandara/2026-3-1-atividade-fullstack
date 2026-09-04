import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.')
    .max(30, 'O nome de usuário deve ter no máximo 30 caracteres.')
    .regex(/^[a-zA-Z0-9_]+$/, 'O nome de usuário deve conter apenas letras, números e underline.')
    .transform((val) => val.toLowerCase()),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  bio: z.string().max(280, 'A bio deve ter no máximo 280 caracteres.').optional(),
  avatarUrl: z.string().url('URL do avatar inválida.').optional().or(z.literal('')),
});

const loginSchema = z.object({
  username: z.string().min(1, 'Nome de usuário é obrigatório.').transform((val) => val.toLowerCase()),
  password: z.string().min(1, 'Senha é obrigatória.'),
});

export class AuthController {
  async register(req: Request, res: Response) {
    const { username, password, name, bio, avatarUrl } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Nome de usuário já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
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

    const secret = process.env.JWT_SECRET || 'diatinf-x-super-secret-key-change-in-production';
    const token = jwt.sign(
      { sub: user.id, username: user.username },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ user, token });
  }

  async login(req: Request, res: Response) {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const secret = process.env.JWT_SECRET || 'diatinf-x-super-secret-key-change-in-production';
    const token = jwt.sign(
      { sub: user.id, username: user.username },
      secret,
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };

    return res.json({ user: userResponse, token });
  }
}

