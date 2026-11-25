import React, { useState } from "react";
import { Check, Copy, Download, RefreshCw, Terminal } from "lucide-react";
import { WalletProfile } from "../data/walletSnapshot";

interface CliScriptsAndMonitorProps {
  wallet: WalletProfile;
}

interface BscTxItem {
  hash: string;
  status: string;
  type: string;
  asset: string;
  amount: string;
  timestamp: string;
}

const EXPORT_COMMAND = "node scripts/export-wallet-balances.mjs --out wallet-balances.json";
const MONITOR_COMMAND = "baw wallet tx-history --binanceChainId 56 --size 10 --json";
const WATCH_SCRIPT_COMMAND = "node scripts/monitor-bsc-transactions.mjs --watch --interval 15";

export const CliScriptsAndMonitor: React.FC<CliScriptsAndMonitorProps> = ({ wallet }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [txs, setTxs] = useState<BscTxItem[]>([]);
  const [monitorStatus, setMonitorStatus] = useState<string | null>(null);
  const [monitorSource, setMonitorSource] = useState<string | null>(null);
  const [isCheckingTx, setIsCheckingTx] = useState(false);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleDownloadSnapshotJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      exportedAtEpochMs: Date.now(),
      agentId: wallet.agentId,
      evmAddress: wallet.evmAddress,
      solanaAddress: wallet.solanaAddress,
      primaryChain: wallet.primaryChain,
      balances: wallet.assets.map((asset) => ({
        symbol: asset.symbol,
        name: asset.name,
        chain: asset.chain,
        kind: asset.kind,
        balance: asset.balance,
        usdValue: asset.usdValue,
        contractAddress: asset.contractAddress,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallet-balances-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCheckBscHistory = async () => {
    setIsCheckingTx(true);
    setMonitorStatus(null);
    try {
      const response = await fetch("/api/wallet/bsc-tx-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evmAddress: wallet.evmAddress, limit: 10 }),
      });
      const data = await response.json();
      setTxs(Array.isArray(data.transactions) ? data.transactions : []);
      setMonitorSource(data.source || null);
      setMonitorStatus(data.message || "ตรวจสอบประวัติธุรกรรมเสร็จสิ้น");
    } catch {
      setMonitorStatus("ไม่สามารถเชื่อมต่อ API ตรวจสอบธุรกรรมได้ในขณะนี้");
    } finally {
      setIsCheckingTx(false);
    }
  };

  return (
    <section
      id="cli-scripts"
      className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] overflow-hidden"
    >
      <div className="border-b border-[var(--border-hairline)] p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            สคริปต์ baw CLI และตัวติดตามธุรกรรม BSC (10 รายการล่าสุด)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            ส่งออกยอดโทเคนทั้งหมดเป็น JSON พร้อม Timestamp และคำสั่งติดตามธุรกรรม/NFT บน BSC (Chain ID 56)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadSnapshotJson}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>ดาวน์โหลด Balances JSON</span>
          </button>
          <button
            type="button"
            onClick={handleCheckBscHistory}
            disabled={isCheckingTx}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] disabled:opacity-60 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCheckingTx ? "animate-spin" : ""}`} />
            <span>{isCheckingTx ? "กำลังดึงข้อมูล..." : "เช็ก 10 ธุรกรรมล่าสุด"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-[var(--border-hairline)] lg:grid-cols-2 lg:divide-y-0 lg:divide-x">
        {/* Script 1: Export Balances */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Terminal className="h-4 w-4 text-[var(--highlight-text)]" />
              <span>1. สคริปต์บันทึกยอดโทเคนทั้งหมดเป็น JSON</span>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              scripts/export-wallet-balances.mjs
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            เรียกใช้คำสั่ง <code className="font-mono text-[var(--text-primary)]">baw wallet balance --json</code>{" "}
            พร้อมแนบ Timestamp (<code className="font-mono text-[var(--text-primary)]">exportedAt</code>) และบันทึกเป็นไฟล์ JSON
          </p>
          <div className="flex items-center justify-between gap-2 rounded-lg bg-[var(--code-bg)] px-3 py-2.5">
            <code className="font-mono text-xs text-[var(--code-fg)] overflow-x-auto whitespace-nowrap">
              {EXPORT_COMMAND}
            </code>
            <button
              type="button"
              onClick={() => handleCopy("export", EXPORT_COMMAND)}
              aria-label="คัดลอกคำสั่ง Export Balances"
              className="rounded p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
            >
              {copiedId === "export" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Script 2: Monitor 10 BSC Transactions / NFT Transfers */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Terminal className="h-4 w-4 text-[var(--highlight-text)]" />
              <span>2. คำสั่งติดตาม 10 ธุรกรรมและ NFT ล่าสุดบน BSC</span>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)]">Chain ID 56</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 rounded-lg bg-[var(--code-bg)] px-3 py-2">
              <code className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-nowrap">
                {MONITOR_COMMAND}
              </code>
              <button
                type="button"
                onClick={() => handleCopy("monitor-cli", MONITOR_COMMAND)}
                aria-label="คัดลอกคำสั่ง baw wallet tx-history"
                className="rounded p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
              >
                {copiedId === "monitor-cli" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-[var(--code-bg)] px-3 py-2">
              <code className="font-mono text-xs text-slate-200 overflow-x-auto whitespace-nowrap">
                {WATCH_SCRIPT_COMMAND}
              </code>
              <button
                type="button"
                onClick={() => handleCopy("monitor-watch", WATCH_SCRIPT_COMMAND)}
                aria-label="คัดลอกคำสั่ง Watch Script"
                className="rounded p-1 text-slate-400 hover:text-white shrink-0 cursor-pointer"
              >
                {copiedId === "monitor-watch" ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Check Output */}
      {(monitorStatus || txs.length > 0) && (
        <div className="border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[var(--text-primary)]">
              ผลลัพธ์การตรวจสอบ BSC (Chain ID 56)
            </span>
            {monitorSource && (
              <span className="font-mono text-[var(--text-muted)]">Source: {monitorSource}</span>
            )}
          </div>
          {monitorStatus && <p className="text-xs text-[var(--text-secondary)]">{monitorStatus}</p>}
          {txs.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                    <th className="py-2 px-3">เวลา</th>
                    <th className="py-2 px-3">ประเภท</th>
                    <th className="py-2 px-3">สินทรัพย์ / จำนวน</th>
                    <th className="py-2 px-3">สถานะ</th>
                    <th className="py-2 px-3">Tx Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)] font-mono tabular-nums">
                  {txs.map((tx, idx) => (
                    <tr key={`${tx.hash}-${idx}`}>
                      <td className="py-2 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                        {tx.timestamp}
                      </td>
                      <td className="py-2 px-3 text-[var(--text-primary)]">{tx.type}</td>
                      <td className="py-2 px-3 text-[var(--text-primary)]">
                        {tx.asset} ({tx.amount})
                      </td>
                      <td className="py-2 px-3 text-[var(--text-secondary)]">{tx.status}</td>
                      <td className="py-2 px-3 text-[var(--text-muted)]">
                        {tx.hash.length > 18
                          ? `${tx.hash.slice(0, 10)}...${tx.hash.slice(-6)}`
                          : tx.hash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
