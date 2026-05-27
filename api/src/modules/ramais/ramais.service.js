function sanitizeRamal(ramal) {
  return {
    id: ramal.id,
    nome: ramal.nome,
    setor: ramal.setor,
    ramal: ramal.ramal,
    createdAt: ramal.createdAt,
    updatedAt: ramal.updatedAt,
    deletedAt: ramal.deletedAt,
  };
}

export function createRamaisService(prisma) {
  return {
    sanitizeRamal,

    async create(data) {
      const existingRamal = await prisma.ramal.findFirst({
        where: { ramal: data.ramal },
      });

      if (existingRamal) {
        const error = new Error('Ramal já cadastrado');
        error.statusCode = 409;
        throw error;
      }

      const ramal = await prisma.ramal.create({
        data: {
          nome: data.nome,
          setor: data.setor,
          ramal: data.ramal,
        },
      });

      return sanitizeRamal(ramal);
    },

    async list() {
      const ramais = await prisma.ramal.findMany({
        where: { deletedAt: null },
        orderBy: { nome: 'asc' },
      });

      return ramais.map(sanitizeRamal);
    },

    async findById(id) {
      const ramal = await prisma.ramal.findFirst({
        where: { id, deletedAt: null },
      });

      return ramal ? sanitizeRamal(ramal) : null;
    },

    async update(id, data) {
      const currentRamal = await prisma.ramal.findFirst({
        where: { id, deletedAt: null },
      });

      if (!currentRamal) {
        return null;
      }

      if (data.ramal && data.ramal !== currentRamal.ramal) {
        const ramalTaken = await prisma.ramal.findFirst({
          where: { ramal: data.ramal },
        });

        if (ramalTaken) {
          const error = new Error('Ramal já cadastrado');
          error.statusCode = 409;
          throw error;
        }
      }

      const updatedRamal = await prisma.ramal.update({
        where: { id },
        data: {
          nome: data.nome ?? undefined,
          setor: data.setor ?? undefined,
          ramal: data.ramal ?? undefined,
        },
      });

      return sanitizeRamal(updatedRamal);
    },

    async softDelete(id) {
      const currentRamal = await prisma.ramal.findFirst({
        where: { id, deletedAt: null },
      });

      if (!currentRamal) {
        return null;
      }

      const ramal = await prisma.ramal.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return sanitizeRamal(ramal);
    },
  };
}
