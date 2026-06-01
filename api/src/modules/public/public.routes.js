export async function publicRoutes(app) {
  const paginationQuerySchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      perPage: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      search: { type: 'string' },
    },
  };

  function publicRamal(ramal) {
    return {
      nome: ramal.nome,
      setor: ramal.setor,
      ramal: ramal.ramal,
    };
  }

  app.get(
    '/public/ramais',
    {
      schema: {
        tags: ['Public'],
        summary: 'Lista pública de ramais',
        querystring: paginationQuerySchema,
      },
    },
    async (request) => {
      const result = await app.ramaisService.list(request.query);

      return {
        ...result,
        data: result.data.map(publicRamal),
      };
    },
  );

  app.get(
    '/public/ramais/:id',
    {
      schema: {
        tags: ['Public'],
        summary: 'Busca pública de um ramal por id',
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
      const ramal = await app.ramaisService.findById(request.params.id);

      if (!ramal) {
        return reply.code(404).send({ message: 'Ramal não encontrado' });
      }

      return publicRamal(ramal);
    },
  );
}
