import "dotenv/config";
import express from "express";
import fs from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in server environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function formatGeminiError(error: unknown): { status: number; message: string } {
  const err = error as { status?: number; message?: string };
  const rawMessage = err?.message || "Unexpected Gemini API error.";
  if (rawMessage.includes("GEMINI_API_KEY")) {
    return {
      status: 500,
      message: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY ใน Settings > Secrets ของระบบ",
    };
  }
  if (rawMessage.includes("PERMISSION_DENIED") || err?.status === 403) {
    return {
      status: 403,
      message: "สิทธิ์การเข้าถึง API Key ไม่ถูกต้อง กรุณาตรวจสอบคีย์ใน Settings > Secrets",
    };
  }
  if (rawMessage.includes("API_KEY_INVALID") || err?.status === 400) {
    return {
      status: 400,
      message: "API Key หรือรูปแบบคำขอไม่ถูกต้อง กรุณาตรวจสอบใน Settings > Secrets",
    };
  }
  if (rawMessage.includes("RESOURCE_EXHAUSTED") || err?.status === 429) {
    return {
      status: 429,
      message: "โควตาการใช้งาน Gemini API เต็มชั่วคราว กรุณารอสักครู่แล้วลองใหม่อีกครั้ง",
    };
  }
  return {
    status: err?.status && err.status >= 400 && err.status < 600 ? err.status : 500,
    message: rawMessage,
  };
}

const ROLE_INSTRUCTIONS: Record<string, string> = {
  analyst:
    "คุณคือผู้เชี่ยวชาญด้านการตรวจสอบกระเป๋า Binance Agentic Wallet และวิเคราะห์สิทธิ์การเคลมรางวัล/NFT (Wallet & Claim Analyst) ตอบคำถามเป็นภาษาไทยที่กระชับ ชัดเจน อิงจากข้อมูลพอร์ตจริงที่แนบมาในบริบทเสมอ ห้ามแต่งตัวเลขหรือสัญญา Smart Contract ขึ้นมาเอง หากข้อมูลแสดงว่า DeFi Position = $0.00 และ Prediction Market pendingClaimCount = 0 ให้ยืนยันตรงตามนั้น พร้อมอธิบายรายละเอียดของ Agent ID (younger.ai), AGM-CARD และ MARSID อย่างแม่นยำ",
  security:
    "คุณคือผู้ตรวจสอบความปลอดภัย Smart Contract และความเสี่ยงโทเคน Web3 (Web3 Security Auditor) ตอบเป็นภาษาไทยอย่างตรงไปตรงมา ชี้ให้เห็นจุดเสี่ยงที่ต้องระวัง เช่น Unpriced/Meme Tokens ที่อาจเป็น Dust Attack หรือไม่มีสภาพคล่อง, ข้อควรระวังก่อนการ Approve สัญญา Smart Contract และวิธีตรวจสอบ Contract Address บน BscScan อย่างปลอดภัย",
  strategist:
    "คุณคือนักวางแผนจัดการพอร์ตบน BNB Smart Chain และการใช้งาน Binance Agentic Wallet CLI (baw) ตอบเป็นภาษาไทยอย่างเป็นระบบ เน้นการวางแผนค่าแก๊ส (เช่น ยอด BNB ปัจจุบันที่มีเพียง 0.00010338 BNB ซึ่งอาจไม่พอสำหรับ Swap/Transfer หลายครั้ง), การจัดลำดับความสำคัญสินทรัพย์ และคำสั่ง `baw` CLI ที่ใช้งานได้จริง",
};

interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.post("/api/wallet/refresh", async (req, res) => {
    const evmAddress =
      typeof req.body?.evmAddress === "string"
        ? req.body.evmAddress.trim()
        : "0x22e1eB91F953A5D5Def8da8eFA7fa49c97dC89FE";

    const rawRpcUrl =
      typeof req.body?.rpcUrl === "string" ? req.body.rpcUrl.trim() : "";
    const rpcUrl = /^https:\/\/[a-zA-Z0-9.-]+(:\d+)?(\/.*)?$/.test(rawRpcUrl)
      ? rawRpcUrl
      : "https://bsc-dataseed.binance.org/";

    if (!/^0x[a-fA-F0-9]{40}$/.test(evmAddress)) {
      res.status(400).json({ error: "รูปแบบ EVM Address ไม่ถูกต้อง" });
      return;
    }

    const checkedAt = new Date().toISOString();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);
      const rpcResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [evmAddress, "latest"],
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!rpcResponse.ok) {
        res.json({
          liveRpcAvailable: false,
          checkedAt,
          message: `BSC RPC ตอบกลับสถานะ ${rpcResponse.status} — แสดงข้อมูลล่าสุดจาก Binance Agentic Wallet`,
        });
        return;
      }

      const rpcData = (await rpcResponse.json()) as { result?: string; error?: { message?: string } };
      if (!rpcData.result) {
        res.json({
          liveRpcAvailable: false,
          checkedAt,
          message: rpcData.error?.message || "ไม่พบผลลัพธ์จาก BSC RPC — ใช้ข้อมูลที่ยืนยันล่าสุด",
        });
        return;
      }

      const wei = BigInt(rpcData.result);
      const whole = wei / 10n ** 18n;
      const frac = (wei % 10n ** 18n).toString().padStart(18, "0").slice(0, 8);
      const bnbBalance = Number(`${whole}.${frac}`);

      res.json({
        liveRpcAvailable: true,
        checkedAt,
        bnbBalance,
        message: "ซิงก์ยอด BNB บน BSC RPC สำเร็จ",
      });
    } catch {
      res.json({
        liveRpcAvailable: false,
        checkedAt,
        message: "เครือข่าย Sandbox จำกัดการเชื่อมต่อ BSC RPC ภายนอก — แสดงข้อมูลยืนยันจาก baw CLI",
      });
    }
  });

  app.post("/api/wallet/bsc-tx-history", async (req, res) => {
    const rawLimit = Number(req.body?.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 100 ? Math.floor(rawLimit) : 10;
    const rawChainId = typeof req.body?.chainId === "string" ? req.body.chainId.trim() : "56";
    const chainId = /^[a-zA-Z0-9_]{1,16}$/.test(rawChainId) ? rawChainId : "56";

    try {
      const env = { ...process.env };
      if ((env.HTTPS_PROXY || env.HTTP_PROXY) && !env.NODE_USE_ENV_PROXY) {
        env.NODE_USE_ENV_PROXY = "1";
      }

      const { stdout } = await execFileAsync(
        "baw",
        ["wallet", "tx-history", "--binanceChainId", chainId, "--size", String(limit), "--type", "all", "--json"],
        { env, timeout: 6000, maxBuffer: 5 * 1024 * 1024 }
      );

      const parsed = JSON.parse(stdout) as Record<string, unknown>;
      if (parsed?.success === false) {
        res.json({
          source: "baw-cli",
          transactions: [],
          message: "baw CLI ยังไม่ได้เข้าสู่ระบบในเซิร์ฟเวอร์นี้ กรุณารันคำสั่ง baw auth signin แล้วลองสคริปต์บนเครื่องของคุณ",
        });
        return;
      }

      const dataObj = parsed?.data as Record<string, unknown> | undefined;
      const list = (dataObj?.list || dataObj?.transactions || dataObj?.records || parsed?.list || []) as Array<
        Record<string, unknown>
      >;

      const transactions = list.slice(0, limit).map((tx) => {
        const rawTime = tx.timestamp || tx.txTime || tx.blockTime || tx.createdAt;
        const tsNum = Number(rawTime);
        const timestamp = rawTime
          ? new Date(tsNum > 1e12 ? tsNum : tsNum * 1000 || String(rawTime)).toLocaleString("th-TH")
          : "-";

        return {
          hash: String(tx.txHash || tx.hash || tx.transactionHash || "-"),
          status: String(tx.status || tx.txStatus || "unknown"),
          type: String(tx.txType || tx.type || tx.category || (tx.tokenId ? "NFT" : "TRANSFER")),
          asset: String(tx.symbol || tx.tokenSymbol || tx.nftName || "BNB"),
          amount: String(tx.amount ?? tx.value ?? (tx.tokenId ? `#${tx.tokenId}` : "-")),
          timestamp,
        };
      });

      res.json({
        source: "baw-cli",
        transactions,
        message:
          transactions.length > 0
            ? `ดึงประวัติธุรกรรม BSC ล่าสุด ${transactions.length} รายการสำเร็จ`
            : "ไม่พบรายการธุรกรรมล่าสุดบน BSC จาก baw CLI",
      });
    } catch {
      res.json({
        source: "cli-offline",
        transactions: [],
        message:
          "ไม่พบ baw CLI ที่เข้าสู่ระบบอยู่ในสภาพแวดล้อมเซิร์ฟเวอร์นี้ — ใช้คำสั่ง `baw wallet tx-history --binanceChainId 56 --size 10 --json` หรือ `npm run wallet:monitor-bsc` บนเครื่องที่เชื่อมต่อกระเป๋าแล้ว",
      });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, systemRoleId, walletContext } = req.body as {
        messages?: ChatMessageInput[];
        systemRoleId?: string;
        walletContext?: unknown;
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "กรุณาระบุข้อความสำหรับสนทนา" });
        return;
      }

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== "user" || !lastMessage.content.trim()) {
        res.status(400).json({ error: "ข้อความล่าสุดต้องมาจากผู้ใช้และต้องไม่ว่างเปล่า" });
        return;
      }

      const ai = createGeminiClient();
      const baseInstruction = ROLE_INSTRUCTIONS[systemRoleId || "analyst"] || ROLE_INSTRUCTIONS.analyst;
      const fullSystemInstruction = `${baseInstruction}\n\nข้อมูลกระเป๋าและสินทรัพย์จริงของผู้ใช้ในขณะนี้ (JSON):\n${JSON.stringify(walletContext ?? {}, null, 2)}`;

      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const chat = ai.chats.create({
        model: "gemini-4-hydrogen",
        history,
        config: {
          systemInstruction: fullSystemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");

      const stream = await chat.sendMessageStream({
        message: lastMessage.content,
      });

      for await (const chunk of stream) {
        const text = chunk.text || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      const formatted = formatGeminiError(error);
      if (!res.headersSent) {
        res.status(formatted.status).json({ error: formatted.message });
      } else {
        res.write(`data: ${JSON.stringify({ error: formatted.message })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/gemini/audit", async (req, res) => {
    try {
      const { walletContext } = req.body as { walletContext?: unknown };
      const ai = createGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `วิเคราะห์ภาพรวมพอร์ต Binance Agentic Wallet และสถานะการเคลมรางวัลจากข้อมูล JSON ต่อไปนี้เป็นภาษาไทยที่กระชับและนำไปปฏิบัติได้จริง:\n${JSON.stringify(walletContext ?? {}, null, 2)}`,
        config: {
          systemInstruction:
            "คุณเป็นผู้ตรวจสอบพอร์ตสินทรัพย์ดิจิทัลและสิทธิ์การเคลมรางวัลบน BSC ให้ข้อมูลตามข้อเท็จจริงใน JSON เท่านั้น ไม่แต่งตัวเลขเพิ่ม",
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthSummary: {
                type: Type.STRING,
                description: "สรุปภาพรวมสุขภาพพอร์ต 2-3 ประโยค",
              },
              gasReadiness: {
                type: Type.STRING,
                description: "การประเมินความเพียงพอของค่าแก๊ส BNB สำหรับการโอนหรือเคลม",
              },
              claimStatusVerdict: {
                type: Type.STRING,
                description: "ข้อสรุปสถานะการเคลม Agent ID, NFT, DeFi และ Prediction Market",
              },
              riskFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "ข้อสังเกตหรือความเสี่ยงที่ควรระวัง เช่น เหรียญไม่มีราคาประเมิน หรือ Dust Token",
              },
              actionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "คำแนะนำขั้นตอนถัดไปที่ทำได้จริง 3 ข้อ",
              },
            },
            required: [
              "healthSummary",
              "gasReadiness",
              "claimStatusVerdict",
              "riskFlags",
              "actionPlan",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      res.json(parsed);
    } catch (error) {
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post("/api/gemini/token-brief", async (req, res) => {
    try {
      const { asset, walletSummary } = req.body as {
        asset?: unknown;
        walletSummary?: unknown;
      };

      if (!asset) {
        res.status(400).json({ error: "ไม่พบข้อมูลสินทรัพย์ที่ต้องการวิเคราะห์" });
        return;
      }

      const ai = createGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `วิเคราะห์สินทรัพย์หรือ NFT รายการนี้โดยย่อเป็นภาษาไทย:\nAsset: ${JSON.stringify(asset)}\nWallet Context: ${JSON.stringify(walletSummary ?? {})}`,
        config: {
          systemInstruction:
            "วิเคราะห์สินทรัพย์ Web3 อย่างรัดกุม ตรงไปตรงมา ห้ามเดาราคาตลาดที่ไม่ได้ให้มา และแนะนำคำสั่ง `baw` CLI หรือวิธีตรวจสัญญาที่ปลอดภัย",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classification: {
                type: Type.STRING,
                description: "ประเภทสินทรัพย์ เช่น Gas Token, Ecosystem Token, NFT Card, Unpriced Meme/Airdrop",
              },
              valuationNote: {
                type: Type.STRING,
                description: "หมายเหตุเรื่องมูลค่าและสภาพคล่องโดยอิงจากข้อมูลที่มี",
              },
              securityChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "ข้อควรตรวจสอบด้านความปลอดภัย 2-3 ข้อ",
              },
              suggestedBawCommand: {
                type: Type.STRING,
                description: "คำสั่ง baw CLI ตัวอย่างที่เกี่ยวข้อง เช่น baw wallet balance หรือ baw token info",
              },
              summary: {
                type: Type.STRING,
                description: "คำแนะนำสั้นๆ 1-2 ประโยคสำหรับผู้ถือครอง",
              },
            },
            required: [
              "classification",
              "valuationNote",
              "securityChecklist",
              "suggestedBawCommand",
              "summary",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      res.json(parsed);
    } catch (error) {
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Younger.ai Wallet Console listening on http://localhost:${PORT}`);
  });
}

startServer();
