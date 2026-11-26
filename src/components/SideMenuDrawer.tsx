import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Coins,
  LayoutDashboard,
  MessageSquare,
  Palette,
  Settings2,
  ShieldCheck,
  Terminal,
  X,
} from "lucide-react";
import { THEME_OPTIONS, ThemeId, ThemeToneGroup } from "../data/themes";
import { PWAInstallButton } from "./PWAInstallButton";
import { WorkspaceTabId } from "./TopBar";

interface SideMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: WorkspaceTabId;
  onSelectTab: (tab: WorkspaceTabId) => void;
  onOpenChat: () => void;
  activeTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  agentId: string;
}

const NAV_GROUPS: {
  id: string;
  title: string;
  items: {
    id: WorkspaceTabId;
    label: string;
    subtitle: string;
    icon: React.FC<{ className?: string }>;
  }[];
}[] = [
  {
    id: "portfolio",
    title: "ข้อมูลกระเป๋าและสินทรัพย์",
    items: [
      {
        id: "overview",
        label: "ภาพรวมและวิเคราะห์ AI",
        subtitle: "ที่อยู่กระเป๋า, KPI และสรุปสุขภาพพอร์ต",
        icon: LayoutDashboard,
      },
      {
        id: "assets",
        label: "สินทรัพย์โทเคน (11)",
        subtitle: "ยอดคงเหลือ BSC และวิเคราะห์รายเหรียญ",
        icon: Coins,
      },
      {
        id: "claims",
        label: "NFT และเคลมรางวัล (5)",
        subtitle: "Agent ID, AGM-CARD, MARSID, DeFi",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "tools",
    title: "การตั้งค่า คำสั่ง และผู้ช่วย",
    items: [
      {
        id: "settings",
        label: "ตั้งค่าเชื่อมกระเป๋า & ปุ่มคำสั่ง",
        subtitle: "แก้ไข Address, RPC และปุ่มสั่งงาน baw CLI",
        icon: Settings2,
      },
      {
        id: "cli",
        label: "สคริปต์ CLI และติดตาม BSC",
        subtitle: "Export JSON และเช็ก 10 ธุรกรรมล่าสุด",
        icon: Terminal,
      },
      {
        id: "chat",
        label: "ผู้ช่วยวิเคราะห์ Gemini AI",
        subtitle: "แชทถาม-ตอบเจาะลึกข้อมูลกระเป๋า",
        icon: MessageSquare,
      },
    ],
  },
];

const THEME_GROUPS: { id: ThemeToneGroup; label: string }[] = [
  { id: "standard", label: "โทนธรรมดา" },
  { id: "dark", label: "โทนเข้ม (ดำ / เทา / น้ำตาล)" },
  { id: "soft", label: "โทนอ่อน (ครีม / เทาอ่อน)" },
];

export const SideMenuDrawer: React.FC<SideMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenChat,
  activeTheme,
  onSelectTheme,
  agentId,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    portfolio: true,
    tools: true,
    themes: false,
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        aria-label="เมนูนำทางและตั้งค่า"
        className="relative z-10 flex h-full w-full max-w-[330px] flex-col border-r border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] px-5 py-4">
          <div>
            <div className="font-display text-base font-bold text-[var(--text-primary)]">
              Younger.ai
            </div>
            <div className="font-mono text-xs text-[var(--text-muted)]">
              Agent ID: {agentId}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนูด้านข้าง"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {NAV_GROUPS.map((group) => {
            const isExpanded = expandedGroups[group.id] ?? true;
            return (
              <div key={group.id} className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="flex min-h-[40px] w-full items-center justify-between px-2 py-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <span>{group.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.id !== "chat" && activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (item.id === "chat") {
                              onClose();
                              onOpenChat();
                            } else {
                              onSelectTab(item.id);
                              onClose();
                            }
                          }}
                          className={`flex min-h-[48px] w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer ${
                            isActive
                              ? "bg-[var(--accent-bg)] text-[var(--accent-fg)]"
                              : "hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 mt-0.5 shrink-0 ${
                              isActive
                                ? "text-[var(--accent-fg)]"
                                : "text-[var(--text-muted)]"
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium leading-tight">
                              {item.label}
                            </div>
                            <div
                              className={`text-xs mt-0.5 leading-snug ${
                                isActive ? "opacity-80" : "text-[var(--text-muted)]"
                              }`}
                            >
                              {item.subtitle}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="border-t border-[var(--border-hairline)] pt-4 space-y-2">
            <button
              type="button"
              onClick={() => toggleGroup("themes")}
              className="flex min-h-[40px] w-full items-center justify-between px-2 py-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <span className="inline-flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                <span>ธีมสีหน้าจอ (UI Theme)</span>
              </span>
              {expandedGroups.themes ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedGroups.themes && (
              <div className="space-y-3 pt-1">
                {THEME_GROUPS.map((group) => {
                  const options = THEME_OPTIONS.filter((t) => t.group === group.id);
                  return (
                    <div key={group.id} className="space-y-1">
                      <div className="px-2 text-[11px] font-medium text-[var(--text-muted)]">
                        {group.label}
                      </div>
                      <div className="space-y-1">
                        {options.map((option) => {
                          const isSelected = option.id === activeTheme;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => onSelectTheme(option.id)}
                              aria-pressed={isSelected}
                              className={`flex min-h-[44px] w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                                isSelected
                                  ? "border-[var(--accent-bg)] bg-[var(--accent-bg)] text-[var(--accent-fg)]"
                                  : "border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                              }`}
                            >
                              <span className="inline-flex items-center gap-2.5">
                                <span
                                  className="h-3.5 w-3.5 rounded-sm border border-black/20 shrink-0"
                                  style={{
                                    background: `linear-gradient(135deg, ${option.swatchBg} 55%, ${option.swatchAccent} 55%)`,
                                  }}
                                  aria-hidden="true"
                                />
                                <span>{option.label}</span>
                              </span>
                              {isSelected && <span className="text-[11px]">ใช้งานอยู่</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--border-hairline)] p-4">
          <PWAInstallButton variant="drawer" />
        </div>
      </aside>
    </div>
  );
};
