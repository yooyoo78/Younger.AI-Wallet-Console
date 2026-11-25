import React, { useState } from "react";
import { Check, Copy, ExternalLink, MessageSquare, ShieldCheck } from "lucide-react";
import { ClaimRecord } from "../data/walletSnapshot";

interface NftAndClaimsSectionProps {
  claims: ClaimRecord[];
  onAskAiAboutClaim: (prompt: string) => void;
}

export const NftAndClaimsSection: React.FC<NftAndClaimsSectionProps> = ({
  claims,
  onAskAiAboutClaim,
}) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const featuredClaims = claims.filter((c) => Boolean(c.imageUrl));
  const ledgerClaims = claims.filter((c) => !c.imageUrl);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <section id="claims" className="space-y-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            การถือครอง NFT, Agent ID และสถานะเคลมรางวัล
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            ตรวจสอบสถานะการเคลม Agent ID (.ai), NFT ในกระเป๋า และรางวัลจาก DeFi / Prediction Market
          </p>
        </div>
      </div>

      {/* Featured NFT & Agent ID Visual Showcase */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {featuredClaims.map((claim) => {
          const hasError = imgErrors[claim.id];
          return (
            <div
              key={claim.id}
              className="flex flex-col overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] sm:flex-row sm:items-stretch"
            >
              <div className="relative h-44 w-full shrink-0 bg-slate-900 sm:h-auto sm:w-44">
                {claim.imageUrl && !hasError ? (
                  <img
                    src={claim.imageUrl}
                    alt={claim.title}
                    referrerPolicy="no-referrer"
                    onError={() => setImgErrors((prev) => ({ ...prev, [claim.id]: true }))}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 p-4 text-center text-slate-300">
                    <ShieldCheck className="h-8 w-8 text-amber-400 mb-2" />
                    <span className="font-mono text-xs font-semibold">{claim.identifier}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>{claim.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[var(--positive-text)]">
                      {claim.statusLabel}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {claim.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {claim.detail}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-3">
                  <span className="font-mono text-xs font-medium text-[var(--text-primary)]">
                    {claim.identifier}
                  </span>
                  <div className="flex items-center gap-2">
                    {claim.contractAddress && (
                      <button
                        type="button"
                        onClick={() => handleCopy(claim.id, claim.contractAddress!)}
                        className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] cursor-pointer whitespace-nowrap"
                      >
                        {copiedId === claim.id ? (
                          <Check className="h-3 w-3 text-[var(--positive-text)]" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>Contract</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onAskAiAboutClaim(
                          `ช่วยอธิบายรายละเอียด สถานะ และประโยชน์ของ ${claim.title} (${claim.identifier}) ในกระเป๋าของฉัน`
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer whitespace-nowrap"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>ถาม AI</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim Verification Ledger */}
      <div className="divide-y divide-[var(--border-hairline)] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        {ledgerClaims.map((claim) => (
          <div
            key={claim.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>{claim.category}</span>
                <span aria-hidden="true">·</span>
                <span>{claim.timestampLabel}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    claim.statusTone === "claimed"
                      ? "font-semibold text-[var(--positive-text)]"
                      : "font-medium text-[var(--text-secondary)]"
                  }
                >
                  {claim.statusLabel}
                </span>
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">{claim.title}</div>
              <p className="text-xs text-[var(--text-secondary)]">{claim.detail}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {claim.contractAddress && (
                <a
                  href={`https://bscscan.com/address/${claim.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] whitespace-nowrap"
                >
                  <span>BscScan</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <button
                type="button"
                onClick={() =>
                  onAskAiAboutClaim(
                    `ตรวจสอบสถานะ ${claim.title} (${claim.identifier}) และแนะนำวิธีเช็กซ้ำผ่าน baw CLI`
                  )
                }
                className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] cursor-pointer whitespace-nowrap"
              >
                <MessageSquare className="h-3.5 w-3.5 text-[var(--highlight-text)]" />
                <span>สอบถาม AI</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
