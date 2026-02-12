import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const port = process.env.PORT ?? "3001";
const healthUrl = `http://127.0.0.1:${port}/health`;
const startupTimeoutMs = 20_000;
const pollIntervalMs = 500;

const server = spawn("npm", ["run", "serve:http"], {
  env: { ...process.env, PORT: port },
  stdio: "inherit"
});

const shutdown = () => {
  if (!server.killed) {
    server.kill("SIGTERM");
  }
};

process.on("exit", shutdown);
process.on("SIGINT", () => {
  shutdown();
  process.exit(130);
});
process.on("SIGTERM", () => {
  shutdown();
  process.exit(143);
});

async function waitForHealthy() {
  const start = Date.now();
  while (Date.now() - start < startupTimeoutMs) {
    if (server.exitCode !== null) {
      throw new Error(`Server exited before health check passed (exit code ${server.exitCode}).`);
    }

    try {
      const response = await fetch(healthUrl);
      if (response.status === 200) {
        return;
      }
    } catch {
      // Keep polling until timeout.
    }

    await sleep(pollIntervalMs);
  }
  throw new Error(`Timed out waiting for ${healthUrl} to return 200.`);
}

try {
  await waitForHealthy();
  console.log(`Smoke check passed: ${healthUrl}`);
} finally {
  shutdown();
}
