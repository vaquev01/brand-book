# DEV_CONTEXT

## Resumo atual

Projeto principal: `brandbook-app`

Stack atual em produção:
- Next.js + React + TypeScript
- Tailwind CSS
- Zustand para client state persistido
- TanStack Query para server state
- Prisma 7 + PostgreSQL com adapter `@prisma/adapter-pg`
- Node.js runtime nas rotas `src/app/api`
- Fluxo de release via GitHub + Railway

## Adaptação arquitetural aplicada com segurança

Para não quebrar o app atual, a migração para a estrutura-alvo foi iniciada por scaffolding:

- `Frontend/` criado como destino futuro do frontend
- `Backend/` criado com base `Controller -> Service -> Repository`
- `Database/` criado com `schema.prisma`, `migrations/` e `seed.ts`
- `Deploy/` criado com Dockerfiles, Docker Compose, Nginx e pipeline de referência
- `scripts/DEV_CONTEXT.md` criado e passa a ser a referência de contexto técnico
- `src/components/AppProviders.tsx` injeta TanStack Query globalmente no app
- `src/store/appPreferences.ts` centraliza preferências persistidas via Zustand
- `src/server/` já contém a trilha `Repository -> Service -> Controller` aplicada à rota de projetos

## Banco de dados atual

Fonte única da verdade proposta:
- `Database/schema.prisma`
- Configuração Prisma 7 centralizada em `prisma.config.ts`
- Client Prisma gerado explicitamente em `src/generated/prisma`

Tabelas/modelos preparados:
- `User`
- `Project`
- `BrandbookVersion`
- `ProjectAsset`
- `GenerationJob`
- `AuditLog`

Enums preparados:
- `ProjectMode`
- `ProjectStatus`
- `AssetKind`
- `JobType`
- `JobStatus`

## Regras arquiteturais adotadas

- Prisma ORM como única camada de acesso a banco
- Evitar SQL solto
- Padrão de backend: `Controller -> Service -> Repository`
- Instâncias Prisma devem usar `PrismaClient({ adapter })` com `PrismaPg`
- Tailwind preparado para `src/` e `Frontend/`
- Docker Compose preparado para app + PostgreSQL + Nginx

## Observações importantes

- O app atual ainda roda em `src/`, não em `Frontend/`
- As rotas atuais ainda vivem em `src/app/api`
- O runtime Prisma 7 foi validado com fallback de `DATABASE_URL` para ambiente local
- O seed Prisma e o client compartilham o mesmo adapter PostgreSQL para evitar divergência entre ambiente de app e ambiente de banco
- `typecheck`, `test`, `lint`, `build` e `prisma validate` passaram no diretório `brandbook-app`
- Em macOS, `Scripts` e `scripts` colidem em filesystem case-insensitive; por isso o diretório existente `scripts/` foi mantido como equivalente seguro ao requisito `Scripts`
