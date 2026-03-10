import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/common";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as {
      name: string;
      industry: string;
      briefing?: string;
      projectMode?: string;
      brandbookData?: Record<string, unknown>;
    };

    if (!body.name || !body.industry) {
      return NextResponse.json(
        { error: "Nome e indústria são obrigatórios." },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = slugify(body.name);
    if (!baseSlug) baseSlug = "projeto";
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const existing = await prisma.project.findUnique({ where: { slug } });
      if (!existing) break;
      // If same owner, reuse the project (update)
      if (existing.ownerId === session.user.id) {
        const updated = await prisma.project.update({
          where: { id: existing.id },
          data: {
            name: body.name,
            industry: body.industry,
            briefing: body.briefing ?? existing.briefing,
            updatedAt: new Date(),
          },
        });

        // Save brandbook version if provided
        if (body.brandbookData) {
          const nextVersion = existing.currentVersion + 1;
          await prisma.brandbookVersion.create({
            data: {
              projectId: existing.id,
              versionNumber: nextVersion,
              brandbookJson: body.brandbookData as never,
            },
          });
          await prisma.project.update({
            where: { id: existing.id },
            data: { currentVersion: nextVersion },
          });
        }

        return NextResponse.json({ data: { ...updated, slug: existing.slug } });
      }
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const project = await prisma.project.create({
      data: {
        slug,
        name: body.name,
        industry: body.industry,
        briefing: body.briefing ?? null,
        projectMode: body.projectMode === "rebrand" ? "rebrand" : "new_brand",
        ownerId: session.user.id,
      },
    });

    // Save initial brandbook version if provided
    if (body.brandbookData) {
      await prisma.brandbookVersion.create({
        data: {
          projectId: project.id,
          versionNumber: 1,
          brandbookJson: body.brandbookData as never,
        },
      });
    }

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/projects]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao salvar projeto" },
      { status: 500 }
    );
  }
}
