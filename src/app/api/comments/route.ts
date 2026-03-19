import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const CreateCommentSchema = z.object({
  versionId: z.string().optional(),
  section: z.string().optional(),
  text: z.string().min(1).max(2000),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().optional(),
  shareToken: z.string().optional(),
});

// GET — list comments for a brandbook version
// Supports: ?versionId=xxx or ?shareToken=xxx (resolves to latest version)
// Optional: ?section=xxx to filter by section
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let versionId = searchParams.get("versionId");
  const shareToken = searchParams.get("shareToken");
  const section = searchParams.get("section");

  // If shareToken provided without versionId, resolve to latest version
  if (!versionId && shareToken) {
    const shareLink = await prisma.shareLink.findUnique({
      where: { token: shareToken },
      include: {
        project: {
          include: {
            brandbookVersions: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { id: true },
            },
          },
        },
      },
    });
    if (!shareLink || !shareLink.isActive) {
      return NextResponse.json({ error: "Invalid share token" }, { status: 403 });
    }
    const latestVersion = shareLink.project.brandbookVersions[0];
    if (!latestVersion) {
      return NextResponse.json({ error: "No version found" }, { status: 404 });
    }
    versionId = latestVersion.id;
  }

  if (!versionId) {
    return NextResponse.json({ error: "versionId or shareToken is required" }, { status: 400 });
  }

  // If accessing via share token with explicit versionId, verify it's valid
  if (shareToken && searchParams.get("versionId")) {
    const shareLink = await prisma.shareLink.findUnique({
      where: { token: shareToken },
      include: { project: { include: { brandbookVersions: { select: { id: true } } } } },
    });
    if (!shareLink || !shareLink.isActive) {
      return NextResponse.json({ error: "Invalid share token" }, { status: 403 });
    }
    const versionIds = shareLink.project.brandbookVersions.map((v) => v.id);
    if (!versionIds.includes(versionId)) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }
  }

  const where: { versionId: string; section?: string } = { versionId };
  if (section) {
    where.section = section;
  }

  const comments = await prisma.brandbookComment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, image: true } } },
  });

  return NextResponse.json({ data: comments });
}

// POST — create a comment (from share link — no auth required, uses authorName)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
    }

    const { versionId: rawVersionId, section, text, authorName, authorEmail, shareToken } = parsed.data;

    let resolvedVersionId = rawVersionId;

    // If no versionId but shareToken provided, resolve to latest version
    if (!resolvedVersionId && shareToken) {
      const shareLink = await prisma.shareLink.findUnique({
        where: { token: shareToken },
        include: {
          project: {
            include: {
              brandbookVersions: {
                orderBy: { createdAt: "desc" as const },
                take: 1,
                select: { id: true },
              },
            },
          },
        },
      });
      if (!shareLink || !shareLink.isActive) {
        return NextResponse.json({ error: "Invalid share token" }, { status: 403 });
      }
      const latestVersion = shareLink.project.brandbookVersions[0];
      if (!latestVersion) {
        return NextResponse.json({ error: "No version found" }, { status: 404 });
      }
      resolvedVersionId = latestVersion.id;
    }

    if (!resolvedVersionId) {
      return NextResponse.json({ error: "versionId or shareToken is required" }, { status: 400 });
    }

    // Verify version exists and is accessible
    const version = await prisma.brandbookVersion.findUnique({
      where: { id: resolvedVersionId },
      include: { project: { include: { shareLinks: true } } },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // If share token provided with explicit versionId, verify it matches this project
    if (shareToken && rawVersionId) {
      const validToken = version.project.shareLinks.some(
        (sl) => sl.token === shareToken && sl.isActive
      );
      if (!validToken) {
        return NextResponse.json({ error: "Invalid share token" }, { status: 403 });
      }
    }

    // Find or create a guest user for the commenter
    let user = await prisma.user.findFirst({
      where: { email: authorEmail ?? `guest_${authorName.toLowerCase().replace(/\s+/g, "_")}@brandbook.guest` },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: authorEmail ?? `guest_${authorName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}@brandbook.guest`,
          name: authorName,
          role: "viewer",
        },
      });
    }

    const comment = await prisma.brandbookComment.create({
      data: {
        versionId: resolvedVersionId,
        userId: user.id,
        section: section ?? null,
        text,
        status: "open",
      },
      include: { user: { select: { name: true, email: true, image: true } } },
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (err) {
    console.error("[comments] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
