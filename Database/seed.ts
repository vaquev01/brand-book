import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, AssetKind, JobStatus, JobType, ProjectMode, ProjectStatus } from "../src/generated/prisma";

const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/brandbook_app?schema=public";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@brandbook.app" },
    update: {
      name: "Demo Operator",
      role: "admin",
    },
    create: {
      email: "demo@brandbook.app",
      name: "Demo Operator",
      role: "admin",
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  const project = await prisma.project.upsert({
    where: { slug: "caraca-bar-demo" },
    update: {
      name: "Caraca! Bar Demo",
      industry: "Boteco tropical brasileiro",
      projectMode: ProjectMode.rebrand,
      status: ProjectStatus.in_review,
      briefing: "Projeto de demonstração para evolução de identidade, governança visual e geração de assets.",
      ownerId: user.id,
    },
    create: {
      slug: "caraca-bar-demo",
      name: "Caraca! Bar Demo",
      industry: "Boteco tropical brasileiro",
      projectMode: ProjectMode.rebrand,
      status: ProjectStatus.in_review,
      briefing: "Projeto de demonstração para evolução de identidade, governança visual e geração de assets.",
      ownerId: user.id,
    },
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });

  await prisma.brandbookVersion.upsert({
    where: {
      projectId_versionNumber: {
        projectId: project.id,
        versionNumber: 1,
      },
    },
    update: {
      lintScore: 91,
      qualityScore: 93,
      notes: "Versão seeded para desenvolvimento local.",
      brandbookJson: {
        brandName: "Caraca! Bar Demo",
        industry: "Boteco tropical brasileiro",
        positioning: {
          category: "Bar",
          positioningStatement: "Boteco tropical com brasilidade botânica e calor humano.",
        },
      },
    },
    create: {
      projectId: project.id,
      versionNumber: 1,
      lintScore: 91,
      qualityScore: 93,
      notes: "Versão seeded para desenvolvimento local.",
      brandbookJson: {
        brandName: "Caraca! Bar Demo",
        industry: "Boteco tropical brasileiro",
        positioning: {
          category: "Bar",
          positioningStatement: "Boteco tropical com brasilidade botânica e calor humano.",
        },
      },
    },
  });

  await prisma.projectAsset.upsert({
    where: {
      id: "seed-logo-primary",
    },
    update: {
      projectId: project.id,
      kind: AssetKind.logo,
      key: "logo_primary",
      name: "Logo principal",
      provider: "imagen",
      mimeType: "image/png",
      sourceUrl: "https://placehold.co/1024x1024/png",
      metadataJson: {
        seeded: true,
        note: "Asset fictício para desenvolvimento local",
      },
    },
    create: {
      id: "seed-logo-primary",
      projectId: project.id,
      kind: AssetKind.logo,
      key: "logo_primary",
      name: "Logo principal",
      provider: "imagen",
      mimeType: "image/png",
      sourceUrl: "https://placehold.co/1024x1024/png",
      metadataJson: {
        seeded: true,
        note: "Asset fictício para desenvolvimento local",
      },
    },
  });

  await prisma.generationJob.upsert({
    where: {
      id: "seed-generation-job",
    },
    update: {
      projectId: project.id,
      requestedById: user.id,
      type: JobType.generation,
      status: JobStatus.completed,
      provider: "openai",
      payloadJson: {
        scope: "full",
        creativityLevel: "balanced",
      },
      resultJson: {
        versionNumber: 1,
      },
      startedAt: new Date(),
      finishedAt: new Date(),
    },
    create: {
      id: "seed-generation-job",
      projectId: project.id,
      requestedById: user.id,
      type: JobType.generation,
      status: JobStatus.completed,
      provider: "openai",
      payloadJson: {
        scope: "full",
        creativityLevel: "balanced",
      },
      resultJson: {
        versionNumber: 1,
      },
      startedAt: new Date(),
      finishedAt: new Date(),
    },
  });

  await prisma.auditLog.upsert({
    where: {
      id: "seed-audit-log",
    },
    update: {
      projectId: project.id,
      actorUserId: user.id,
      action: "seed.initialized",
      entityType: "project",
      entityId: project.id,
      detailsJson: {
        tables: ["User", "Project", "BrandbookVersion", "ProjectAsset", "GenerationJob", "AuditLog"],
      },
    },
    create: {
      id: "seed-audit-log",
      projectId: project.id,
      actorUserId: user.id,
      action: "seed.initialized",
      entityType: "project",
      entityId: project.id,
      detailsJson: {
        tables: ["User", "Project", "BrandbookVersion", "ProjectAsset", "GenerationJob", "AuditLog"],
      },
    },
  });

  console.log(JSON.stringify({ seeded: true, user, project }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
