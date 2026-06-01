import bcrypt from 'bcrypt';

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    failedLoginAttempts: user.failedLoginAttempts,
    lockedAt: user.lockedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
}

function buildPagination({ page = 1, perPage = 10 } = {}) {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentPerPage = Math.min(Math.max(Number(perPage) || 10, 1), 100);

  return {
    page: currentPage,
    perPage: currentPerPage,
    skip: (currentPage - 1) * currentPerPage,
    take: currentPerPage,
  };
}

export function createUsersService(prisma) {
  async function resetLoginAttempts(id) {
    return prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: 0,
        lockedAt: null,
      },
    });
  }

  return {
    sanitizeUser,

    async create(data) {
      const existingUser = await prisma.user.findFirst({
        where: { email: data.email },
      });

      if (existingUser) {
        const error = new Error('E-mail já cadastrado');
        error.statusCode = 409;
        throw error;
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: passwordHash,
        },
      });

      return sanitizeUser(user);
    },

    async list(options = {}) {
      const { page, perPage, skip, take } = buildPagination(options);
      const search = options.search?.trim();
      const where = {
        deletedAt: null,
        ...(search ? { email: { contains: search } } : {}),
      };

      const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.user.count({ where }),
      ]);

      return {
        data: users.map(sanitizeUser),
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.max(Math.ceil(total / perPage), 1),
        },
      };
    },

    async listAll() {
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      return users.map(sanitizeUser);
    },

    async findById(id) {
      const user = await prisma.user.findFirst({
        where: { id, deletedAt: null },
      });

      return user ? sanitizeUser(user) : null;
    },

    async update(id, data) {
      const currentUser = await prisma.user.findFirst({
        where: { id, deletedAt: null },
      });

      if (!currentUser) {
        return null;
      }

      if (data.email && data.email !== currentUser.email) {
        const emailTaken = await prisma.user.findFirst({
          where: { email: data.email },
        });

        if (emailTaken) {
          const error = new Error('E-mail já cadastrado');
          error.statusCode = 409;
          throw error;
        }
      }

      const updateData = {};

      if (data.email) {
        updateData.email = data.email;
      }

      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 12);
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return sanitizeUser(user);
    },

    async softDelete(id) {
      const currentUser = await prisma.user.findFirst({
        where: { id, deletedAt: null },
      });

      if (!currentUser) {
        return null;
      }

      const user = await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return sanitizeUser(user);
    },

    async findForLogin(email) {
      return prisma.user.findFirst({
        where: { email, deletedAt: null },
      });
    },

    async registerFailedLogin(id) {
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        return null;
      }

      const failedLoginAttempts = user.failedLoginAttempts + 1;
      const lockedAt = failedLoginAttempts >= 5 ? new Date() : user.lockedAt;

      return prisma.user.update({
        where: { id },
        data: {
          failedLoginAttempts,
          lockedAt,
        },
      });
    },

    resetLoginAttempts,

    async unlock(id) {
      const currentUser = await prisma.user.findFirst({
        where: { id, deletedAt: null },
      });

      if (!currentUser) {
        return null;
      }

      const user = await resetLoginAttempts(id);
      return sanitizeUser(user);
    },

    async changePassword(userId, currentPassword, newPassword) {
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        return null;
      }

      const matches = await bcrypt.compare(currentPassword, user.password);

      if (!matches) {
        const error = new Error('Senha atual inválida');
        error.statusCode = 401;
        throw error;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          password: await bcrypt.hash(newPassword, 12),
        },
      });

      return sanitizeUser(updatedUser);
    },
  };
}
