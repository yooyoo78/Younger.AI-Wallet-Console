#!/usr/bin/env node
/**
 * Fetch all token balances from Binance Agentic Wallet CLI (`baw`)
 * and save them into a timestamped JSON file.
 *
 * Usage:
 *   node scripts/export-wallet-balances.mjs
 *   node scripts/export-wallet-balances.mjs --out ./output/balances.json
 */

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function parseOutArg(argv) {
  const outIdx = argv.indexOf("--out");
  if (outIdx !== -1 && argv[outIdx + 1]) {
    return path.resolve(process.cwd(), argv[outIdx + 1]);
  }
  const safeStamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.resolve(process.cwd(), `wallet-balances-${safeStamp}.json`);
}

async function runBawJson(args) {
  const env = { ...process.env };
  if ((env.HTTPS_PROXY || env.HTTP_PROXY) && !env.NODE_USE_ENV_PROXY) {
    env.NODE_USE_ENV_PROXY = "1";
  }

  const { stdout, stderr } = await execFileAsync("baw", [...args, "--json"], {
    env,
    maxBuffer: 10 * 1024 * 1024,
  });

  if (stderr && !stdout.trim()) {
    throw new Error(stderr.trim());
  }

  const parsed = JSON.parse(stdout);
  if (parsed && parsed.success === false) {
    const errMsg = parsed.error?.message || JSON.stringify(parsed.error || parsed);
    throw new Error(`baw CLI returned error: ${errMsg}`);
  }
  return parsed;
}

async function main() {
  const outputPath = parseOutArg(process.argv.slice(2));
  const now = new Date();

  let walletStatus = null;
  try {
    walletStatus = await runBawJson(["wallet", "status"]);
  } catch {
    // Proceed even if status subcommand is unavailable; balance check will verify auth
  }

  const balances = await runBawJson(["wallet", "balance"]);

  const payload = {
    exportedAt: now.toISOString(),
    exportedAtEpochMs: now.getTime(),
    source: "binance-agentic-wallet-cli",
    walletStatus,
    balances,
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2) + "\n", "utf8");

  console.log(`Saved wallet token balances to ${outputPath}`);
  console.log(`Timestamp: ${payload.exportedAt}`);
}

main().catch((error) => {
  console.error("Failed to export wallet balances:", error.message || error);
  console.error(
    "Ensure `@binance/agentic-wallet` is installed (`npm i -g @binance/agentic-wallet`) and signed in (`baw auth signin`)."
  );
  process.exit(1);
});
