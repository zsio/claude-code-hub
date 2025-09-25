"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { editKey } from "@/actions/keys";
import { DialogFormLayout } from "@/components/form/form-layout";
import { TextField, DateField } from "@/components/form/form-field";
import { useZodForm } from "@/lib/hooks/use-zod-form";
import { KeyFormSchema } from "@/lib/validation/schemas";
import { toast } from "sonner";

interface EditKeyFormProps {
  keyData?: {
    id: number;
    name: string;
    expiresAt: string;
  };
  onSuccess?: () => void;
}

export function EditKeyForm({ keyData, onSuccess }: EditKeyFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const formatExpiresAt = (expiresAt: string) => {
    if (!expiresAt || expiresAt === "永不过期") return "";
    try {
      return new Date(expiresAt).toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

  const form = useZodForm({
    schema: KeyFormSchema,
    defaultValues: {
      name: keyData?.name || '',
      expiresAt: formatExpiresAt(keyData?.expiresAt || "")
    },
    onSubmit: async (data) => {
      if (!keyData) {
        throw new Error("密钥信息不存在");
      }
      
      startTransition(async () => {
        try {
          const res = await editKey(keyData.id, {
            name: data.name,
            expiresAt: data.expiresAt || undefined,
          });
          if (!res.ok) {
            toast.error(res.error || '保存失败');
            return;
          }
          onSuccess?.();
          router.refresh();
        } catch (err) {
          console.error("编辑Key失败:", err);
          toast.error("保存失败，请稍后重试");
        }
      });
    }
  });

  return (
    <DialogFormLayout
      config={{
        title: "编辑 Key",
        description: "修改密钥的名称和过期时间。",
        submitText: "保存修改",
        loadingText: "保存中..."
      }}
      onSubmit={form.handleSubmit}
      isSubmitting={isPending}
      canSubmit={form.canSubmit}
      error={form.errors._form}
    >
      <TextField
        label="Key名称"
        required
        maxLength={64}
        autoFocus
        placeholder="请输入Key名称"
        {...form.getFieldProps('name')}
      />
      
      <DateField
        label="过期时间"
        placeholder="选择过期时间"
        description="留空表示永不过期"
        {...form.getFieldProps('expiresAt')}
      />
    </DialogFormLayout>
  );
}
