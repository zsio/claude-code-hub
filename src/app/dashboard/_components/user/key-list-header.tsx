"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ListPlus, Copy, CheckCircle } from "lucide-react";
import { AddKeyForm } from "./forms/add-key-form";
import { UserActions } from "./user-actions";
import type { UserDisplay } from "@/types/user";
import type { User } from "@/types/user";
import { FormErrorBoundary } from "@/components/form-error-boundary";
import { formatCurrency } from "@/lib/utils/currency";

interface KeyListHeaderProps {
  activeUser: UserDisplay | null;
  currentUser?: User;
}

export function KeyListHeader({ activeUser, currentUser }: KeyListHeaderProps) {
  const [openAdd, setOpenAdd] = useState(false);
  const [keyResult, setKeyResult] = useState<{ generatedKey: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const totalTodayUsage = activeUser?.keys.reduce((sum, key) => sum + (key.todayUsage ?? 0), 0) ?? 0;

  const handleKeyCreated = (result: { generatedKey: string; name: string }) => {
    setOpenAdd(false); // 关闭表单dialog
    setKeyResult(result); // 显示成功dialog
  };

  const handleCopy = async () => {
    if (!keyResult) return;
    try {
      await navigator.clipboard.writeText(keyResult.generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleCloseSuccess = () => {
    setKeyResult(null);
    setCopied(false);
  };

  // 权限检查：管理员可以给所有人添加Key，普通用户只能给自己添加Key
  const canAddKey = currentUser && activeUser && (
    currentUser.role === 'admin' || currentUser.id === activeUser.id
  );

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <span>{activeUser ? activeUser.name : "-"}</span>
            {activeUser && <UserActions user={activeUser} currentUser={currentUser} />}
          </div>
          <div className="mt-1 space-y-1">
            <div className="text-xs text-muted-foreground">
              今日用量 {activeUser ? formatCurrency(totalTodayUsage) : "-"} /  {activeUser ? formatCurrency(activeUser.dailyQuota) : "-"}
            </div>
          </div>
        </div>
        {canAddKey && (
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                disabled={!activeUser}
              >
                <ListPlus className="h-3.5 w-3.5" /> 新增 Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <FormErrorBoundary>
                <AddKeyForm userId={activeUser?.id} onSuccess={handleKeyCreated} />
              </FormErrorBoundary>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Key创建成功弹窗 */}
      <Dialog open={!!keyResult} onOpenChange={(open) => !open && handleCloseSuccess()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Key 创建成功
            </DialogTitle>
            <DialogDescription>
              你的 API Key 已成功创建。请务必复制并妥善保存，此密钥仅显示一次。
            </DialogDescription>
          </DialogHeader>

          {keyResult && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">API Key</label>
                <div className="relative">
                  <div className="p-3 bg-muted/50 rounded-md font-mono text-sm break-all border-2 border-dashed border-orange-300 pr-12">
                    {keyResult.generatedKey}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 p-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-3 w-3 text-orange-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  请在关闭前复制并保存，关闭后将无法再次查看此密钥
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleCloseSuccess} variant="secondary">
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
