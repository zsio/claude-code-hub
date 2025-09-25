'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * 文档目录项
 */
interface TocItem {
  id: string
  text: string
  level: number
}

const headingClasses = {
  h2: 'scroll-m-20 text-2xl font-semibold leading-snug text-foreground',
  h3: 'scroll-m-20 mt-8 text-xl font-semibold leading-snug text-foreground',
  h4: 'scroll-m-20 mt-6 text-lg font-semibold leading-snug text-foreground',
} as const

interface CodeBlockProps {
  code: string
  language: string
}

function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <pre
      data-language={language}
      className="group relative my-5 overflow-x-auto rounded-md bg-black px-4 py-5 font-mono text-[13px] text-white"
    >
      <code className="block whitespace-pre leading-relaxed">{code.trim()}</code>
    </pre>
  )
}

interface UsageDocContentProps {
  origin: string
}

function UsageDocContent({ origin }: UsageDocContentProps) {
  const resolvedOrigin = origin || '当前站点地址'

  return (
    <article className="space-y-12 text-[15px] leading-6 text-muted-foreground">

      <section className="space-y-6">
        <h2 id="quick-start" className={headingClasses.h2}>
          🚀 快速开始
        </h2>

        <div className="space-y-4">
          <h3 id="step-1-install" className={headingClasses.h3}>
            第一步：安装 Claude Code
          </h3>

          <div className="space-y-3">
            <h4 className={headingClasses.h4}>开发者（推荐）</h4>
            <p>使用 npm 全局安装：</p>
            <CodeBlock language="bash" code={`npm install -g @anthropic-ai/claude-code`} />
          </div>

          <div className="space-y-3">
            <h4 className={headingClasses.h4}>非开发者</h4>
            <p>使用一键安装脚本：</p>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">macOS / Linux / WSL</p>
              <CodeBlock language="bash" code={`curl -fsSL https://claude.ai/install.sh | bash`} />
              <p className="font-semibold text-foreground">Windows PowerShell</p>
              <CodeBlock language="powershell" code={`irm https://claude.ai/install.ps1 | iex`} />
            </div>
            <blockquote className="space-y-1 rounded-lg border-l-2 border-primary/50 bg-muted/40 px-4 py-3">
              <p className="font-semibold text-foreground">提示</p>
              <p>Windows 用户建议使用 WSL (Windows Subsystem for Linux) 以获得更好的体验</p>
            </blockquote>
          </div>
        </div>

        <div className="space-y-4">
          <h3 id="step-2-config" className={headingClasses.h3}>
            第二步：配置 API 密钥
          </h3>
          <div className="space-y-3">
            <h4 className={headingClasses.h4}>1. 创建配置文件</h4>
            <p>根据您的操作系统，在对应位置创建 <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">settings.json</code> 文件：</p>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-foreground">macOS / Linux</p>
                <CodeBlock language="bash" code={`~/.claude/settings.json`} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Windows</p>
                <CodeBlock language="powershell" code={`%USERPROFILE%\\.claude\\settings.json`} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className={headingClasses.h4}>2. 添加配置内容</h4>
            <p>将以下配置复制到 <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">settings.json</code> 文件中：</p>
            <CodeBlock
              language="json"
              code={`{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-api-key-here",
    "ANTHROPIC_BASE_URL": "${resolvedOrigin}",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1
  },
  "permissions": {
    "allow": [],
    "deny": []
  },
  "apiKeyHelper": "echo 'your-api-key-here'"
}`}
            />
          </div>

          <div className="space-y-3">
            <h4 className={headingClasses.h4}>3. 替换 API 密钥</h4>
            <blockquote className="space-y-2 rounded-lg border-l-2 border-primary/50 bg-muted/40 px-4 py-3">
              <p className="font-semibold text-foreground">重要</p>
              <p>请将配置中的 <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">your-api-key-here</code> 替换为您的实际 API 密钥。</p>
              <p>密钥获取方式：登录控制台 → API 密钥管理 → 创建 / 查看密钥。</p>
            </blockquote>
          </div>
        </div>

        <div className="space-y-4">
          <h3 id="step-3-start" className={headingClasses.h3}>
            第三步：开始使用
          </h3>
          <ol className="list-decimal space-y-2 pl-6">
            <li>打开终端 / 命令行</li>
            <li>进入您的项目目录</li>
            <li>输入以下命令启动 Claude Code：</li>
          </ol>
          <CodeBlock language="bash" code={`claude`} />
          <p>现在您可以开始使用 Claude Code 辅助开发了！</p>
        </div>
      </section>

      <hr className="border-border/60" />

      <section className="space-y-4">
        <h2 id="common-commands" className={headingClasses.h2}>
          📚 常用命令
        </h2>
        <p>启动 Claude Code 后，您可以使用以下常用命令：</p>
        <ul className="list-disc space-y-2 pl-6">
          <li><code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">/help</code> - 查看帮助信息</li>
          <li><code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">/clear</code> - 清空对话历史，并开启新的对话</li>
          <li><code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">/compact</code> - 总结当前对话</li>
          <li><code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">/cost</code> - 查看当前对话已经使用的金额</li>
          <li>
            ... 其他更多命令查看
            <a
              href="https://docs.claude.com/zh-CN/docs/claude-code/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
            >
              官方文档
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 id="troubleshooting" className={headingClasses.h2}>
          🔍 故障排查
        </h2>
        <h3 className={headingClasses.h3}>常见问题</h3>

        <div className="space-y-3">
          <p className="font-semibold text-foreground">1. 安装失败</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>检查网络连接是否正常</li>
            <li>确保有管理员权限（Windows）或使用 sudo（macOS / Linux）</li>
            <li>尝试使用代理或镜像源</li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-foreground">2. API 密钥无效</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>确认密钥已正确复制（无多余空格）</li>
            <li>检查密钥是否在有效期内</li>
            <li>验证账户权限是否正常</li>
          </ul>
        </div>
      </section>
    </article>
  )
}

/**
 * 文档页面
 * 使用客户端组件渲染静态文档内容，并提供目录导航
 */
export default function UsageDocPage() {
  const [activeId, setActiveId] = useState<string>('')
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [tocReady, setTocReady] = useState(false)
  const [serviceOrigin, setServiceOrigin] = useState(() =>
    (typeof window !== 'undefined' && window.location.origin) || ''
  )

  useEffect(() => {
    setServiceOrigin(window.location.origin)
  }, [])

  // 生成目录并监听滚动
  useEffect(() => {
    // 获取所有标题
    const headings = document.querySelectorAll('h2, h3')
    const items: TocItem[] = []

    headings.forEach((heading) => {
      // 为标题添加 id（如果没有的话）
      if (!heading.id) {
        heading.id = heading.textContent?.toLowerCase().replace(/\s+/g, '-') || ''
      }

      items.push({
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1])
      })
    })

    setTocItems(items)
    setTocReady(true)

    // 监听滚动，高亮当前章节
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      for (const item of items) {
        const element = document.getElementById(item.id)
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(item.id)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // 初始化

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 点击目录项滚动到对应位置
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offsetTop = element.offsetTop - 80
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative flex gap-8">
      {/* 左侧主文档 */}
      <div className="flex-1">
        {/* 背景装饰 */}
        <div className="absolute inset-0 -z-10 mx-auto max-w-7xl">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[200%] h-48 bg-gradient-to-b from-primary/5 to-transparent rounded-[100%] blur-3xl" />
        </div>

        {/* 文档容器 */}
        <div className="relative bg-card rounded-xl shadow-sm border p-8 md:p-12">
          {/* 文档内容 */}
          <UsageDocContent origin={serviceOrigin} />
        </div>

        {/* 页脚信息 */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>文档持续更新中 • 最后更新: {new Date().toLocaleDateString('zh-CN')}</p>
        </div>
      </div>

      {/* 右侧目录导航 */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 space-y-4">
          <div className="bg-card rounded-lg border p-4">
            <h4 className="font-semibold text-sm mb-3">本页导航</h4>
            <nav className="space-y-1">
              {!tocReady && (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-5 w-full" />
                  ))}
                </div>
              )}
              {tocReady && tocItems.length === 0 && (
                <p className="text-xs text-muted-foreground">本页暂无可用章节</p>
              )}
              {tocReady && tocItems.length > 0 &&
                tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors",
                      item.level === 3 && "pl-6 text-xs",
                      activeId === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {item.text}
                  </button>
                ))}
            </nav>
          </div>

          {/* 快速操作 */}
          <div className="bg-card rounded-lg border p-4">
            <h4 className="font-semibold text-sm mb-3">快速链接</h4>
            <div className="space-y-2">
              <a href="/dashboard" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                返回仪表盘
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                 className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                回到顶部
              </a>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
