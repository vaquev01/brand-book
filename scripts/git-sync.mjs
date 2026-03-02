import { execSync } from "node:child_process";

function sh(cmd) {
  return execSync(cmd, { stdio: "pipe" }).toString("utf8").trim();
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function hasChanges() {
  const out = sh("git status --porcelain");
  return out.length > 0;
}

function buildMessage() {
  const argMsg = process.argv.slice(2).join(" ").trim();
  if (argMsg) return argMsg;
  const ts = new Date().toISOString().replace("T", " ").slice(0, 16);
  return `chore: sync ${ts}`;
}

try {
  console.log("⬇  Pulling latest from remote...");
  try {
    run("git pull --rebase --autostash");
  } catch {
    console.warn("Pull failed or nothing to pull, continuing...");
  }

  if (!hasChanges()) {
    console.log("✅ No local changes to sync.");
    process.exit(0);
  }

  const msg = buildMessage();

  run("git add -A");

  try {
    run(`git commit -m "${msg.replace(/\"/g, "\\\"")}"`);
  } catch {
    console.log("Nothing to commit after staging.");
    process.exit(0);
  }

  console.log("⬆  Pushing to remote...");
  run("git push");
  console.log("✅ Sync done → Railway will auto-deploy from GitHub.");
} catch (e) {
  console.error("Sync failed:", e.message ?? e);
  process.exit(1);
}
