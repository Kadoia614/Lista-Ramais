export async function publicRoutes(app) {
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
      },
    },
    async () => app.ramaisService.list().then((ramais) => ramais.map(publicRamal)),
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
