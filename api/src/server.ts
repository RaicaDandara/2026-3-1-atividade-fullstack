import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ZodError } from 'zod';
import { router } from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    app: 'DIATINF X API',
    timestamp: new Date().toISOString(),
  });
});

// Rotas da aplicação (suporta / e /api)
app.use(router);
app.use('/api', router);

// Middleware global de tratamento de erros
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  console.error('Erro não tratado na API:', err);
  return res.status(500).json({
    error: 'Erro interno no servidor.',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 DIATINF X API rodando na porta ${PORT}`);
});

export { app };
