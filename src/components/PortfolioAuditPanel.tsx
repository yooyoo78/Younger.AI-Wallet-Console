import React from "react";
import { AlertTriangle, CheckCircle2, Fuel, RefreshCw, ShieldAlert } from "lucide-react";
import { PortfolioAuditResult } from "../data/walletSnapshot";

interface PortfolioAuditPanelProps {
  audit: PortfolioAuditResult | null;
  isAuditing: boolean;
  auditError: string | null;
  onRunAudit: () => void;
}

export const PortfolioAuditPanel: React.FC<PortfolioAuditPanelProps> = ({
  audit,
  isAuditing,
  auditError,
  onRunAudit,
}) => {
  if (!audit && !isAuditing && !auditError) {
    return (
      <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              รายงานวิเคราะห์พอร์ตและสถานะเคลมอัจฉริยะ (Gemini AI)
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              ให้ Gemini ประเมินความเพียงพอของค่าแก๊ส BNB, ตรวจสอบความเสี่ยงโทเคนที่ยังไม่มีราคา
              และสรุปแผนจัดการพอร์ตทั้งหมดในคลิกเดียว
            </p>
          </div>
          <button
            type="button"
            onClick={onRunAudit}
            className="rounded-lg bg-[var(--accent-bg)] px-4 py-2 text-xs font-semibold text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            เริ่มวิเคราะห์พอร์ตตอนนี้
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
        <div>
          <div className="text-xs font-medium text-[var(--text-muted)]">
            Gemini 4 Hydrogen · Automated Portfolio Intelligence
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            ผลการวิเคราะห์สุขภาพพอร์ตและความพร้อมในการทำธุรกรรม
          </h2>
        </div>
        <button
          type="button"
          onClick={onRunAudit}
          disabled={isAuditing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isAuditing ? "animate-spin" : ""}`} />
          <span>{isAuditing ? "กำลังประมวลผล..." : "วิเคราะห์ใหม่"}</span>
        </button>
      </div>

      {isAuditing && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 animate-pulse">
          <div className="h-24 rounded-lg bg-[var(--bg-subtle)]" />
          <div className="h-24 rounded-lg bg-[var(--bg-subtle)]" />
          <div className="h-24 rounded-lg bg-[var(--bg-subtle)]" />
        </div>
      )}

      {auditError && !isAuditing && (
        <div className="flex items-start gap-3 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger-text)]">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">ไม่สามารถวิเคราะห์พอร์ตได้ในขณะนี้</div>
            <p>{auditError}</p>
          </div>
        </div>
      )}

      {audit && !isAuditing && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                <CheckCircle2 className="h-4 w-4 text-[var(--positive-text)] shrink-0" />
                <span>สรุปภาพรวมพอร์ต</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {audit.healthSummary}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                <Fuel className="h-4 w-4 text-[var(--highlight-text)] shrink-0" />
                <span>ความพร้อมค่าแก๊ส (BNB)</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {audit.gasReadiness}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                <CheckCircle2 className="h-4 w-4 text-[var(--text-primary)] shrink-0" />
                <span>สถานะเคลม & NFT</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {audit.claimStatusVerdict}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 border-t border-[var(--border-hairline)] pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--highlight-text)]">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>จุดสังเกตและความเสี่ยงที่ควรตรวจสอบ</span>
              </div>
              <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                {audit.riskFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-xs text-[var(--text-muted)] mt-0.5 tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                ขั้นตอนแนะนำถัดไป (Action Plan)
              </div>
              <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                {audit.actionPlan.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-xs text-[var(--positive-text)] font-semibold mt-0.5 tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
