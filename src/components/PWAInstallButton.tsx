import React, { useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface PWAInstallButtonProps {
  variant?: "compact" | "drawer";
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = "compact",
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === "drawer"
            ? "flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[var(--accent-bg)] px-4 py-2.5 text-xs font-semibold text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer whitespace-nowrap"
            : "inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        }
      >
        <Download className="h-3.5 w-3.5 shrink-0" />
        <span>{isAndroid ? "ติดตั้งแอป Android" : "ติดตั้งแอป"}</span>
      </button>
    );
  }

  if (variant === "compact" && !isIOS) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className={
          variant === "drawer"
            ? "flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-subtle)] px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer whitespace-nowrap"
            : "inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        }
      >
        <Smartphone className="h-3.5 w-3.5 shrink-0" />
        <span>{isIOS ? "ติดตั้งบน iOS" : "ติดตั้งเป็นแอป Android"}</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 text-[var(--text-primary)] shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">
                  {isIOS ? "ติดตั้งแอปบน iPhone / iPad" : "ติดตั้งแอปบนมือถือ Android"}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  เปิดใช้งานเต็มหน้าจอแบบ Standalone และดูพอร์ตออฟไลน์ได้
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="ปิดคำแนะนำการติดตั้ง"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>1. แตะปุ่ม แชร์ (Share) บนแถบเครื่องมือ Safari</li>
                <li>2. เลื่อนลงแล้วเลือก เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)</li>
                <li>3. กด เพิ่ม (Add) เพื่อสร้างไอคอนแอป Younger.ai</li>
              </ol>
            ) : (
              <ol className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>1. เปิด URL ของแอปนี้ด้วยเบราว์เซอร์ Chrome บน Android</li>
                <li>2. แตะเมนูสามจุดมุมขวาบนของ Chrome</li>
                <li>3. เลือก ติดตั้งแอป (Install app) หรือ เพิ่มลงหน้าจอหลัก</li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full min-h-[44px] rounded-xl bg-[var(--accent-bg)] text-xs font-semibold text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] cursor-pointer"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}
    </>
  );
};
