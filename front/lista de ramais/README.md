# Ramais Frontend

Frontend React/Vite para a API de ramais.

## Rotas

- `/login` - autenticação
- `/public` - consulta pública
- `/admin/users` - CRUD de usuários
- `/admin/ramais` - CRUD de ramais
- `/admin/password` - alteração de senha

## Configuração

Defina a API em `VITE_API_BASE_URL` se necessário. O padrão é:

```env
VITE_API_BASE_URL=http://127.0.0.1:3000/api
```

## Rodar

```bash
npm install
npm run dev
```

## Observações

- Não existe tela de cadastro de admin no front.
- Usuários e ramais são mantidos em páginas separadas.
- Os toasts indicam sucesso e erro nas requisições.
