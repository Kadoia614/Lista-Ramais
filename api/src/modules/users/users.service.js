import bcrypt from 'bcrypt';

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
}

export function createUsersService(prisma) {
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

    async list() {
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
