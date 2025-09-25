"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useTransition } from "react";
import { addProvider, editProvider, removeProvider } from "@/actions/providers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader as AlertHeader,
  AlertDialogTitle as AlertTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ProviderDisplay } from "@/types/provider";
import { validateNumericField, isValidUrl } from "@/lib/utils/validation";
import { PROVIDER_DEFAULTS } from "@/lib/constants/provider.constants";
import { toast } from "sonner";

type Mode = "create" | "edit";

interface ProviderFormProps {
  mode: Mode;
  onSuccess?: () => void;
  provider?: ProviderDisplay; // edit 模式需要，create 可空
}

export function ProviderForm({ mode, onSuccess, provider }: ProviderFormProps) {
  const isEdit = mode === "edit";
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(isEdit ? provider?.name ?? "" : "");
  const [url, setUrl] = useState(isEdit ? provider?.url ?? "" : "");
  const [key, setKey] = useState(""); // 编辑时留空代表不更新
  const [tpm, setTpm] = useState<number | null>(isEdit ? provider?.tpm ?? null : null);
  const [rpm, setRpm] = useState<number | null>(isEdit ? provider?.rpm ?? null : null);
  const [rpd, setRpd] = useState<number | null>(isEdit ? provider?.rpd ?? null : null);
  const [cc, setCc] = useState<number | null>(isEdit ? provider?.cc ?? null : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !url.trim() || (!isEdit && !key.trim())) {
      return;
    }

    if (!isValidUrl(url.trim())) {
      toast.error("请输入有效的URL地址");
      return;
    }

    startTransition(async () => {
      try {
        if (isEdit && provider) {
          const updateData: {
            name?: string;
            url?: string;
            key?: string;
            tpm?: number | null;
            rpm?: number | null;
            rpd?: number | null;
            cc?: number | null;
          } = {
            name: name.trim(),
            url: url.trim(),
            tpm,
            rpm,
            rpd,
            cc,
          };
          if (key.trim()) {
            updateData.key = key.trim();
          }
          const res = await editProvider(provider.id, updateData);
          if (!res.ok) {
            toast.error(res.error || '更新服务商失败');
            return;
          }
        } else {
          const res = await addProvider({
            name: name.trim(),
            url: url.trim(),
            key: key.trim(),
            // 使用配置的默认值：默认不启用、权重=1
            is_enabled: PROVIDER_DEFAULTS.IS_ENABLED,
            weight: PROVIDER_DEFAULTS.WEIGHT,
            tpm,
            rpm,
            rpd,
            cc,
          });
          if (!res.ok) {
            toast.error(res.error || '添加服务商失败');
            return;
          }
          // 重置表单（仅新增）
          setName("");
          setUrl("");
          setKey("");
          setTpm(null);
          setRpm(null);
          setRpd(null);
          setCc(null);
        }
        onSuccess?.();
      } catch (error) {
        console.error(isEdit ? "更新服务商失败:" : "添加服务商失败:", error);
        toast.error(isEdit ? '更新服务商失败' : '添加服务商失败');
      }
    });
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>{isEdit ? "编辑服务商" : "新增服务商"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-name" : "name"}>服务商名称 *</Label>
          <Input
            id={isEdit ? "edit-name" : "name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: 智谱"
            disabled={isPending}
            required
          />
        </div>

        {/* 移除描述字段 */}

        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-url" : "url"}>API 地址 *</Label>
          <Input
            id={isEdit ? "edit-url" : "url"}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="例如: https://open.bigmodel.cn/api/anthropic"
            disabled={isPending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={isEdit ? "edit-key" : "key"}>API 密钥{isEdit ? "（留空不更改）" : " *"}</Label>
          <Input
            id={isEdit ? "edit-key" : "key"}
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={isEdit ? "留空则不更改密钥" : "输入 API 密钥"}
            disabled={isPending}
            required={!isEdit}
          />
          {isEdit && provider ? (
            <div className="text-xs text-muted-foreground">当前密钥: {provider.maskedKey}</div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={isEdit ? "edit-tpm" : "tpm"}>TPM (每分钟Token数)</Label>
            <Input
              id={isEdit ? "edit-tpm" : "tpm"}
              type="number"
              value={tpm?.toString() ?? ""}
              onChange={(e) => setTpm(validateNumericField(e.target.value))}
              placeholder="留空表示无限制"
              disabled={isPending}
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={isEdit ? "edit-rpm" : "rpm"}>RPM (每分钟请求数)</Label>
            <Input
              id={isEdit ? "edit-rpm" : "rpm"}
              type="number"
              value={rpm?.toString() ?? ""}
              onChange={(e) => setRpm(validateNumericField(e.target.value))}
              placeholder="留空表示无限制"
              disabled={isPending}
              min="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={isEdit ? "edit-rpd" : "rpd"}>RPD (每日请求数)</Label>
            <Input
              id={isEdit ? "edit-rpd" : "rpd"}
              type="number"
              value={rpd?.toString() ?? ""}
              onChange={(e) => setRpd(validateNumericField(e.target.value))}
              placeholder="留空表示无限制"
              disabled={isPending}
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={isEdit ? "edit-cc" : "cc"}>并发连接数</Label>
            <Input
              id={isEdit ? "edit-cc" : "cc"}
              type="number"
              value={cc?.toString() ?? ""}
              onChange={(e) => setCc(validateNumericField(e.target.value))}
              placeholder="例如: 10，留空表示无限制"
              disabled={isPending}
              min="1"
            />
          </div>
        </div>

        {isEdit ? (
          <div className="flex items-center justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isPending}>
                  删除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertHeader>
                  <AlertTitle>删除服务商</AlertTitle>
                  <AlertDialogDescription>
                    确定要删除服务商&ldquo;{provider?.name}&rdquo;吗？此操作不可恢复。
                  </AlertDialogDescription>
                </AlertHeader>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (!provider) return;
                      startTransition(async () => {
                        try {
                          const res = await removeProvider(provider.id);
                          if (!res.ok) {
                            toast.error(res.error || '删除服务商失败');
                            return;
                          }
                          onSuccess?.();
                        } catch (e) {
                          console.error("删除服务商失败", e);
                          toast.error('删除服务商失败');
                        }
                      });
                    }}
                  >
                    确认删除
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <Button type="submit" disabled={isPending}>
              {isPending ? "更新中..." : "确认更新"}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "添加中..." : "确认添加"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
