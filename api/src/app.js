import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authPlugin } from './plugins/auth.js';
import { createAuthService } from './modules/auth/auth.service.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { createRamaisService } from './modules/ramais/ramais.service.js';
import { ramaisRoutes } from './modules/ramais/ramais.routes.js';
import { publicRoutes } from './modules/public/public.routes.js';
import { createUsersService } from './modules/users/users.service.js';
import { usersRoutes } from './modules/users/users.routes.js';

export async function buildApp() {
  const app = fastify({
    logger: true,
  });

  const prisma = new PrismaClient();

  app.decorate('prisma', prisma);
  app.decorate('usersService', createUsersService(prisma));
  app.decorate('ramaisService', createRamaisService(prisma));

  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'troque-este-segredo-em-producao',
  });

  app.decorate('authService', createAuthService(app.usersService, app.jwt));

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Ramais API',
        description: 'API modular para usuários, autenticação e ramais',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      servers: [{ url: '/api' }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Register auth plugin directly to avoid Fastify encapsulation hiding the
  // `authenticate` decoration from the root instance.
  await authPlugin(app);

  app.get('/api/health', async () => ({ status: 'ok' }));

  await app.register(async (api) => {
    await api.register(authRoutes);
    await api.register(usersRoutes);
    await api.register(ramaisRoutes);
    await api.register(publicRoutes);
  }, {
    prefix: '/api',
  });

  // Global auth guard: protect all routes by default, but allow public and
  // unauthenticated auth endpoints (login/bootstrap), health and docs.
  app.addHook('preHandler', async (request, reply) => {
    const url = request.raw.url || '';

    // Allow public endpoints, health check and docs
    if (
      url.startsWith('/api/public') ||
      url === '/api/auth/login' ||
      url === '/api/auth/bootstrap' ||
      url.startsWith('/docs') ||
      url === '/api/health'
    ) {
      return;
    }

    // Enforce auth for everything else; if auth fails it will throw and Fastify
    // will return the appropriate 401 response.
    await app.authenticate(request, reply);
  });

  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode ?? 500;

    request.log.error(error);

    return reply.code(statusCode).send({
      message:
        statusCode === 500
          ? 'Erro interno do servidor'
          : error.message ?? 'Erro inesperado',
    });
  });

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
