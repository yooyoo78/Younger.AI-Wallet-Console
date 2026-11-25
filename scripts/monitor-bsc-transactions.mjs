#!/usr/bin/env node
/**
 * List and optionally monitor the most recent 10 transactions or NFT transfers
 * on BNB Smart Chain (binanceChainId = 56) using the Binance Agentic Wallet CLI (`baw`).
 *
 * Usage:
 *   node scripts/monitor-bsc-transactions.mjs
 *   node scripts/monitor-bsc-transactions.mjs --watch --interval 15
 *   node scripts/monitor-bsc-transactions.mjs --json
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const BSC_CHAIN_ID = "56";
const DEFAULT_LIMIT = 10;

function parseArgs(argv) {
  const watch = argv.includes("--watch");
  const jsonOutput = argv.includes("--json");
  const intervalIdx = argv.indexOf("--interval");
  const intervalSec =
    intervalIdx !== -1 && Number(argv[intervalIdx + 1]) > 0
      ? Number(argv[intervalIdx + 1])
      : 15;
  return { watch, jsonOutput, intervalSec };
}

async function fetchBscRecentTransactions(limit = DEFAULT_LIMIT) {
  const env = { ...process.env };
  if ((env.HTTPS_PROXY || env.HTTP_PROXY) && !env.NODE_USE_ENV_PROXY) {
    env.NODE_USE_ENV_PROXY = "1";
  }

  const { stdout, stderr } = await execFileAsync(
    "baw",
    [
      "wallet",
      "tx-history",
      "--binanceChainId",
      BSC_CHAIN_ID,
      "--size",
      String(limit),
      "--type",
      "all",
      "--json",
    ],
    {
      env,
      maxBuffer: 10 * 1024 * 1024,
    }
  );

  if (stderr && !stdout.trim()) {
    throw new Error(stderr.trim());
  }

  const parsed = JSON.parse(stdout);
  if (parsed && parsed.success === false) {
    const errMsg = parsed.error?.message || JSON.stringify(parsed.error || parsed);
    throw new Error(`baw CLI returned error: ${errMsg}`);
  }

  const rawList =
    parsed?.data?.list ||
    parsed?.data?.transactions ||
    parsed?.data?.records ||
    parsed?.list ||
    parsed?.transactions ||
    (Array.isArray(parsed?.data) ? parsed.data : Array.isArray(parsed) ? parsed : []);

  return rawList.slice(0, limit);
}

function formatRow(tx, index) {
  const hash = tx.txHash || tx.hash || tx.transactionHash || "-";
  const status = tx.status || tx.txStatus || "unknown";
  const type = tx.txType || tx.type || tx.category || (tx.tokenId ? "NFT" : "TRANSFER");
  const asset = tx.symbol || tx.tokenSymbol || tx.nftName || "BNB";
  const amount = tx.amount ?? tx.value ?? (tx.tokenId ? `#${tx.tokenId}` : "-");
  const rawTime = tx.timestamp || tx.txTime || tx.blockTime || tx.createdAt;
  const timeStr = rawTime
    ? new Date(Number(rawTime) > 1e12 ? Number(rawTime) : Number(rawTime) * 1000 || rawTime).toISOString()
    : "-";

  return `${String(index + 1).padStart(2, "0")}. [${status}] ${type} | ${asset} (${amount}) | ${timeStr} | ${hash}`;
}

async function main() {
  const { watch, jsonOutput, intervalSec } = parseArgs(process.argv.slice(2));
  const seenHashes = new Set();

  const pollOnce = async (isInitial) => {
    const txs = await fetchBscRecentTransactions(DEFAULT_LIMIT);

    if (jsonOutput) {
      console.log(
        JSON.stringify(
          {
            checkedAt: new Date().toISOString(),
            binanceChainId: BSC_CHAIN_ID,
            count: txs.length,
            transactions: txs,
          },
          null,
          2
        )
      );
      return;
    }

    const headerTime = new Date().toISOString();
    console.log(`\n=== BSC (Chain ID 56) Recent ${DEFAULT_LIMIT} Transactions & NFT Transfers @ ${headerTime} ===`);

    if (txs.length === 0) {
      console.log("No transactions found on BSC for the current wallet.");
      return;
    }

    txs.forEach((tx, idx) => {
      const hash = tx.txHash || tx.hash || tx.transactionHash || `${idx}`;
      const isNew = !isInitial && !seenHashes.has(hash);
      seenHashes.add(hash);
      console.log(`${isNew ? "[NEW] " : ""}${formatRow(tx, idx)}`);
    });
  };

  await pollOnce(true);

  if (watch) {
    console.log(`\nMonitoring BSC transactions every ${intervalSec}s (Ctrl+C to stop)...`);
    setInterval(() => {
      pollOnce(false).catch((err) => {
        console.error(`[${new Date().toISOString()}] Poll error:`, err.message || err);
      });
    }, intervalSec * 1000);
  }
}

main().catch((error) => {
  console.error("Failed to query BSC transaction history:", error.message || error);
  console.error(
    "Ensure `@binance/agentic-wallet` is installed (`npm i -g @binance/agentic-wallet`) and signed in (`baw auth signin`)."
  );
  process.exit(1);
});
