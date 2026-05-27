export async function authRoutes(app) {
  const authService = app.authService;

  app.post(
    '/auth/bootstrap',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Cria o primeiro usuário quando ainda não existe nenhum cadastro',
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
    async (request) => authService.bootstrap(request.body.email, request.body.password),
  );

  app.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Autentica um usuário',
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
    async (request) => authService.login(request.body.email, request.body.password),
  );

  app.get(
    '/auth/me',
    {
      preHandler: app.authenticate,
      schema: {
        tags: ['Auth'],
        summary: 'Retorna o usuário autenticado',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => ({ user: request.currentUser }),
  );
}
