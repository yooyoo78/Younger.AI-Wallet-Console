import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>โหมดออฟไลน์ · กำลังแสดงข้อมูลกระเป๋าล่าสุดที่บันทึกไว้</span>
    </div>
  );
};
