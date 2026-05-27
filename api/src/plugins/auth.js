export async function authPlugin(app) {
  app.decorate('authenticate', async function authenticate(request, reply) {
    try {
      const payload = await request.jwtVerify();
      const user = await app.prisma.user.findFirst({
        where: {
          id: payload.sub,
          deletedAt: null,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });

      if (!user) {
        throw app.httpErrors.unauthorized('Token inválido ou expirado');
      }

      request.currentUser = user;
    } catch (err) {
      if (err && err.statusCode === 401) throw err;
      throw app.httpErrors.unauthorized('Autenticação obrigatória');
    }
  });

  // Alias for use as a Fastify preHandler: `preHandler: app.authGuard`
  app.decorate('authGuard', app.authenticate);
}
