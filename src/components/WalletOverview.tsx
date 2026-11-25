import React, { useState } from "react";
import { Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { WalletProfile } from "../data/walletSnapshot";

interface WalletOverviewProps {
  wallet: WalletProfile;
  onRefreshRpc: () => void;
  isRefreshingRpc: boolean;
  rpcFeedback: { message: string; live: boolean; checkedAt: string } | null;
}

export const WalletOverview: React.FC<WalletOverviewProps> = ({
  wallet,
  onRefreshRpc,
  isRefreshingRpc,
  rpcFeedback,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Ignore clipboard permission denial
    }
  };

  const totalUsd = wallet.assets.reduce(
    (sum, item) => sum + (item.usdValue !== null && item.usdValue >= 0.01 ? item.usdValue : 0),
    0
  );
  const pricedCount = wallet.assets.filter((item) => item.usdValue !== null).length;
  const nftHeldCount = wallet.assets.filter((item) => item.kind === "nft").length;

  return (
    <section id="overview" className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border-hairline)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
            <span>Binance Agentic Wallet</span>
            <span aria-hidden="true">·</span>
            <span className="text-[var(--positive-text)] font-semibold">
              สถานะเชื่อมต่อ: {wallet.walletStatus}
            </span>
            <span aria-hidden="true">·</span>
            <span>{wallet.snapshotUpdatedAt}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] [text-wrap:balance]">
            กระเป๋า Agent ID{" "}
            <span className="font-mono text-[var(--highlight-text)]">{wallet.agentId}</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            ตรวจสอบสินทรัพย์บนเครือข่าย BNB Smart Chain, ประวัติการเคลม NFT และ Agent ID
            พร้อมวิเคราะห์ความเสี่ยงและค่าแก๊สด้วย Gemini AI
          </p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefreshRpc}
            disabled={isRefreshingRpc}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)] disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingRpc ? "animate-spin" : ""}`} />
            <span>{isRefreshingRpc ? "กำลังตรวจสอบ BSC RPC..." : "อัปเดตยอด BNB จาก BSC RPC"}</span>
          </button>
          {rpcFeedback && (
            <p className="text-xs text-[var(--text-muted)] max-w-md lg:text-right">
              <span
                className={
                  rpcFeedback.live
                    ? "text-[var(--positive-text)] font-medium"
                    : "text-[var(--highlight-text)] font-medium"
                }
              >
                {rpcFeedback.live ? "ซิงก์สำเร็จ" : "ใช้ข้อมูลล่าสุดที่ยืนยัน"}
              </span>{" "}
              · {rpcFeedback.message}
            </p>
          )}
        </div>
      </div>

      {/* Wallet Addresses */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3.5">
          <div className="min-w-0 space-y-0.5">
            <div className="text-xs font-medium text-[var(--text-muted)]">
              EVM Address · BSC / Ethereum / Arbitrum / Base / Polygon
            </div>
            <div className="font-mono text-xs sm:text-sm font-medium text-[var(--text-primary)] truncate tabular-nums">
              {wallet.evmAddress}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleCopy("evm", wallet.evmAddress)}
              aria-label="คัดลอก EVM Address"
              className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] cursor-pointer whitespace-nowrap"
            >
              {copiedKey === "evm" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--positive-text)]" />
                  <span className="text-[var(--positive-text)]">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>
            <a
              href={`https://bscscan.com/address/${wallet.evmAddress}`}
              target="_blank"
              rel="noreferrer"
              aria-label="เปิดใน BscScan"
              className="inline-flex items-center justify-center rounded-md border border-[var(--border-hairline)] p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3.5">
          <div className="min-w-0 space-y-0.5">
            <div className="text-xs font-medium text-[var(--text-muted)]">
              Solana Address · Solana Mainnet
            </div>
            <div className="font-mono text-xs sm:text-sm font-medium text-[var(--text-primary)] truncate tabular-nums">
              {wallet.solanaAddress}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleCopy("sol", wallet.solanaAddress)}
              aria-label="คัดลอก Solana Address"
              className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] cursor-pointer whitespace-nowrap"
            >
              {copiedKey === "sol" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--positive-text)]" />
                  <span className="text-[var(--positive-text)]">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>
            <a
              href={`https://solscan.io/account/${wallet.solanaAddress}`}
              target="_blank"
              rel="noreferrer"
              aria-label="เปิดใน Solscan"
              className="inline-flex items-center justify-center rounded-md border border-[var(--border-hairline)] p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <div className="text-xs font-medium text-[var(--text-muted)]">มูลค่าพอร์ตประเมิน (BSC)</div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-[var(--text-primary)] tabular-nums">
            ${totalUsd.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">
            รวมเหรียญที่มีราคาชัดเจน ({pricedCount} รายการ)
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <div className="text-xs font-medium text-[var(--text-muted)]">จำนวนสินทรัพย์ทั้งหมด</div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-[var(--text-primary)] tabular-nums">
            {wallet.assets.length}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">
            โทเคน {wallet.assets.length - nftHeldCount} รายการ · NFT/Card {nftHeldCount} ใบ
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <div className="text-xs font-medium text-[var(--text-muted)]">สถานะ Agent ID & NFT</div>
          <div className="mt-1.5 text-lg font-semibold text-[var(--positive-text)] tabular-nums">
            เคลมแล้ว · {wallet.agentId}
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">
            ถือครอง AGM-CARD 1 ใบ · รับ MARSID แล้ว
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <div className="text-xs font-medium text-[var(--text-muted)]">รางวัลค้างเคลม (DeFi / Prediction)</div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-[var(--text-primary)] tabular-nums">
            {wallet.predictionPendingCount} รายการ
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">
            DeFi ${wallet.deFiTotalValueUsd.toFixed(2)} · Prediction $
            {wallet.predictionClaimableUsd.toFixed(2)}
          </div>
        </div>
      </div>
    </section>
  );
};
