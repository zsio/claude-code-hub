"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Globe, Key } from "lucide-react";
import type { ProviderDisplay } from "@/types/provider";
import type { User } from "@/types/user";
import { ProviderForm } from "./forms/provider-form";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { formatTpmDisplay } from "@/lib/utils/validation";
import { PROVIDER_LIMITS } from "@/lib/constants/provider.constants";
import { FormErrorBoundary } from "@/components/form-error-boundary";
import { useProviderEdit } from "./hooks/use-provider-edit";

interface ProviderListItemProps {
  item: ProviderDisplay;
  currentUser?: User;
}

export function ProviderListItem({ item, currentUser }: ProviderListItemProps) {
  const [openEdit, setOpenEdit] = useState(false);
  const canEdit = currentUser?.role === 'admin';

  const {
    enabled,
    togglePending,
    weight,
    setWeight,
    showWeight,
    tpmInfinite,
    setTpmInfinite,
    tpmValue,
    setTpmValue,
    showTpm,
    rpmInfinite,
    setRpmInfinite,
    rpmValue,
    setRpmValue,
    showRpm,
    rpdInfinite,
    setRpdInfinite,
    rpdValue,
    setRpdValue,
    showRpd,
    ccInfinite,
    setCcInfinite,
    ccValue,
    setCcValue,
    showCc,
    handleToggle,
    handleWeightPopover,
    handleTpmPopover,
    handleRpmPopover,
    handleRpdPopover,
    handleCcPopover,
  } = useProviderEdit(item, canEdit);

  return (
    <div className="group relative h-full rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-150 hover:shadow-md hover:border-border focus-within:ring-1 focus-within:ring-primary/20">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-semibold ${enabled ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"}`}>
              ●
            </span>
            <h3 className="text-sm font-semibold text-foreground truncate tracking-tight">{item.name}</h3>
            {/* 编辑按钮 - 仅管理员可见 */}
            {canEdit && (
              <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    aria-label="编辑服务商"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <FormErrorBoundary>
                    <ProviderForm mode="edit" provider={item} onSuccess={() => setOpenEdit(false)} />
                  </FormErrorBoundary>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>启用</span>
            <Switch
              aria-label="启用服务商"
              checked={enabled}
              disabled={!canEdit || togglePending}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </div>

      {/* 内容区改为上下结构 */}
      <div className="space-y-3 mb-3">
        {/* 上：URL 与密钥 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="font-mono text-muted-foreground truncate">{item.url}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Key className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="font-mono text-muted-foreground">{item.maskedKey}</span>
          </div>
        </div>

        {/* 下：5 个配置项（每个 20% 宽度）改为文本样式 */}
        <div className="grid grid-cols-5 gap-2 text-[11px]">
          <div className="min-w-0 text-center">
            <div className="text-muted-foreground">TPM</div>
            {canEdit ? (
              <Popover open={showTpm} onOpenChange={handleTpmPopover}>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full text-center font-medium tabular-nums truncate text-foreground hover:text-primary/80 transition-colors cursor-pointer">
                    <span>{formatTpmDisplay(tpmValue, tpmInfinite)}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" side="bottom" sideOffset={6} className="w-72 p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">TPM（令牌/分）</span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>无限</span>
                      <Switch checked={tpmInfinite} onCheckedChange={setTpmInfinite} aria-label="TPM无限" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={PROVIDER_LIMITS.TPM.MIN / 1000}
                      max={PROVIDER_LIMITS.TPM.MAX / 1000}
                      step={1}
                      value={[Math.round(tpmValue / 1000)]}
                      onValueChange={(v) => !tpmInfinite && setTpmValue(Math.round((v?.[0] ?? PROVIDER_LIMITS.TPM.MIN / 1000) * 1000))}
                      disabled={tpmInfinite}
                    />
                    <span className="w-12 text-right text-xs font-medium">{formatTpmDisplay(tpmValue, tpmInfinite)}</span>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="w-full text-center font-medium tabular-nums truncate text-foreground">
                <span>{formatTpmDisplay(tpmValue, tpmInfinite)}</span>
              </div>
            )}
          </div>

          <div className="min-w-0 text-center">
            <div className="text-muted-foreground">RPM</div>
            {canEdit ? (
              <Popover open={showRpm} onOpenChange={handleRpmPopover}>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full text-center font-medium tabular-nums truncate text-foreground hover:text-primary/80 transition-colors cursor-pointer">
                    <span>{rpmInfinite ? "∞" : rpmValue.toLocaleString()}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" side="bottom" sideOffset={6} className="w-72 p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">RPM（请求/分）</span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>无限</span>
                      <Switch checked={rpmInfinite} onCheckedChange={setRpmInfinite} aria-label="RPM无限" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={PROVIDER_LIMITS.RPM.MIN}
                      max={PROVIDER_LIMITS.RPM.MAX}
                      step={1}
                      value={[rpmInfinite ? PROVIDER_LIMITS.RPM.MIN : rpmValue]}
                      onValueChange={(v) => !rpmInfinite && setRpmValue(v?.[0] ?? PROVIDER_LIMITS.RPM.MIN)}
                      disabled={rpmInfinite}
                    />
                    <span className="w-12 text-right text-xs font-medium">{rpmInfinite ? "∞" : rpmValue.toLocaleString()}</span>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="w-full text-center font-medium tabular-nums truncate text-foreground">
                <span>{rpmInfinite ? "∞" : rpmValue.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="min-w-0 text-center">
            <div className="text-muted-foreground">RPD</div>
            {canEdit ? (
              <Popover open={showRpd} onOpenChange={handleRpdPopover}>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full text-center font-medium tabular-nums truncate text-foreground hover:text-primary/80 transition-colors cursor-pointer">
                    <span>{rpdInfinite ? "∞" : rpdValue.toLocaleString()}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" side="bottom" sideOffset={6} className="w-72 p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">RPD（请求/日）</span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>无限</span>
                      <Switch checked={rpdInfinite} onCheckedChange={setRpdInfinite} aria-label="RPD无限" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={PROVIDER_LIMITS.RPD.MIN}
                      max={PROVIDER_LIMITS.RPD.MAX}
                      step={1}
                      value={[rpdInfinite ? PROVIDER_LIMITS.RPD.MIN : rpdValue]}
                      onValueChange={(v) => !rpdInfinite && setRpdValue(v?.[0] ?? PROVIDER_LIMITS.RPD.MIN)}
                      disabled={rpdInfinite}
                    />
                    <span className="w-12 text-right text-xs font-medium">{rpdInfinite ? "∞" : rpdValue.toLocaleString()}</span>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="w-full text-center font-medium tabular-nums truncate text-foreground">
                <span>{rpdInfinite ? "∞" : rpdValue.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="min-w-0 text-center">
            <div className="text-muted-foreground">CC</div>
            {canEdit ? (
              <Popover open={showCc} onOpenChange={handleCcPopover}>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full text-center font-medium tabular-nums truncate text-foreground hover:text-primary/80 transition-colors cursor-pointer">
                    <span>{ccInfinite ? "∞" : ccValue.toLocaleString()}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" side="bottom" sideOffset={6} className="w-72 p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">CC（并发）</span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>无限</span>
                      <Switch checked={ccInfinite} onCheckedChange={setCcInfinite} aria-label="无限" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={PROVIDER_LIMITS.CC.MIN}
                      max={PROVIDER_LIMITS.CC.MAX}
                      step={1}
                      value={[ccInfinite ? PROVIDER_LIMITS.CC.MIN : ccValue]}
                      onValueChange={(v) => !ccInfinite && setCcValue(v?.[0] ?? PROVIDER_LIMITS.CC.MIN)}
                      disabled={ccInfinite}
                    />
                    <span className="w-12 text-right text-xs font-medium">{ccInfinite ? "∞" : ccValue.toLocaleString()}</span>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="w-full text-center font-medium tabular-nums truncate text-foreground">
                <span>{ccInfinite ? "∞" : ccValue.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="min-w-0 text-center">
            <div className="text-muted-foreground">权重</div>
            {/* 权重编辑 - 仅管理员可编辑 */}
            {canEdit ? (
              <Popover open={showWeight} onOpenChange={handleWeightPopover}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="编辑权重"
                    className="w-full text-center font-medium tabular-nums truncate text-foreground cursor-pointer hover:text-primary/80 transition-colors"
                  >
                    <span>{weight}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="center" side="bottom" sideOffset={6} className="w-64 p-3">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>调整权重</span>
                    <span className="font-medium text-foreground">{weight}</span>
                  </div>
                  <Slider min={PROVIDER_LIMITS.WEIGHT.MIN} max={PROVIDER_LIMITS.WEIGHT.MAX} step={1} value={[weight]} onValueChange={(v) => setWeight(v?.[0] ?? PROVIDER_LIMITS.WEIGHT.MIN)} />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="w-full text-center font-medium tabular-nums truncate text-foreground">
                <span>{weight}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60">
        <span>创建 {item.createdAt}</span>
        <span>更新 {item.updatedAt}</span>
      </div>
    </div>
  );
}