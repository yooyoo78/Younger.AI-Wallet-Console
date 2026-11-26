import React, { useMemo, useState } from "react";
import { Check, Copy, Search, Sparkles, X } from "lucide-react";
import { TokenBriefResult, WalletAsset } from "../data/walletSnapshot";

interface AssetLedgerProps {
  assets: WalletAsset[];
  agentId: string;
}

type FilterTab = "all" | "valued" | "unpriced" | "nft";
type SortKey = "usd" | "balance" | "symbol";

export const AssetLedger: React.FC<AssetLedgerProps> = ({ assets, agentId }) => {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("usd");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedAsset, setSelectedAsset] = useState<WalletAsset | null>(null);
  const [tokenBrief, setTokenBrief] = useState<TokenBriefResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assets
      .filter((item) => {
        if (filter === "valued") return item.usdValue !== null && item.usdValue > 0;
        if (filter === "unpriced") return item.usdValue === null;
        if (filter === "nft") return item.kind === "nft";
        return true;
      })
      .filter((item) => {
        if (!query) return true;
        return (
          item.symbol.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          item.contractAddress.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === "usd") {
          return (b.usdValue ?? -1) - (a.usdValue ?? -1);
        }
        if (sortBy === "balance") {
          return b.balance - a.balance;
        }
        return a.symbol.localeCompare(b.symbol);
      });
  }, [assets, filter, search, sortBy]);

  const handleCopyContract = async (id: string, address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleAnalyzeAsset = async (asset: WalletAsset) => {
    setSelectedAsset(asset);
    setTokenBrief(null);
    setAnalyzeError(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/gemini/token-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset,
          walletSummary: { agentId, primaryChain: "BNB Smart Chain (BSC)" },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "ไม่สามารถวิเคราะห์สินทรัพย์ได้");
      }
      setTokenBrief(data as TokenBriefResult);
    } catch (error) {
      setAnalyzeError(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเรียก Gemini API"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section
      id="assets"
      className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] overflow-hidden"
    >
      <div className="border-b border-[var(--border-hairline)] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              รายการสินทรัพย์โทเคนและ NFT (BNB Smart Chain)
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              แสดงยอดคงเหลือ มูลค่าประเมิน และเลข Contract Address ทั้งหมด {assets.length} รายการ
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-[var(--bg-subtle)] p-1 overflow-x-auto">
            {(
              [
                { id: "all", label: "ทั้งหมด" },
                { id: "valued", label: "มีมูลค่า" },
                { id: "unpriced", label: "ยังไม่ประเมินราคา" },
                { id: "nft", label: "NFT / Card" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === tab.id
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อโทเคน, สัญลักษณ์ หรือ Contract Address..."
              className="w-full min-h-[44px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:bg-[var(--bg-surface)] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="sort-assets" className="text-xs font-medium text-[var(--text-muted)]">
              เรียงตาม:
            </label>
            <select
              id="sort-assets"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="min-h-[44px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:outline-none cursor-pointer"
            >
              <option value="usd">มูลค่าประเมิน (USD)</option>
              <option value="balance">จำนวนคงเหลือ</option>
              <option value="symbol">ชื่อสัญลักษณ์ (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Touch Cards (< md) */}
      <div className="md:hidden divide-y divide-[var(--border-hairline)]">
        {filteredAssets.length === 0 ? (
          <div className="py-10 px-4 text-center text-sm text-[var(--text-muted)]">
            ไม่พบสินทรัพย์ที่ตรงกับคำค้นหา หรือตัวกรองที่เลือก
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div key={asset.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-[var(--text-primary)]">
                    {asset.symbol}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {asset.kind === "nft"
                      ? "NFT / Card"
                      : asset.kind === "gas"
                      ? "Native Gas"
                      : "BEP-20 Token"}{" "}
                    · {asset.chain}
                  </div>
                </div>

                <div className="text-right font-mono tabular-nums shrink-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {asset.balanceDisplay}
                  </div>
                  <div
                    className={`text-xs ${
                      asset.usdValue !== null && asset.usdValue >= 0.01
                        ? "text-[var(--text-secondary)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {asset.usdDisplay}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyContract(asset.id, asset.contractAddress)}
                  className="flex flex-1 min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[var(--positive-text)]" />
                      <span className="text-[var(--positive-text)]">คัดลอก Contract แล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="font-mono">
                        {asset.contractAddress.slice(0, 6)}...{asset.contractAddress.slice(-4)}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleAnalyzeAsset(asset)}
                  className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[var(--accent-bg)] px-4 text-xs font-semibold text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>วิเคราะห์</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop High-Density Table (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-xs font-semibold text-[var(--text-secondary)]">
              <th className="py-3 px-4">สินทรัพย์</th>
              <th className="py-3 px-4 text-right">จำนวนคงเหลือ</th>
              <th className="py-3 px-4 text-right">มูลค่าประเมิน</th>
              <th className="py-3 px-4">Contract Address</th>
              <th className="py-3 px-4 text-right">ตรวจสอบด้วย AI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)]">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-[var(--text-muted)]">
                  ไม่พบสินทรัพย์ที่ตรงกับคำค้นหา หรือตัวกรองที่เลือก
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[var(--text-primary)]">{asset.symbol}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {asset.kind === "nft"
                        ? "NFT / Card"
                        : asset.kind === "gas"
                        ? "Native Gas"
                        : "BEP-20 Token"}{" "}
                      · {asset.chain}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs sm:text-sm font-medium text-[var(--text-primary)] tabular-nums">
                    {asset.balanceDisplay}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs sm:text-sm tabular-nums">
                    <span
                      className={
                        asset.usdValue !== null && asset.usdValue >= 0.01
                          ? "font-medium text-[var(--text-primary)]"
                          : "text-[var(--text-muted)]"
                      }
                    >
                      {asset.usdDisplay}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[var(--text-secondary)] tabular-nums">
                        {asset.contractAddress.slice(0, 8)}...{asset.contractAddress.slice(-6)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyContract(asset.id, asset.contractAddress)}
                        aria-label={`คัดลอก Contract ของ ${asset.symbol}`}
                        className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        {copiedId === asset.id ? (
                          <Check className="h-3.5 w-3.5 text-[var(--positive-text)]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleAnalyzeAsset(asset)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[var(--highlight-text)]" />
                      <span>วิเคราะห์</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inline Token Brief Inspection Drawer */}
      {selectedAsset && (
        <div className="border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4 sm:p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-[var(--text-muted)]">
                Gemini 3.1 Flash Lite · Fast Asset Brief
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                วิเคราะห์รายการ: {selectedAsset.symbol} ({selectedAsset.balanceDisplay})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAsset(null)}
              aria-label="ปิดแผงวิเคราะห์โทเคน"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 w-1/3 rounded bg-[var(--border-hairline)]" />
              <div className="h-4 w-3/4 rounded bg-[var(--border-hairline)]" />
              <div className="h-4 w-2/3 rounded bg-[var(--border-hairline)]" />
            </div>
          )}

          {analyzeError && !isAnalyzing && (
            <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] p-3 text-xs text-[var(--danger-text)]">
              {analyzeError}
            </div>
          )}

          {tokenBrief && !isAnalyzing && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-sm">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[var(--text-muted)]">
                  การจัดประเภท:{" "}
                  <span className="text-[var(--text-primary)]">{tokenBrief.classification}</span>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">{tokenBrief.summary}</p>
                <p className="text-xs text-[var(--text-muted)]">{tokenBrief.valuationNote}</p>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[var(--text-primary)]">
                  ข้อควรตรวจสอบความปลอดภัย
                </div>
                <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                  {tokenBrief.securityChecklist.map((item, idx) => (
                    <li key={idx}>
                      {idx + 1}. {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-1">
                  <div className="text-xs font-medium text-[var(--text-muted)] mb-1">
                    คำสั่ง baw CLI แนะนำ
                  </div>
                  <code className="block rounded-lg bg-[var(--code-bg)] px-3 py-2 font-mono text-xs text-[var(--code-fg)] overflow-x-auto">
                    {tokenBrief.suggestedBawCommand}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
