import React, { useEffect, useRef, useState } from "react";
import { RotateCcw, Send, Square, X } from "lucide-react";
import { ChatMessage, ChatRoleId, WalletProfile } from "../data/walletSnapshot";

interface GeminiChatbotProps {
  wallet: WalletProfile;
  isOpen: boolean;
  onClose: () => void;
  queuedPrompt: { id: number; text: string } | null;
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>;
}

const ROLES: { id: ChatRoleId; label: string; description: string }[] = [
  {
    id: "analyst",
    label: "ผู้เชี่ยวชาญพอร์ต",
    description: "ตรวจสินทรัพย์ NFT, Agent ID และรางวัลค้างเคลม",
  },
  {
    id: "security",
    label: "ความปลอดภัย",
    description: "วิเคราะห์ Dust Token และความเสี่ยง Smart Contract",
  },
  {
    id: "strategist",
    label: "ค่าแก๊ส & CLI",
    description: "วางแผน BNB Gas และแนะนำคำสั่ง baw CLI",
  },
];

const QUICK_PROMPTS = [
  "สรุปรายการสินทรัพย์และ NFT ที่เคลมสำเร็จแล้วในกระเป๋า",
  "เหรียญไม่มีราคาในพอร์ตตัวไหนควรระวัง Dust Attack?",
  "BNB ที่มีอยู่ 0.00010338 เพียงพอสำหรับ Swap หรือโอนไหม?",
  "ขอคำสั่ง baw CLI สำหรับดึงประวัติ 10 ธุรกรรมล่าสุดบน BSC",
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  wallet,
  isOpen,
  onClose,
  queuedPrompt,
  chatInputRef,
}) => {
  const [roleId, setRoleId] = useState<ChatRoleId>("analyst");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "สวัสดีครับ ผมเป็นผู้ช่วย Gemini สำหรับกระเป๋า younger.ai (BSC / Solana) คุณสามารถถามเกี่ยวกับยอดโทเคน 11 รายการ, สถานะ NFT (AGM-CARD, MARSID), การตรวจสอบ Dust Token หรือคำสั่ง baw CLI ได้ทันทีครับ",
      createdAt: "พร้อมใช้งาน",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isStreaming) return;

    setChatError(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const assistantId = `assistant-${Date.now() + 1}`;
    const placeholderAssistant: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: "กำลังพิมพ์...",
    };

    const nextMessages = [...messages, userMessage];
    setMessages([...nextMessages, placeholderAssistant]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const apiMessages = nextMessages
        .filter((m) => m.id !== "welcome-msg")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          systemRoleId: roleId,
          walletContext: wallet,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (${response.status})`);
      }

      if (!response.body) {
        throw new Error("ไม่ได้รับสตรีมข้อมูลจากเซิร์ฟเวอร์");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const line = event.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;

          const dataStr = line.slice(6);
          const parsed = JSON.parse(dataStr) as {
            text?: string;
            done?: boolean;
            error?: string;
          };

          if (parsed.error) {
            throw new Error(parsed.error);
          }

          if (parsed.text) {
            accumulatedText += parsed.text;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: accumulatedText } : m
              )
            );
          }
        }
      }

      const finishedTime = new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: m.content || "ขออภัย ไม่ได้รับข้อความตอบกลับจากโมเดล",
                createdAt: finishedTime,
              }
            : m
        )
      );
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content || "หยุดการตอบกลับแล้ว", createdAt: "หยุดชั่วคราว" }
              : m
          )
        );
      } else {
        const msg =
          error instanceof Error ? error.message : "ไม่สามารถเชื่อมต่อ Gemini API ได้";
        setChatError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    if (queuedPrompt && queuedPrompt.text) {
      sendMessage(queuedPrompt.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuedPrompt]);

  const handleResetChat = () => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
    }
    setChatError(null);
    setMessages([
      {
        id: "welcome-msg",
        role: "assistant",
        content:
          "เริ่มบทสนทนาใหม่เรียบร้อยแล้วครับ ถามคำถามเกี่ยวกับกระเป๋า younger.ai, สินทรัพย์ BSC หรือคำสั่ง baw CLI ได้เลย",
        createdAt: "พร้อมใช้งาน",
      },
    ]);
  };

  const activeRole = ROLES.find((r) => r.id === roleId) || ROLES[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right Slide-Over AI Assistant Drawer */}
      <aside
        id="ai-assistant"
        aria-label="ผู้ช่วยวิเคราะห์พอร์ต Gemini AI"
        className="relative z-10 flex h-full w-full max-w-[440px] flex-col border-l border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xl"
      >
        {/* Header & Role Selector */}
        <div className="border-b border-[var(--border-hairline)] p-4 space-y-3 bg-[var(--bg-subtle)]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                ผู้ช่วยวิเคราะห์พอร์ต Gemini AI
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Gemini 4 Hydrogen · Multi-Turn Assistant
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetChat}
                aria-label="ล้างประวัติแชท"
                className="inline-flex items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>ล้างแชท</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="ปิดผู้ช่วย AI"
                className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-lg bg-[var(--bg-canvas)] p-1 border border-[var(--border-hairline)]">
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setRoleId(role.id)}
                className={`rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors truncate cursor-pointer ${
                  roleId === role.id
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{activeRole.description}</p>
        </div>

        {/* Scrollable Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="mb-1 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <span>{msg.role === "user" ? "คุณ" : "Gemini AI"}</span>
                <span aria-hidden="true">·</span>
                <span>{msg.createdAt}</span>
              </div>
              <div
                className={`max-w-[92%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[var(--accent-bg)] text-[var(--accent-fg)]"
                    : "border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                }`}
              >
                {msg.content || (isStreaming ? "กำลังวิเคราะห์ข้อมูลกระเป๋า..." : "")}
              </div>
            </div>
          ))}
          <div ref={threadEndRef} />
        </div>

        {/* Error Banner */}
        {chatError && (
          <div className="mx-4 mb-2 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2 text-xs text-[var(--danger-text)]">
            {chatError}
          </div>
        )}

        {/* Quick Prompts & Input */}
        <div className="border-t border-[var(--border-hairline)] p-3.5 space-y-3 bg-[var(--bg-surface)]">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isStreaming}
                onClick={() => sendMessage(prompt)}
                className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              ref={chatInputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="พิมพ์คำถามเกี่ยวกับสินทรัพย์ NFT หรือคำสั่ง baw..."
              className="flex-1 resize-none rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:bg-[var(--bg-surface)] focus:outline-none"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={() => abortControllerRef.current?.abort()}
                aria-label="หยุดการตอบกลับ"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 shrink-0 cursor-pointer"
              >
                <Square className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="ส่งข้อความ"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-bg)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] disabled:opacity-40 shrink-0 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
      </aside>
    </div>
  );
};
