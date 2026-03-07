# Database

Esta pasta centraliza a estrutura de banco em Prisma ORM.

Arquivos iniciais:
- `schema.prisma`
- `migrations/`
- `seed.ts`

Fluxo esperado:
1. Definir `Database/schema.prisma`
2. Rodar `npm run db:generate`
3. Rodar `npm run db:migrate:dev`
4. Rodar `npm run db:seed`
