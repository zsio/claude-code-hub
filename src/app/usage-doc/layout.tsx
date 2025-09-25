import { Metadata } from 'next'
import { getSession } from "@/lib/auth"
import { DashboardHeader } from "../dashboard/_components/dashboard-header"

export const metadata: Metadata = {
  title: '使用文档 - Claude Code Hub',
  description: 'Claude Code Hub API 代理服务使用文档和指南',
}

/**
 * 文档页面布局
 * 提供文档页面的容器、样式和共用头部
 */
export default async function UsageDocLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-background">
      {/* 共用头部导航 */}
      <DashboardHeader session={session} />

      {/* 文档内容主体 */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* 文档容器 */}
        {children}
      </main>
    </div>
  )
}