import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const rateSchema = z.object({
  stars: z
    .number({ invalid_type_error: 'A avaliação deve ser um número.' })
    .int('A avaliação deve ser um número inteiro.')
    .min(1, 'A avaliação mínima é 1 estrela.')
    .max(3, 'A avaliação máxima é 3 estrelas.'),
});

export class RatingController {
  async rate(req: Request, res: Response) {
    if (!req.userId) {
      return res.status(401).json({ error: 'Não autenticado.' });
    }

    const { id: postId } = req.params;
    const { stars } = rateSchema.parse(req.body);

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Publicação não encontrada.' });
    }

    // Upsert rating para garantir 1 avaliação por usuário por post (Regra 4)
    const rating = await prisma.rating.upsert({
      where: {
        postId_userId: {
          postId,
          userId: req.userId,
        },
      },
      update: { stars },
      create: {
        postId,
        userId: req.userId,
        stars,
      },
    });

    // Calcular estatísticas atualizadas
    const ratings = await prisma.rating.findMany({
      where: { postId },
      select: { stars: true },
    });

    const ratingsCount = ratings.length;
    const sum = ratings.reduce((acc, curr) => acc + curr.stars, 0);
    const averageRating = ratingsCount > 0 ? Number((sum / ratingsCount).toFixed(1)) : 0;

    return res.json({
      rating,
      averageRating,
      ratingsCount,
    });
  }
}

