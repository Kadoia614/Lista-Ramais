import bcrypt from 'bcrypt';

export function createAuthService(usersService, jwt) {
  return {
    async login(email, password) {
      const user = await usersService.findForLogin(email);

      if (!user) {
        const error = new Error('Credenciais inválidas');
        error.statusCode = 401;
        throw error;
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        const error = new Error('Credenciais inválidas');
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign({ sub: user.id, email: user.email });

      return {
        token,
        user: usersService.sanitizeUser(user),
      };
    },

    async bootstrap(email, password) {
      const existingUsers = await usersService.list();

      if (existingUsers.length > 0) {
        const error = new Error('Bootstrap indisponível');
        error.statusCode = 409;
        throw error;
      }

      const user = await usersService.create({ email, password });
      const token = jwt.sign({ sub: user.id, email: user.email });

      return {
        token,
        user,
      };
    },
  };
}
