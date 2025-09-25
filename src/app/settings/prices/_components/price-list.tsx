"use client";

import { useState } from "react";
import { Search, Package, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ModelPrice } from "@/types/model-price";

interface PriceListProps {
  prices: ModelPrice[];
}

/**
 * 价格列表组件
 */
export function PriceList({ prices }: PriceListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // 过滤价格数据
  const filteredPrices = prices.filter((price) =>
    price.modelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * 格式化价格显示为每百万token的价格
   */
  const formatPrice = (value?: number): string => {
    if (!value) return "-";
    // 将每token的价格转换为每百万token的价格
    const pricePerMillion = value * 1000000;
    // 格式化为合适的小数位数
    if (pricePerMillion < 0.01) {
      return pricePerMillion.toFixed(4);
    } else if (pricePerMillion < 1) {
      return pricePerMillion.toFixed(3);
    } else if (pricePerMillion < 100) {
      return pricePerMillion.toFixed(2);
    } else {
      return pricePerMillion.toFixed(0);
    }
  };

  /**
   * 获取模型类型标签
   */
  const getModeLabel = (mode?: string) => {
    switch (mode) {
      case "chat":
        return <Badge variant="default">对话</Badge>;
      case "image_generation":
        return <Badge variant="secondary">图像生成</Badge>;
      case "completion":
        return <Badge variant="outline">补全</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索模型名称..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 价格表格 */}
      <div className="border rounded-lg">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-48 whitespace-normal">模型名称</TableHead>
              <TableHead className="w-24">类型</TableHead>
              <TableHead className="w-32 whitespace-normal">提供商</TableHead>
              <TableHead className="w-32 text-right">输入价格 ($/M)</TableHead>
              <TableHead className="w-32 text-right">输出价格 ($/M)</TableHead>
              <TableHead className="w-32">更新时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrices.length > 0 ? (
              filteredPrices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell className="font-mono text-sm whitespace-normal break-words">
                    {price.modelName}
                  </TableCell>
                  <TableCell>{getModeLabel(price.priceData.mode)}</TableCell>
                  <TableCell className="whitespace-normal break-words">
                    {price.priceData.litellm_provider || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-right">
                    {price.priceData.mode === "image_generation" ? (
                      "-"
                    ) : (
                      <span className="text-muted-foreground">
                        ${formatPrice(price.priceData.input_cost_per_token)}/M
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-right">
                    {price.priceData.mode === "image_generation" ? (
                      <span className="text-muted-foreground">
                        ${formatPrice(price.priceData.output_cost_per_image)}/img
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        ${formatPrice(price.priceData.output_cost_per_token)}/M
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(price.createdAt).toLocaleDateString("zh-CN")}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {searchTerm ? (
                      <>
                        <Search className="h-8 w-8 opacity-50" />
                        <p>未找到匹配的模型</p>
                      </>
                    ) : (
                      <>
                        <Package className="h-8 w-8 opacity-50" />
                        <p>暂无价格数据</p>
                        <p className="text-sm">请上传价格表JSON文件</p>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          <span>共 {filteredPrices.length} 个模型价格</span>
        </div>
        <div>
          最后更新：
          {prices.length > 0
            ? new Date(
                Math.max(...prices.map((p) => new Date(p.createdAt).getTime()))
              ).toLocaleDateString("zh-CN")
            : "-"}
        </div>
      </div>
    </div>
  );
}
