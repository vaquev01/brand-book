# Backend

Estrutura inicial preparada no padrão:

- `controllers/`
- `services/`
- `repositories/`

A aplicação atual segue operando via rotas do Next.js em `src/app/api`. Esta pasta foi adicionada para permitir migração gradual para um backend Node.js TypeScript dedicado, preservando o padrão Controller -> Service -> Repository.
