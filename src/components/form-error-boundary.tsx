"use client";

import type { ReactNode } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * 表单专用错误边界 - 用于对话框内表单的错误处理
 */
export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="p-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">表单出错</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {error?.message || '表单加载或提交失败，请重试'}
          </p>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={resetError}>
              <RefreshCw className="w-3 h-3 mr-1" /> 重试
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}