import { prisma } from "@/lib/prisma";

export class ProjectRepository {
  async findById(projectId: string) {
    return prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        slug: true,
        name: true,
        industry: true,
        projectMode: true,
        status: true,
        briefing: true,
        currentVersion: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.project.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        industry: true,
        projectMode: true,
        status: true,
        briefing: true,
        currentVersion: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        brandbookVersions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          select: {
            id: true,
            versionNumber: true,
            lintScore: true,
            qualityScore: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
