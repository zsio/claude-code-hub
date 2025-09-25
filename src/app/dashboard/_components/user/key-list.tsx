"use client";
import { useState } from "react";
import { DataTable, TableColumnTypes } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { KeyActions } from "./key-actions";
import type { UserKeyDisplay } from "@/types/user";
import type { User } from "@/types/user";
import { format } from "timeago.js";
import { formatCurrency } from "@/lib/utils/currency";

interface KeyListProps {
  keys: UserKeyDisplay[];
  currentUser?: User;
  keyOwnerUserId: number; // 这些Key所属的用户ID
}

export function KeyList({ keys, currentUser, keyOwnerUserId }: KeyListProps) {
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const canDeleteKeys = keys.length > 1;

  const handleCopyKey = async (key: UserKeyDisplay) => {
    if (!key.fullKey || !key.canCopy) return;

    try {
      await navigator.clipboard.writeText(key.fullKey);
      setCopiedKeyId(key.id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const columns = [
    TableColumnTypes.text<UserKeyDisplay>('name', '名称', {
      render: (value) => (
        <div className="truncate">{value}</div>
      )
    }),
    TableColumnTypes.text<UserKeyDisplay>('maskedKey', 'Key', {
      render: (_, record: UserKeyDisplay) => (
        <div className="group inline-flex items-center gap-1">
          <div className="font-mono truncate">
            {record.maskedKey || "-"}
          </div>
          {record.canCopy && record.fullKey && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyKey(record)}
              className="h-5 w-5 p-0 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              title="复制完整密钥"
            >
              {copiedKeyId === record.id ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      )
    }),
    TableColumnTypes.text<UserKeyDisplay>('expiresAt', '过期时间'),
    TableColumnTypes.number<UserKeyDisplay>('todayUsage', '今日用量', {
      render: (value) => {
        const amount = typeof value === 'number' ? value : 0;
        return formatCurrency(amount);
      }
    }),
    TableColumnTypes.text<UserKeyDisplay>('createdAt', '创建时间', {
      render: (_, record: UserKeyDisplay) => (
        <div className="space-y-0.5">
          <div className="text-sm">
            {format(record.createdAt)}
          </div>
          <div className="text-xs text-muted-foreground">
            {record.createdAtFormatted}
          </div>
        </div>
      )
    }),
    TableColumnTypes.actions<UserKeyDisplay>('操作', (value, record) => (
      <KeyActions
        keyData={record}
        currentUser={currentUser}
        keyOwnerUserId={keyOwnerUserId}
        canDelete={canDeleteKeys}
      />
    ))
  ];

  return (
    <DataTable
      columns={columns}
      data={keys}
      emptyState={{
        title: "暂无 Key",
        description: '可点击右上角 "新增 Key" 按钮添加密钥'
      }}
      maxHeight="460px"
      stickyHeader
    />
  );
}
