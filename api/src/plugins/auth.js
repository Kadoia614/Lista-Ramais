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
          failedLoginAttempts: true,
          lockedAt: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      });

      if (!user) {
        throw app.httpErrors.unauthorized('Token inválido ou expirado');
      }

      if (user.lockedAt) {
        throw app.httpErrors.unauthorized('Usuário bloqueado');
      }

      request.currentUser = user;
    } catch (err) {
      if (err && err.statusCode === 401) throw err;
      throw app.httpErrors.unauthorized('Autenticação obrigatória');
    }
  });

  app.decorate('authGuard', app.authenticate);
}
