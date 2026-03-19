import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const CreateCommentSchema = z.object({
  versionId: z.string(),
  section: z.string().optional(),
  text: z.string().min(1).max(2000),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().optional(),
  shareToken: z.string().optional(),
});

// GET — list comments for a brandbook version
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const versionId = searchParams.get("versionId");
  const shareToken = searchParams.get("shareToken");

  if (!versionId) {
    return NextResponse.json({ error: "versionId is required" }, { status: 400 });
  }

  // If accessing via share token, verify it's valid
  if (shareToken) {
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

  const comments = await prisma.brandbookComment.findMany({
    where: { versionId },
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

    const { versionId, section, text, authorName, authorEmail, shareToken } = parsed.data;

    // Verify version exists and is accessible
    const version = await prisma.brandbookVersion.findUnique({
      where: { id: versionId },
      include: { project: { include: { shareLinks: true } } },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // If share token provided, verify it matches this project
    if (shareToken) {
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
        versionId,
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
