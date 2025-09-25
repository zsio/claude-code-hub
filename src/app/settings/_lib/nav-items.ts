export interface SettingsNavItem {
  href: string;
  label: string;
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { href: "/settings/config", label: "配置" },
  { href: "/settings/prices", label: "价格表" },
  { href: "/settings/providers", label: "供应商" },
];
