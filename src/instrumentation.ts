import { bbLog, captureMem, memToJson, serializeError } from "@/lib/serverLog";

let handlersInstalled = false;
let memInterval: NodeJS.Timeout | null = null;

function parseIntervalMs(v: string | undefined): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 60_000;
  if (n < 10_000) return 10_000;
  return Math.floor(n);
}

export async function register() {
  const mem0 = captureMem();
  bbLog("info", "server.register", {
    mem: memToJson(mem0),
    uptimeSec: Math.round(process.uptime()),
  });

  if (!handlersInstalled) {
    handlersInstalled = true;

    process.on("unhandledRejection", (reason: unknown) => {
      bbLog("error", "process.unhandledRejection", {
        reason: serializeError(reason),
        mem: memToJson(captureMem()),
        uptimeSec: Math.round(process.uptime()),
      });
    });

    process.on("uncaughtException", (err: unknown) => {
      bbLog("error", "process.uncaughtException", {
        error: serializeError(err),
        mem: memToJson(captureMem()),
        uptimeSec: Math.round(process.uptime()),
      });
    });
  }

  const disabled = String(process.env.BB_MEM_LOG_DISABLED || "").trim() === "1";
  if (disabled) return;

  const intervalMs = parseIntervalMs(process.env.BB_MEM_LOG_INTERVAL_MS);

  if (memInterval) return;

  memInterval = setInterval(() => {
    bbLog("info", "server.mem", {
      mem: memToJson(captureMem()),
      uptimeSec: Math.round(process.uptime()),
    });
  }, intervalMs);

  memInterval.unref?.();
}
