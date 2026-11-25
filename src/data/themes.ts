export type ThemeId =
  | "standard"
  | "dark-black"
  | "dark-gray"
  | "dark-brown"
  | "soft-ivory"
  | "soft-mist";

export type ThemeToneGroup = "standard" | "dark" | "soft";

export interface ThemeOption {
  id: ThemeId;
  group: ThemeToneGroup;
  groupLabel: string;
  label: string;
  isDark: boolean;
  swatchBg: string;
  swatchAccent: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "standard",
    group: "standard",
    groupLabel: "ธรรมดา",
    label: "ธรรมดา (คลาสสิก)",
    isDark: false,
    swatchBg: "#F8FAFC",
    swatchAccent: "#0F172A",
  },
  {
    id: "dark-black",
    group: "dark",
    groupLabel: "เข้ม",
    label: "ดำ (Obsidian)",
    isDark: true,
    swatchBg: "#09090B",
    swatchAccent: "#F59E0B",
  },
  {
    id: "dark-gray",
    group: "dark",
    groupLabel: "เข้ม",
    label: "เทาเข้ม (Graphite)",
    isDark: true,
    swatchBg: "#1E232B",
    swatchAccent: "#F8FAFC",
  },
  {
    id: "dark-brown",
    group: "dark",
    groupLabel: "เข้ม",
    label: "น้ำตาลเข้ม (Espresso)",
    isDark: true,
    swatchBg: "#201915",
    swatchAccent: "#D97706",
  },
  {
    id: "soft-ivory",
    group: "soft",
    groupLabel: "อ่อน",
    label: "ครีมอ่อน (Ivory)",
    isDark: false,
    swatchBg: "#FBF8F3",
    swatchAccent: "#78350F",
  },
  {
    id: "soft-mist",
    group: "soft",
    groupLabel: "อ่อน",
    label: "เทาอ่อน (Soft Mist)",
    isDark: false,
    swatchBg: "#EEF2F6",
    swatchAccent: "#334155",
  },
];
