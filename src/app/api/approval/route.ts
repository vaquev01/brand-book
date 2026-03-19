import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const ApprovalSchema = z.object({
  shareToken: z.string(),
  section: z.string(),
  status: z.enum(["approved", "rejected", "needs_changes"]),
  approverName: z.string().min(1).max(100),
  approverEmail: z.string().email().optional(),
  feedback: z.string().max(2000).optional(),
});

// GET — get approval status for a project via share token
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shareToken = searchParams.get("shareToken");

  if (!shareToken) {
    return NextResponse.json({ error: "shareToken required" }, { status: 400 });
  }

  const shareLink = await prisma.shareLink.findUnique({
    where: { token: shareToken },
    include: {
      project: {
        include: {
          brandbookVersions: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              comments: {
                orderBy: { createdAt: "desc" },
                include: { user: { select: { name: true, image: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!shareLink || !shareLink.isActive) {
    return NextResponse.json({ error: "Invalid share token" }, { status: 403 });
  }

  const version = shareLink.project.brandbookVersions[0];
  if (!version) {
    return NextResponse.json({ error: "No version found" }, { status: 404 });
  }

  // Parse section approval status from comments
  const sectionApprovals: Record<string, { status: string; approver: string; feedback?: string; date: string }> = {};
  for (const comment of version.comments) {
    if (comment.section && comment.text.startsWith("[APPROVAL:")) {
      const match = comment.text.match(/^\[APPROVAL:(\w+)\]\s*(.*)/);
      if (match) {
        sectionApprovals[comment.section] = {
          status: match[1],
          approver: comment.user.name ?? "Anônimo",
          feedback: match[2] || undefined,
          date: comment.createdAt.toISOString(),
        };
      }
    }
  }

  const regularComments = version.comments.filter((c) => !c.text.startsWith("[APPROVAL:"));

  return NextResponse.json({
    data: {
      versionId: version.id,
      versionNumber: version.versionNumber,
      projectName: shareLink.project.name,
      sectionApprovals,
      comments: regularComments,
      overallStatus: deriveOverallStatus(sectionApprovals),
    },
  });
}

// POST — submit section approval
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ApprovalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
    }

    const { shareToken, section, status, approverName, approverEmail, feedback } = parsed.data;

    const shareLink = await prisma.shareLink.findUnique({
      where: { token: shareToken },
      include: {
        project: {
          include: {
            brandbookVersions: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
    });

    if (!shareLink || !shareLink.isActive) {
      return NextResponse.json({ error: "Invalid share token" }, { status: 403 });
    }

    const version = shareLink.project.brandbookVersions[0];
    if (!version) {
      return NextResponse.json({ error: "No version found" }, { status: 404 });
    }

    // Find or create guest user
    let user = await prisma.user.findFirst({
      where: { email: approverEmail ?? `approver_${approverName.toLowerCase().replace(/\s+/g, "_")}@brandbook.guest` },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: approverEmail ?? `approver_${approverName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}@brandbook.guest`,
          name: approverName,
          role: "viewer",
        },
      });
    }

    // Create approval comment
    const comment = await prisma.brandbookComment.create({
      data: {
        versionId: version.id,
        userId: user.id,
        section,
        text: `[APPROVAL:${status}] ${feedback ?? ""}`.trim(),
        status: status === "approved" ? "resolved" : "open",
      },
    });

    return NextResponse.json({ data: { commentId: comment.id, section, status } }, { status: 201 });
  } catch (err) {
    console.error("[approval] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function deriveOverallStatus(approvals: Record<string, { status: string }>): string {
  const values = Object.values(approvals);
  if (values.length === 0) return "pending";
  if (values.every((v) => v.status === "approved")) return "approved";
  if (values.some((v) => v.status === "rejected")) return "rejected";
  if (values.some((v) => v.status === "needs_changes")) return "needs_changes";
  return "in_review";
}
