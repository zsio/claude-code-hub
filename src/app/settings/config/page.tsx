import { Section } from "@/components/section";
import { SettingsPageHeader } from "../_components/settings-page-header";

export default function SettingsConfigPage() {
  return (
    <>
      <SettingsPageHeader
        title="配置"
        description="后续将在此管理基础系统参数。"
      />

      <Section title="系统配置" description="暂未开放配置项，敬请期待。">
        <div className="text-sm text-muted-foreground">
          当前没有可配置的项目。
        </div>
      </Section>
    </>
  );
}