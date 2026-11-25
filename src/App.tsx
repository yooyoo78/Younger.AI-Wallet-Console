import { useEffect, useRef, useState } from "react";
import { AssetLedger } from "./components/AssetLedger";
import { CliScriptsAndMonitor } from "./components/CliScriptsAndMonitor";
import { GeminiChatbot } from "./components/GeminiChatbot";
import { NftAndClaimsSection } from "./components/NftAndClaimsSection";
import { PortfolioAuditPanel } from "./components/PortfolioAuditPanel";
import { SideMenuDrawer } from "./components/SideMenuDrawer";
import { TopBar, WorkspaceTabId } from "./components/TopBar";
import { WalletOverview } from "./components/WalletOverview";
import { THEME_OPTIONS, ThemeId } from "./data/themes";
import {
  INITIAL_WALLET_PROFILE,
  PortfolioAuditResult,
  WalletProfile,
} from "./data/walletSnapshot";

const THEME_STORAGE_KEY = "younger_wallet_theme";

const SECTION_LABELS: Record<WorkspaceTabId, string> = {
  overview: "ภาพรวมและวิเคราะห์ AI",
  assets: "สินทรัพย์โทเคน (11)",
  claims: "NFT และเคลมรางวัล (5)",
  cli: "สคริปต์ CLI และติดตาม BSC",
  chat: "ผู้ช่วยวิเคราะห์ Gemini AI",
};

export default function App() {
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return "standard";
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved;
    }
    return "standard";
  });

  const [activeTab, setActiveTab] = useState<WorkspaceTabId>("overview");
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [wallet, setWallet] = useState<WalletProfile>(INITIAL_WALLET_PROFILE);
  const [isRefreshingRpc, setIsRefreshingRpc] = useState(false);
  const [rpcFeedback, setRpcFeedback] = useState<{
    message: string;
    live: boolean;
    checkedAt: string;
  } | null>(null);

  const [audit, setAudit] = useState<PortfolioAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const [queuedPrompt, setQueuedPrompt] = useState<{ id: number; text: string } | null>(
    null
  );
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const option = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
    document.documentElement.setAttribute("data-theme", option.id);
    document.documentElement.classList.toggle("dark", option.isDark);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, option.id);
    } catch {
      // Ignore storage error
    }
  }, [theme]);

  const handleRefreshRpc = async () => {
    setIsRefreshingRpc(true);
    try {
      const response = await fetch("/api/wallet/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evmAddress: wallet.evmAddress }),
      });
      const data = await response.json();

      if (data.liveRpcAvailable && typeof data.bnbBalance === "number") {
        setWallet((prev) => ({
          ...prev,
          snapshotUpdatedAt: "ซิงก์สดจาก BSC RPC · ล่าสุด",
          assets: prev.assets.map((asset) =>
            asset.id === "bnb"
              ? {
                  ...asset,
                  balance: data.bnbBalance,
                  balanceDisplay: String(data.bnbBalance),
                }
              : asset
          ),
        }));
      }

      setRpcFeedback({
        live: Boolean(data.liveRpcAvailable),
        message: data.message || "ตรวจสอบแล้ว",
        checkedAt: data.checkedAt || new Date().toISOString(),
      });
    } catch {
      setRpcFeedback({
        live: false,
        message: "ไม่สามารถเชื่อมต่อ BSC RPC ได้ในขณะนี้ — แสดงข้อมูลที่ยืนยันล่าสุด",
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setIsRefreshingRpc(false);
    }
  };

  const handleRunAudit = async () => {
    setActiveTab("overview");
    setIsAuditing(true);
    setAuditError(null);
    try {
      const response = await fetch("/api/gemini/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletContext: wallet }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "ไม่สามารถวิเคราะห์พอร์ตได้");
      }
      setAudit(data as PortfolioAuditResult);
    } catch (error) {
      setAuditError(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API"
      );
    } finally {
      setIsAuditing(false);
    }
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setTimeout(() => chatInputRef.current?.focus(), 120);
  };

  const handleAskAiAboutClaim = (prompt: string) => {
    setQueuedPrompt({ id: Date.now(), text: prompt });
    handleOpenChat();
  };

  const activeThemeLabel =
    THEME_OPTIONS.find((t) => t.id === theme)?.label || "ธรรมดา (คลาสสิก)";

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSideMenu={() => setIsSideMenuOpen(true)}
        onRunAudit={handleRunAudit}
        isAuditing={isAuditing}
        onOpenChat={handleOpenChat}
      />

      <SideMenuDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenChat={handleOpenChat}
        activeTheme={theme}
        onSelectTheme={setTheme}
        agentId={wallet.agentId}
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-8 space-y-6">
        {/* Clean Contextual Breadcrumb Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSideMenuOpen(true)}
              className="hover:text-[var(--text-primary)] underline-offset-4 hover:underline cursor-pointer"
            >
              เมนูทั้งหมด
            </button>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-[var(--text-primary)]">
              {SECTION_LABELS[activeTab]}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsSideMenuOpen(true)}
            className="hover:text-[var(--text-primary)] cursor-pointer"
          >
            ธีม: {activeThemeLabel}
          </button>
        </div>

        {/* Focused Single-View Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <WalletOverview
              wallet={wallet}
              onRefreshRpc={handleRefreshRpc}
              isRefreshingRpc={isRefreshingRpc}
              rpcFeedback={rpcFeedback}
            />
            <PortfolioAuditPanel
              audit={audit}
              isAuditing={isAuditing}
              auditError={auditError}
              onRunAudit={handleRunAudit}
            />
          </div>
        )}

        {activeTab === "assets" && (
          <AssetLedger assets={wallet.assets} agentId={wallet.agentId} />
        )}

        {activeTab === "claims" && (
          <NftAndClaimsSection
            claims={wallet.claims}
            onAskAiAboutClaim={handleAskAiAboutClaim}
          />
        )}

        {activeTab === "cli" && <CliScriptsAndMonitor wallet={wallet} />}
      </main>

      <GeminiChatbot
        wallet={wallet}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        queuedPrompt={queuedPrompt}
        chatInputRef={chatInputRef}
      />

      <footer className="border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] mt-8">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-5 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>Younger.ai Wallet Console · BNB Smart Chain & Solana</span>
          <span>ตรวจสอบข้อมูลและคำสั่ง baw CLI ก่อนเซ็นธุรกรรมทุกครั้ง</span>
        </div>
      </footer>
    </div>
  );
}
