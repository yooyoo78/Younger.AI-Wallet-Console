import React, { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Terminal,
} from "lucide-react";
import {
  DEFAULT_WALLET_SETTINGS,
  WalletConnectionSettings,
  WalletProfile,
} from "../data/walletSnapshot";

interface WalletSettingsPanelProps {
  settings: WalletConnectionSettings;
  wallet: WalletProfile;
  onSaveSettings: (next: WalletConnectionSettings) => void;
  onRefreshRpc: () => void;
  isRefreshingRpc: boolean;
  onRunAudit: () => void;
  isAuditing: boolean;
  onGoToCliMonitor: () => void;
}

const CHAIN_OPTIONS = [
  { id: "56", label: "56 · BNB Smart Chain (BSC)" },
  { id: "1", label: "1 · Ethereum Mainnet" },
  { id: "42161", label: "42161 · Arbitrum One" },
  { id: "8453", label: "8453 · Base" },
  { id: "137", label: "137 · Polygon" },
  { id: "CT_501", label: "CT_501 · Solana" },
];

export const WalletSettingsPanel: React.FC<WalletSettingsPanelProps> = ({
  settings,
  wallet,
  onSaveSettings,
  onRefreshRpc,
  isRefreshingRpc,
  onRunAudit,
  isAuditing,
  onGoToCliMonitor,
}) => {
  const [form, setForm] = useState<WalletConnectionSettings>(settings);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedCmdId, setCopiedCmdId] = useState<string | null>(null);
  const [lastCopiedCmd, setLastCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const prefix = form.useEnvProxy ? "NODE_USE_ENV_PROXY=1 " : "";

  const cliButtons = [
    {
      id: "status",
      label: "เช็กสถานะกระเป๋า (Status)",
      command: `${prefix}baw wallet status --json`,
    },
    {
      id: "balance",
      label: "ดึงยอดโทเคนทั้งหมด (Balance)",
      command: `${prefix}baw wallet balance --json`,
    },
    {
      id: "tx10",
      label: `10 ธุรกรรมล่าสุด (Chain ${form.defaultChainId})`,
      command: `${prefix}baw wallet tx-history --binanceChainId ${form.defaultChainId} --size 10 --type all --json`,
    },
    {
      id: "export",
      label: "สคริปต์ส่งออก Balances JSON",
      command: `${prefix}node scripts/export-wallet-balances.mjs --out wallet-balances.json`,
    },
    {
      id: "signin",
      label: "สร้างลิงก์ Sign In เชื่อมกระเป๋า",
      command: `${prefix}baw auth signin`,
    },
    {
      id: "verify",
      label: "ยืนยันการจับคู่กระเป๋า (Verify)",
      command: `${prefix}baw auth verify`,
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaveMessage(null);

    const trimmedEvm = form.evmAddress.trim();
    const trimmedRpc = form.bscRpcUrl.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedEvm)) {
      setFormError("กรุณากรอก EVM Address ให้ถูกต้อง (ขึ้นต้นด้วย 0x ตามด้วยตัวอักษร 40 หลัก)");
      return;
    }
    if (!/^https:\/\/.+/.test(trimmedRpc)) {
      setFormError("BSC RPC URL ต้องขึ้นต้นด้วย https://");
      return;
    }

    const cleaned: WalletConnectionSettings = {
      agentId: form.agentId.trim() || DEFAULT_WALLET_SETTINGS.agentId,
      evmAddress: trimmedEvm,
      solanaAddress: form.solanaAddress.trim() || DEFAULT_WALLET_SETTINGS.solanaAddress,
      bscRpcUrl: trimmedRpc,
      defaultChainId: form.defaultChainId,
      useEnvProxy: form.useEnvProxy,
    };
    onSaveSettings(cleaned);
    setSaveMessage("บันทึกการตั้งค่าการเชื่อมกระเป๋าเรียบร้อยแล้ว");
    setTimeout(() => setSaveMessage(null), 2600);
  };

  const handleResetDefaults = () => {
    setForm(DEFAULT_WALLET_SETTINGS);
    onSaveSettings(DEFAULT_WALLET_SETTINGS);
    setFormError(null);
    setSaveMessage("คืนค่าเริ่มต้นของกระเป๋า younger.ai แล้ว");
    setTimeout(() => setSaveMessage(null), 2600);
  };

  const handleCopyCommand = async (id: string, command: string) => {
    setLastCopiedCmd(command);
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCmdId(id);
      setTimeout(() => setCopiedCmdId(null), 1800);
    } catch {
      // Clipboard blocked; still show preview
    }
  };

  const handleDownloadJson = () => {
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

  return (
    <section className="space-y-6">
      {/* Connection Settings Form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 space-y-5"
      >
        <div className="border-b border-[var(--border-hairline)] pb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            ตั้งค่ารายละเอียดการเชื่อมกระเป๋า
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            กำหนด Address, เครือข่ายหลัก และ RPC สำหรับซิงก์ข้อมูลและสร้างคำสั่ง baw CLI อัตโนมัติ
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="setting-agent-id" className="block text-xs font-semibold text-[var(--text-secondary)]">
              Agent ID (.ai Domain)
            </label>
            <input
              id="setting-agent-id"
              type="text"
              value={form.agentId}
              onChange={(e) => setForm((prev) => ({ ...prev, agentId: e.target.value }))}
              className="w-full min-h-[44px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3.5 text-sm font-mono text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:bg-[var(--bg-surface)] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="setting-chain-id" className="block text-xs font-semibold text-[var(--text-secondary)]">
              เครือข่ายหลักสำหรับคำสั่ง (Chain ID)
            </label>
            <select
              id="setting-chain-id"
              value={form.defaultChainId}
              onChange={(e) => setForm((prev) => ({ ...prev, defaultChainId: e.target.value }))}
              className="w-full min-h-[44px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3.5 text-sm text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:bg-[var(--bg-surface)] focus:outline-none cursor-pointer"
            >
              {CHAIN_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="setting-evm" className="block text-xs font-semibold text-[var(--text-secondary)]">
              EVM Address (BSC / ETH / Arbitrum / Base / Polygon)
            </label>
            <input
              id="setting-evm"
              type="text"
              value={form.evmAddress}
              onChange={(e) => setForm((prev) => ({ ...prev, evmAddress: e.target.value }))}
              className="w-full min-h-[44px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3.5 text-xs sm:text-sm font-mono text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:bg-[var(--bg-surface)] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="setting-solana" className="block text-xs font-semibold text-[var(--text-secondary)]">
              Solana Address
            </label>
            <input
              id="setting-solana"
              type="text"
              value={form.solanaAddress}
              onChange={(e) => setForm((prev) => ({ ...prev, solanaAddress: e.target.value }))}
              className="w-full min-h-[44px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3.5 text-xs sm:text-sm font-mono text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:bg-[var(--bg-surface)] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="setting-rpc" className="block text-xs font-semibold text-[var(--text-secondary)]">
              BSC RPC Endpoint (HTTPS)
            </label>
            <input
              id="setting-rpc"
              type="url"
              value={form.bscRpcUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, bscRpcUrl: e.target.value }))}
              className="w-full min-h-[44px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3.5 text-xs sm:text-sm font-mono text-[var(--text-primary)] focus:border-[var(--border-strong)] focus:bg-[var(--bg-surface)] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-4 py-3">
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-[var(--text-primary)]">
              เปิดใช้ Proxy สำหรับ CLI (NODE_USE_ENV_PROXY=1)
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              แนะนำสำหรับเครื่องหรือ Sandbox ที่เชื่อมต่อ Binance ผ่าน Proxy
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.useEnvProxy}
            onClick={() => setForm((prev) => ({ ...prev, useEnvProxy: !prev.useEnvProxy }))}
            className={`min-h-[40px] min-w-[68px] rounded-xl px-3 text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              form.useEnvProxy
                ? "bg-[var(--accent-bg)] text-[var(--accent-fg)]"
                : "border border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
            }`}
          >
            {form.useEnvProxy ? "เปิดอยู่" : "ปิดอยู่"}
          </button>
        </div>

        {formError && (
          <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-xs text-[var(--danger-text)]">
            {formError}
          </div>
        )}

        {saveMessage && (
          <div className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-4 py-3 text-xs font-medium text-[var(--positive-text)]">
            {saveMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--accent-bg)] px-5 py-2.5 text-xs font-semibold text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] cursor-pointer whitespace-nowrap"
          >
            <Save className="h-4 w-4" />
            <span>บันทึกการตั้งค่า</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" />
            <span>คืนค่าเริ่มต้น</span>
          </button>
        </div>
      </form>

      {/* Button-Driven Wallet Actions & One-Tap CLI Commands */}
      <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 space-y-5">
        <div className="border-b border-[var(--border-hairline)] pb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            คำสั่งแบบปุ่มกด (One-Tap Actions & CLI Buttons)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            แตะเพื่อสั่งงานระบบทันที หรือคัดลอกคำสั่ง baw CLI ที่ประกอบค่าจากด้านบนไว้พร้อมใช้งาน
          </p>
        </div>

        {/* Live In-App Action Buttons */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-[var(--text-muted)]">
            การทำงานในแอปทันที
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={onRefreshRpc}
              disabled={isRefreshingRpc}
              className="flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-3 text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-60 cursor-pointer"
            >
              <span>{isRefreshingRpc ? "กำลังซิงก์ยอด BNB..." : "ซิงก์ยอด BNB จาก RPC"}</span>
              <RefreshCw className={`h-4 w-4 shrink-0 ${isRefreshingRpc ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={onRunAudit}
              disabled={isAuditing}
              className="flex min-h-[48px] items-center justify-between gap-3 rounded-xl bg-[var(--accent-bg)] px-4 py-3 text-left text-xs font-semibold text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] disabled:opacity-60 cursor-pointer"
            >
              <span>{isAuditing ? "กำลังวิเคราะห์พอร์ต..." : "วิเคราะห์พอร์ตด้วย Gemini AI"}</span>
              <Sparkles className="h-4 w-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              <span>ดาวน์โหลด Balances JSON</span>
              <Download className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            </button>

            <button
              type="button"
              onClick={onGoToCliMonitor}
              className="flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            >
              <span>เปิดดูตัวติดตาม 10 ธุรกรรม BSC</span>
              <Terminal className="h-4 w-4 shrink-0 text-[var(--highlight-text)]" />
            </button>
          </div>
        </div>

        {/* One-Tap Copy CLI Command Buttons */}
        <div className="space-y-2.5 border-t border-[var(--border-hairline)] pt-4">
          <div className="text-xs font-semibold text-[var(--text-muted)]">
            แตะปุ่มเพื่อคัดลอกคำสั่ง baw CLI
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {cliButtons.map((btn) => {
              const isCopied = copiedCmdId === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => handleCopyCommand(btn.id, btn.command)}
                  className="flex min-h-[48px] items-center justify-between gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3.5 py-2.5 text-left text-xs font-medium text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer"
                >
                  <span className="truncate">{btn.label}</span>
                  {isCopied ? (
                    <Check className="h-4 w-4 shrink-0 text-[var(--positive-text)]" />
                  ) : (
                    <Copy className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                  )}
                </button>
              );
            })}
          </div>

          {lastCopiedCmd && (
            <div className="rounded-xl bg-[var(--code-bg)] px-3.5 py-2.5 space-y-1">
              <div className="text-[11px] text-slate-400">
                คำสั่งที่คัดลอกล่าสุด (พร้อมวางใน Terminal):
              </div>
              <code className="block font-mono text-xs text-[var(--code-fg)] overflow-x-auto whitespace-nowrap">
                {lastCopiedCmd}
              </code>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
