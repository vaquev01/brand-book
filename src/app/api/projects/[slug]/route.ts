import { NextResponse } from "next/server";
import { ProjectController } from "@/server/controllers/projectController";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";

const projectController = new ProjectController();

export async function GET(
  _request: Request,
  context: { params: { slug: string } }
) {
  try {
    const project = await projectController.showBySlug(context.params.slug);
    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ data: project });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[slug] — persist brandbook edits to the database.
 * Creates a new BrandbookVersion so the latest data is always available
 * for share links (/s/[token]) and cross-device access.
 */
export async function PUT(
  request: Request,
  context: { params: { slug: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { brandbookData } = (await request.json()) as {
      brandbookData?: Record<string, unknown>;
    };

    if (!brandbookData) {
      return NextResponse.json({ error: "brandbookData é obrigatório." }, { status: 400 });
    }

    const slug = context.params.slug;
    let project = await prisma.project.findUnique({ where: { slug } });

    // If project doesn't exist, create it automatically from the brandbook data
    if (!project) {
      project = await prisma.project.create({
        data: {
          slug,
          name: (brandbookData.brandName as string) || slug,
          industry: (brandbookData.industry as string) || "N/A",
          ownerId: session.user.id,
        },
      });
    }

    if (project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    // Create new version (incremental)
    const nextVersion = project.currentVersion + 1;
    await prisma.brandbookVersion.create({
      data: {
        projectId: project.id,
        versionNumber: nextVersion,
        brandbookJson: brandbookData as never,
      },
    });

    await prisma.project.update({
      where: { id: project.id },
      data: {
        currentVersion: nextVersion,
        name: (brandbookData.brandName as string) || project.name,
        industry: (brandbookData.industry as string) || project.industry,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, version: nextVersion });
  } catch (error: unknown) {
    console.error("[PUT /api/projects/[slug]]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao salvar" },
      { status: 500 }
    );
  }
}

/**
 * POST handler — used by navigator.sendBeacon on page unload.
 * sendBeacon always sends POST, so we route it to the same save logic.
 */
export async function POST(
  request: Request,
  context: { params: { slug: string } }
) {
  return PUT(request, context);
}
