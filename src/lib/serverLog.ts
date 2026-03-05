import crypto from "node:crypto";
import type { NextRequest } from "next/server";

export type LogLevel = "debug" | "info" | "warn" | "error";

type Json = Record<string, unknown>;

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function normalizeLevel(x: unknown): LogLevel {
  const v = String(x || "").toLowerCase().trim();
  if (v === "debug" || v === "info" || v === "warn" || v === "error") return v;
  return "info";
}

function minLevel(): LogLevel {
  return normalizeLevel(process.env.BB_LOG_LEVEL || "info");
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[minLevel()];
}

export type MemSnapshot = {
  rss: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
};

function bytesToMB(n: number): number {
  return Math.round((n / 1024 / 1024) * 10) / 10;
}

export function captureMem(): MemSnapshot {
  const m = process.memoryUsage();
  return {
    rss: m.rss,
    heapUsed: m.heapUsed,
    heapTotal: m.heapTotal,
    external: m.external,
    arrayBuffers: m.arrayBuffers,
  };
}

export function memToJson(m: MemSnapshot): Json {
  return {
    rssMB: bytesToMB(m.rss),
    heapUsedMB: bytesToMB(m.heapUsed),
    heapTotalMB: bytesToMB(m.heapTotal),
    externalMB: bytesToMB(m.external),
    arrayBuffersMB: bytesToMB(m.arrayBuffers),
  };
}

export function diffMem(before: MemSnapshot, after: MemSnapshot): Json {
  return {
    rssDeltaMB: bytesToMB(after.rss - before.rss),
    heapUsedDeltaMB: bytesToMB(after.heapUsed - before.heapUsed),
    heapTotalDeltaMB: bytesToMB(after.heapTotal - before.heapTotal),
    externalDeltaMB: bytesToMB(after.external - before.external),
    arrayBuffersDeltaMB: bytesToMB(after.arrayBuffers - before.arrayBuffers),
    after: memToJson(after),
  };
}

export function getRequestId(req: NextRequest): string {
  const headerId = req.headers.get("x-request-id") || req.headers.get("x-correlation-id");
  if (headerId && headerId.trim()) return headerId.trim().slice(0, 120);
  return crypto.randomUUID();
}

export function serializeError(err: unknown): Json {
  if (err instanceof Error) {
    const anyErr = err as Error & { code?: unknown; cause?: unknown };
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: typeof anyErr.code === "string" || typeof anyErr.code === "number" ? anyErr.code : undefined,
      cause: anyErr.cause instanceof Error ? serializeError(anyErr.cause) : anyErr.cause,
    };
  }
  return {
    name: "NonError",
    message: typeof err === "string" ? err : "Non-error thrown",
    value: err,
  };
}

export function bbLog(level: LogLevel, event: string, data: Json = {}): void {
  if (!shouldLog(level)) return;

  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    service: "brandbook-app",
    pid: process.pid,
    node: process.version,
    railwayEnv: process.env.RAILWAY_ENVIRONMENT_NAME || process.env.RAILWAY_ENVIRONMENT || undefined,
    ...data,
  });

  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}
