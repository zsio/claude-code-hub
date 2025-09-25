import { getModelPrices } from "@/actions/model-prices";
import { Section } from "@/components/section";
import { PriceList } from "./_components/price-list";
import { UploadPriceDialog } from "./_components/upload-price-dialog";
import { SettingsPageHeader } from "../_components/settings-page-header";

export const dynamic = "force-dynamic";

interface SettingsPricesPageProps {
  searchParams: Promise<{ required?: string }>;
}

export default async function SettingsPricesPage({
  searchParams
}: SettingsPricesPageProps) {
  const params = await searchParams;
  const prices = await getModelPrices();
  const isRequired = params.required === 'true';
  const isEmpty = prices.length === 0;

  return (
    <>
      <SettingsPageHeader
        title="价格表"
        description="管理平台基础配置与模型价格"
      />

      <Section
        title="模型价格"
        description="管理 AI 模型的价格配置"
        actions={<UploadPriceDialog defaultOpen={isRequired && isEmpty} isRequired={isRequired} />}
      >
        <PriceList prices={prices} />
      </Section>
    </>
  );
}