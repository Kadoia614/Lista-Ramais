export async function ramaisRoutes(app) {
  const ramaisService = app.ramaisService;

  const createBodySchema = {
    type: 'object',
    required: ['nome', 'setor', 'ramal'],
    additionalProperties: false,
    properties: {
      nome: { type: 'string', minLength: 2 },
      setor: { type: 'string', minLength: 2 },
      ramal: { type: 'string', minLength: 2 },
    },
  };

  app.post(
    '/ramais',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Ramais'],
        summary: 'Cria um ramal',
        security: [{ bearerAuth: [] }],
        body: createBodySchema,
      },
    },
    async (request, reply) => {
      const ramal = await ramaisService.create(request.body);
      return reply.code(201).send(ramal);
    },
  );

  app.get(
    '/ramais',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Ramais'],
        summary: 'Lista ramais ativos',
        security: [{ bearerAuth: [] }],
      },
    },
    async () => ramaisService.list(),
  );

  app.get(
    '/ramais/:id',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Ramais'],
        summary: 'Busca um ramal por id',
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
      const ramal = await ramaisService.findById(request.params.id);

      if (!ramal) {
        return reply.code(404).send({ message: 'Ramal não encontrado' });
      }

      return ramal;
    },
  );

  app.patch(
    '/ramais/:id',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Ramais'],
        summary: 'Atualiza um ramal',
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
            nome: { type: 'string', minLength: 2 },
            setor: { type: 'string', minLength: 2 },
            ramal: { type: 'string', minLength: 2 },
          },
          minProperties: 1,
        },
      },
    },
    async (request, reply) => {
      const ramal = await ramaisService.update(request.params.id, request.body);

      if (!ramal) {
        return reply.code(404).send({ message: 'Ramal não encontrado' });
      }

      return ramal;
    },
  );

  app.delete(
    '/ramais/:id',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Ramais'],
        summary: 'Exclui logicamente um ramal',
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
      const ramal = await ramaisService.softDelete(request.params.id);

      if (!ramal) {
        return reply.code(404).send({ message: 'Ramal não encontrado' });
      }

      return reply.code(204).send();
    },
  );
}
