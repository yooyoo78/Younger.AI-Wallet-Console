import React from "react";
import { PanelLeft } from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";

export type WorkspaceTabId = "overview" | "assets" | "claims" | "settings" | "cli" | "chat";

interface TopBarProps {
  onSelectOverview: () => void;
  onOpenSideMenu: () => void;
  onRunAudit: () => void;
  isAuditing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSelectOverview,
  onOpenSideMenu,
  onRunAudit,
  isAuditing,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSideMenu}
            aria-label="เปิดเมนูด้านข้าง"
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center gap-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-2.5 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer whitespace-nowrap shrink-0"
          >
            <PanelLeft className="h-4 w-4 shrink-0" />
            <span>เมนู</span>
          </button>

          <button
            type="button"
            onClick={onSelectOverview}
            className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Younger.ai
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton variant="compact" />
          <button
            type="button"
            onClick={onRunAudit}
            disabled={isAuditing}
            className="min-h-[40px] rounded-xl bg-[var(--accent-bg)] px-3.5 py-2 text-xs font-semibold text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-bg)]"
          >
            {isAuditing ? "กำลังวิเคราะห์..." : "วิเคราะห์ AI"}
          </button>
        </div>
      </div>
    </header>
  );
};
