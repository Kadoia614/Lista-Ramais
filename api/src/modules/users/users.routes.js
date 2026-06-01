export async function usersRoutes(app) {
  const usersService = app.usersService;
  const paginationQuerySchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      perPage: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
    },
  };

  app.post(
    '/users',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        summary: 'Cria um usuário',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['email', 'password'],
          additionalProperties: false,
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await usersService.create(request.body);
      return reply.code(201).send(user);
    },
  );

  app.get(
    '/users',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        summary: 'Lista usuários ativos',
        security: [{ bearerAuth: [] }],
        querystring: paginationQuerySchema,
      },
    },
    async (request) => usersService.list(request.query),
  );

  app.get(
    '/users/:id',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        summary: 'Busca um usuário por id',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await usersService.findById(request.params.id);

      if (!user) {
        return reply.code(404).send({ message: 'Usuário não encontrado' });
      }

      return user;
    },
  );

  app.patch(
    '/users/me/password',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        summary: 'Altera a senha do usuário autenticado',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          additionalProperties: false,
          properties: {
            currentPassword: { type: 'string', minLength: 6 },
            newPassword: { type: 'string', minLength: 6 },
          },
        },
      },
    },
    async (request) => {
      return usersService.changePassword(
        request.currentUser.id,
        request.body.currentPassword,
        request.body.newPassword,
      );
    },
  );

  app.patch(
    '/users/:id/unlock',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        summary: 'Desbloqueia um usuário',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await usersService.unlock(request.params.id);

      if (!user) {
        return reply.code(404).send({ message: 'Usuário não encontrado' });
      }

      return user;
    },
  );

  app.patch(
    '/users/:id',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        summary: 'Atualiza um usuário',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          additionalProperties: false,
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
          minProperties: 1,
        },
      },
    },
    async (request, reply) => {
      const user = await usersService.update(request.params.id, request.body);

      if (!user) {
        return reply.code(404).send({ message: 'Usuário não encontrado' });
      }

      return user;
    },
  );

  app.delete(
    '/users/:id',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Users'],
        summary: 'Exclui logicamente um usuário',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await usersService.softDelete(request.params.id);

      if (!user) {
        return reply.code(404).send({ message: 'Usuário não encontrado' });
      }

      return reply.code(204).send();
    },
  );
}
