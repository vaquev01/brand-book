import { spawnSync } from "node:child_process";
import { existsSync, watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const args = process.argv.slice(2);
const showHelp = args.includes("--help") || args.includes("-h");
const skipChecks = args.includes("--skip-checks");
const debounceArg = args.find((arg) => arg.startsWith("--debounce="));
const debounceMs = Number.parseInt(debounceArg?.split("=")[1] ?? "5000", 10);
const ignoredPrefixes = [".git/", ".next/", "node_modules/", "coverage/", "dist/", "src/generated/prisma/"];
const ignoredExact = new Set([".DS_Store"]);

if (showHelp) {
  console.log("Usage: node scripts/auto-sync.mjs [--skip-checks] [--debounce=5000]");
  process.exit(0);
}

if (!existsSync(path.join(repoRoot, ".git"))) {
  console.error("Git repository not found.");
  process.exit(1);
}

if (!Number.isFinite(debounceMs) || debounceMs < 500) {
  console.error("Invalid --debounce value. Use a number >= 500.");
  process.exit(1);
}

let timer;
let syncing = false;
let queued = false;
let lastTriggeredPath = "workspace";

function normalizeRelativePath(filename) {
  if (!filename) return "";
  return filename.toString().split(path.sep).join("/").replace(/^\.\//, "");
}

function shouldIgnore(filename) {
  if (!filename) return false;
  const relativePath = normalizeRelativePath(filename);
  if (!relativePath) return false;
  if (ignoredExact.has(relativePath)) return true;
  return ignoredPrefixes.some((prefix) => relativePath === prefix.slice(0, -1) || relativePath.startsWith(prefix));
}

function runAutoSync() {
  if (syncing) {
    queued = true;
    return;
  }

  syncing = true;
  console.log(`🚀 Running auto-sync for ${lastTriggeredPath}...`);

  const syncArgs = [path.join("scripts", "git-sync.mjs")];
  if (skipChecks) {
    syncArgs.push("--skip-checks");
  }
  syncArgs.push("chore:", "auto-sync");

  const result = spawnSync(process.execPath, syncArgs, {
    cwd: repoRoot,
    stdio: "inherit",
  });

  syncing = false;

  if (result.status !== 0) {
    console.error("Auto-sync failed. Waiting for the next change.");
  }

  if (queued) {
    queued = false;
    scheduleSync("queued changes");
  }
}

function scheduleSync(triggerPath) {
  lastTriggeredPath = triggerPath;
  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(() => {
    timer = undefined;
    runAutoSync();
  }, debounceMs);
}

console.log(`👀 Auto-sync watching ${repoRoot}`);
console.log(`⏱️ Debounce: ${debounceMs}ms${skipChecks ? " · checks disabled" : ""}`);

const watcher = watch(
  repoRoot,
  { recursive: true },
  (_eventType, filename) => {
    if (shouldIgnore(filename)) {
      return;
    }

    scheduleSync(normalizeRelativePath(filename) || "workspace");
  }
);

watcher.on("error", (error) => {
  console.error("Watcher error:", error.message);
  process.exit(1);
});

function shutdown(signal) {
  if (timer) {
    clearTimeout(timer);
  }
  watcher.close();
  console.log(`\n🛑 Auto-sync stopped (${signal}).`);
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
