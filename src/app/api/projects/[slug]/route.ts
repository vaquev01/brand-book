import { NextResponse } from "next/server";
import { ProjectController } from "@/server/controllers/projectController";

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
