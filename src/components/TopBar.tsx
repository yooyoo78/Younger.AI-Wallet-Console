import React from "react";
import { PanelLeft } from "lucide-react";

export type WorkspaceTabId = "overview" | "assets" | "claims" | "cli" | "chat";

interface TopBarProps {
  activeTab: WorkspaceTabId;
  onSelectTab: (tab: WorkspaceTabId) => void;
  onOpenSideMenu: () => void;
  onRunAudit: () => void;
  isAuditing: boolean;
  onOpenChat: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSideMenu,
  onRunAudit,
  isAuditing,
  onOpenChat,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Menu Trigger + Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenSideMenu}
            aria-label="เปิดเมนูและตัวเลือกธีมด้านข้าง"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer whitespace-nowrap shrink-0"
          >
            <PanelLeft className="h-4 w-4" />
            <span>เมนู</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("overview")}
            className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Younger.ai
          </button>
        </div>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--text-secondary)]">
          <button
            type="button"
            onClick={() => onSelectTab("overview")}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "overview"
                ? "text-[var(--text-primary)] font-semibold underline underline-offset-8 decoration-2"
                : "hover:text-[var(--text-primary)]"
            }`}
          >
            ภาพรวมพอร์ต
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("assets")}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "assets"
                ? "text-[var(--text-primary)] font-semibold underline underline-offset-8 decoration-2"
                : "hover:text-[var(--text-primary)]"
            }`}
          >
            สินทรัพย์โทเคน
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("claims")}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === "claims"
                ? "text-[var(--text-primary)] font-semibold underline underline-offset-8 decoration-2"
                : "hover:text-[var(--text-primary)]"
            }`}
          >
            NFT และเคลมรางวัล
          </button>
          <button
            type="button"
            onClick={onOpenChat}
            className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            ผู้ช่วย AI
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onRunAudit}
            disabled={isAuditing}
            className="rounded-lg bg-[var(--accent-bg)] px-4 py-2 text-xs font-semibold text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-bg)]"
          >
            {isAuditing ? "กำลังวิเคราะห์พอร์ต..." : "วิเคราะห์พอร์ตด้วย AI"}
          </button>
        </div>
      </div>
    </header>
  );
};
