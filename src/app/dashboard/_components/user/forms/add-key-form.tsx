"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addKey } from "@/actions/keys";
import { DialogFormLayout } from "@/components/form/form-layout";
import { TextField, DateField } from "@/components/form/form-field";
import { useZodForm } from "@/lib/hooks/use-zod-form";
import { KeyFormSchema } from "@/lib/validation/schemas";

interface AddKeyFormProps {
  userId?: number;
  onSuccess?: (result: { generatedKey: string; name: string }) => void;
}

export function AddKeyForm({ userId, onSuccess }: AddKeyFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useZodForm({
    schema: KeyFormSchema,
    defaultValues: {
      name: '',
      expiresAt: ''
    },
    onSubmit: async (data) => {
      if (!userId) {
        throw new Error("用户ID不存在");
      }

      try {
        const result = await addKey({
          userId: userId!,
          name: data.name,
          expiresAt: data.expiresAt || undefined
        });

        if (!result.ok) {
          toast.error(result.error || "创建失败，请稍后重试");
          return;
        }

        const payload = result.data;
        if (!payload) {
          toast.error("创建成功但未返回密钥");
          return;
        }

        startTransition(() => {
          onSuccess?.({ generatedKey: payload.generatedKey, name: payload.name });
          router.refresh();
        });
      } catch (err) {
        console.error("添加Key失败:", err);
        // 使用toast显示具体的错误信息
        const errorMessage = err instanceof Error ? err.message : "创建失败，请稍后重试";
        toast.error(errorMessage);
      }
    }
  });

  return (
    <DialogFormLayout
      config={{
        title: "新增 Key",
        description: "为当前用户创建新的API密钥，Key值将自动生成。",
        submitText: "确认创建",
        loadingText: "创建中..."
      }}
      onSubmit={form.handleSubmit}
      isSubmitting={isPending}
      canSubmit={form.canSubmit && !!userId}
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
