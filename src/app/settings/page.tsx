import { redirect } from "next/navigation";

import { SETTINGS_NAV_ITEMS } from "./_lib/nav-items";

export default function SettingsIndex() {
  const firstItem = SETTINGS_NAV_ITEMS[0];
  redirect(firstItem?.href ?? "/dashboard");
}
