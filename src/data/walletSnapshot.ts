export type AssetKind = "token" | "nft" | "gas";

export interface WalletAsset {
  id: string;
  symbol: string;
  name: string;
  chain: string;
  balance: number;
  balanceDisplay: string;
  usdValue: number | null;
  usdDisplay: string;
  contractAddress: string;
  kind: AssetKind;
  note: string;
}

export interface ClaimRecord {
  id: string;
  title: string;
  category: "Agent ID" | "NFT & Card" | "DeFi Protocol" | "Prediction Market";
  statusLabel: string;
  statusTone: "claimed" | "clear" | "held";
  identifier: string;
  contractAddress?: string;
  timestampLabel: string;
  detail: string;
  imageUrl?: string;
}

export interface WalletProfile {
  agentId: string;
  agentIdClaimed: boolean;
  walletStatus: "CONNECTED";
  evmAddress: string;
  solanaAddress: string;
  primaryChain: string;
  snapshotUpdatedAt: string;
  deFiTotalValueUsd: number;
  predictionPendingCount: number;
  predictionClaimableUsd: number;
  assets: WalletAsset[];
  claims: ClaimRecord[];
}

export interface PortfolioAuditResult {
  healthSummary: string;
  gasReadiness: string;
  claimStatusVerdict: string;
  riskFlags: string[];
  actionPlan: string[];
}

export interface TokenBriefResult {
  classification: string;
  valuationNote: string;
  securityChecklist: string[];
  suggestedBawCommand: string;
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export type ChatRoleId = "analyst" | "security" | "strategist";

export interface WalletConnectionSettings {
  agentId: string;
  evmAddress: string;
  solanaAddress: string;
  bscRpcUrl: string;
  defaultChainId: string;
  useEnvProxy: boolean;
}

export const DEFAULT_WALLET_SETTINGS: WalletConnectionSettings = {
  agentId: "younger.ai",
  evmAddress: "0x22e1eB91F953A5D5Def8da8eFA7fa49c97dC89FE",
  solanaAddress: "34rWyaBFskzf53E48Btpu2DdYeWVmMETzb7pT5XvsZtN",
  bscRpcUrl: "https://bsc-dataseed.binance.org/",
  defaultChainId: "56",
  useEnvProxy: true,
};

export const INITIAL_WALLET_PROFILE: WalletProfile = {
  agentId: "younger.ai",
  agentIdClaimed: true,
  walletStatus: "CONNECTED",
  evmAddress: "0x22e1eB91F953A5D5Def8da8eFA7fa49c97dC89FE",
  solanaAddress: "34rWyaBFskzf53E48Btpu2DdYeWVmMETzb7pT5XvsZtN",
  primaryChain: "BNB Smart Chain (BSC)",
  snapshotUpdatedAt: "24 พ.ย. 2026 · ยืนยันผ่าน baw CLI",
  deFiTotalValueUsd: 0,
  predictionPendingCount: 0,
  predictionClaimableUsd: 0,
  assets: [
    {
      id: "iao",
      symbol: "IAO",
      name: "IAO Token",
      chain: "BNB Smart Chain",
      balance: 11250,
      balanceDisplay: "11,250",
      usdValue: 0.07,
      usdDisplay: "$0.07",
      contractAddress: "0x0810c5eb5d86d1B8D408F75Bd1f5ABeFb6d79999",
      kind: "token",
      note: "มีราคาประเมินในระบบ",
    },
    {
      id: "bnb",
      symbol: "BNB",
      name: "BNB (Gas Token)",
      chain: "BNB Smart Chain",
      balance: 0.00010338,
      balanceDisplay: "0.00010338",
      usdValue: 0.06,
      usdDisplay: "$0.06",
      contractAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      kind: "gas",
      note: "เหรียญหลักสำหรับจ่ายค่าแก๊สบน BSC",
    },
    {
      id: "ptah",
      symbol: "PTAH",
      name: "PTAH Token",
      chain: "BNB Smart Chain",
      balance: 530.477,
      balanceDisplay: "530.477",
      usdValue: 0.04,
      usdDisplay: "$0.04",
      contractAddress: "0x999980FB8Dff1799C7E9D7F71bCA899e43D39999",
      kind: "token",
      note: "มีราคาประเมินในระบบ",
    },
    {
      id: "agm-card",
      symbol: "AGM-CARD",
      name: "AGM Membership Card",
      chain: "BNB Smart Chain",
      balance: 1,
      balanceDisplay: "1",
      usdValue: null,
      usdDisplay: "ยังไม่มีราคา ($0.00)",
      contractAddress: "0xa1C8189ef8761a1EFD40e165606c57784bEF7F7C",
      kind: "nft",
      note: "ถือครอง NFT / Card อยู่ในกระเป๋า 1 ใบ",
    },
    {
      id: "agent",
      symbol: "AGENT",
      name: "AGENT Token",
      chain: "BNB Smart Chain",
      balance: 9000,
      balanceDisplay: "9,000",
      usdValue: null,
      usdDisplay: "ยังไม่มีราคา ($0.00)",
      contractAddress: "0xA2643B889eEb232708a644f15f70f951773dDEF9",
      kind: "token",
      note: "ยังไม่มีราคาประเมินตลาด",
    },
    {
      id: "agm",
      symbol: "AGM",
      name: "AGM Token",
      chain: "BNB Smart Chain",
      balance: 578.608,
      balanceDisplay: "578.608",
      usdValue: null,
      usdDisplay: "ยังไม่มีราคา ($0.00)",
      contractAddress: "0x0607d3303993924Ba788b48cE5f6ba5440B08e05",
      kind: "token",
      note: "ยังไม่มีราคาประเมินตลาด",
    },
    {
      id: "aisnack",
      symbol: "AISNACK",
      name: "AISNACK Token",
      chain: "BNB Smart Chain",
      balance: 100,
      balanceDisplay: "100",
      usdValue: null,
      usdDisplay: "ยังไม่มีราคา ($0.00)",
      contractAddress: "0x4903Ce0f68f763B8EdBB80A6E9E836373d3190C8",
      kind: "token",
      note: "ยังไม่มีราคาประเมินตลาด",
    },
    {
      id: "caishen",
      symbol: "财神发大财",
      name: "财神发大财",
      chain: "BNB Smart Chain",
      balance: 66.98,
      balanceDisplay: "66.98",
      usdValue: 0.005,
      usdDisplay: "< $0.01",
      contractAddress: "0xb2CBBf2B99Bd5c7e2bB1EE31B8572982d9644444",
      kind: "token",
      note: "มูลค่าน้อยกว่า $0.01",
    },
    {
      id: "clutch",
      symbol: "Clutch",
      name: "Clutch Token",
      chain: "BNB Smart Chain",
      balance: 24.96,
      balanceDisplay: "24.96",
      usdValue: 0.004,
      usdDisplay: "< $0.01",
      contractAddress: "0x2E30c32712a622613E9C948Bd2763Ea39a894444",
      kind: "token",
      note: "มูลค่าน้อยกว่า $0.01",
    },
    {
      id: "yangbaofu",
      symbol: "羊暴富",
      name: "羊暴富",
      chain: "BNB Smart Chain",
      balance: 9.16,
      balanceDisplay: "9.16",
      usdValue: 0.002,
      usdDisplay: "< $0.01",
      contractAddress: "0xfDC9dD822b0ca92B0C13a7571276F323D8CB9c63",
      kind: "token",
      note: "มูลค่าน้อยกว่า $0.01",
    },
    {
      id: "dingliu",
      symbol: "顶流",
      name: "顶流",
      chain: "BNB Smart Chain",
      balance: 6.23,
      balanceDisplay: "6.23",
      usdValue: 0.001,
      usdDisplay: "< $0.01",
      contractAddress: "0xE7A7646b7aF588Ca39b99e9A60DF9Cd70a919853",
      kind: "token",
      note: "มูลค่าน้อยกว่า $0.01",
    },
  ],
  claims: [
    {
      id: "claim-agent-id",
      title: "Agent ID Domain (.ai)",
      category: "Agent ID",
      statusLabel: "เคลมสำเร็จแล้ว",
      statusTone: "claimed",
      identifier: "younger.ai",
      timestampLabel: "ผูกกับกระเป๋าปัจจุบันเรียบร้อย",
      detail: "ชื่อโดเมน Agent ID younger.ai ถูกเคลมและเชื่อมต่อเข้ากับกระเป๋า EVM ของคุณแล้ว",
      imageUrl: "/src/assets/images/marsid_agent_emblem_1795587822440.jpg",
    },
    {
      id: "claim-agm-card",
      title: "AGM-CARD (NFT / Card)",
      category: "NFT & Card",
      statusLabel: "ถือครองอยู่ 1 ใบ",
      statusTone: "held",
      identifier: "AGM-CARD · 1 รายการ",
      contractAddress: "0xa1C8189ef8761a1EFD40e165606c57784bEF7F7C",
      timestampLabel: "BNB Smart Chain",
      detail: "มีการ์ด AGM-CARD อยู่ในกระเป๋าเรียบร้อยแล้ว (ยังไม่มีราคาประเมินตลาด)",
      imageUrl: "/src/assets/images/agm_card_nft_1795587821309.jpg",
    },
    {
      id: "claim-marsid",
      title: "MARSID NFT / Token",
      category: "NFT & Card",
      statusLabel: "รับเข้ากระเป๋าแล้ว",
      statusTone: "claimed",
      identifier: "MARSID · 1 รายการ",
      contractAddress: "0xCBac4faC33aFB361e836E6a0120f5a5aAC9122B3",
      timestampLabel: "09/11/2026",
      detail: "มีประวัติรับ NFT/Token MARSID จากสัญญา Smart Contract เข้าสู่กระเป๋าแล้ว",
    },
    {
      id: "claim-defi",
      title: "DeFi Protocol Positions",
      category: "DeFi Protocol",
      statusLabel: "ไม่มีรายการค้างเคลม",
      statusTone: "clear",
      identifier: "Stake / LP / Lending · $0.00",
      timestampLabel: "ตรวจสอบล่าสุด",
      detail: "ไม่พบ Position หรือผลตอบแทนค้างเคลมในโปรโตคอล DeFi",
    },
    {
      id: "claim-prediction",
      title: "Prediction Market",
      category: "Prediction Market",
      statusLabel: "ไม่มีรางวัลค้างเคลม",
      statusTone: "clear",
      identifier: "Pending: 0 · $0.00",
      timestampLabel: "ตรวจสอบล่าสุด",
      detail: "ไม่มีรางวัลจากการทายผลตลาดที่รอการกด Claim",
    },
  ],
};
