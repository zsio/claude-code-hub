import { getProviders } from "@/actions/providers";
import { Section } from "@/components/section";
import { ProviderManager } from "./_components/provider-manager";
import { AddProviderDialog } from "./_components/add-provider-dialog";
import { SettingsPageHeader } from "../_components/settings-page-header";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsProvidersPage() {
  const [providers, session] = await Promise.all([
    getProviders(),
    getSession(),
  ]);

  return (
    <>
      <SettingsPageHeader
        title="供应商管理"
        description="配置 API 服务商并维护可用状态。"
      />

      <Section
        title="服务商管理"
        description="（TPM/RPM/RPD/CC 功能尚未实现，近期即将更新）"
        actions={<AddProviderDialog />}
      >
        <ProviderManager providers={providers} currentUser={session?.user} />
      </Section>
    </>
  );
}