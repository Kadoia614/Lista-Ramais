import bcrypt from 'bcrypt';

const MAX_LOGIN_ATTEMPTS = 5;

export function createAuthService(usersService, jwt) {
  return {
    async login(email, password) {
      const user = await usersService.findForLogin(email);

      if (!user) {
        const error = new Error('Credenciais inválidas');
        error.statusCode = 401;
        throw error;
      }

      if (user.lockedAt) {
        const error = new Error('Usuário bloqueado por excesso de tentativas. Solicite desbloqueio ao administrador.');
        error.statusCode = 423;
        throw error;
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        const updatedUser = await usersService.registerFailedLogin(user.id);
        const remainingAttempts = Math.max(MAX_LOGIN_ATTEMPTS - updatedUser.failedLoginAttempts, 0);
        const error = new Error(
          updatedUser.lockedAt
            ? 'Usuário bloqueado por excesso de tentativas. Solicite desbloqueio ao administrador.'
            : `Credenciais inválidas. Tentativas restantes: ${remainingAttempts}`,
        );
        error.statusCode = updatedUser.lockedAt ? 423 : 401;
        throw error;
      }

      const activeUser = user.failedLoginAttempts > 0 ? await usersService.resetLoginAttempts(user.id) : user;
      const token = jwt.sign({ sub: user.id, email: user.email }, { expiresIn: '15m' });

      return {
        token,
        user: usersService.sanitizeUser(activeUser),
      };
    },

    async bootstrap(email, password) {
      const existingUsers = await usersService.listAll();

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
