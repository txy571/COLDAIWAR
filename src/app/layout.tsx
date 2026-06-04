/**
 * @file 根布局
 * @desc 加载全局样式，设置中文语言和等宽字体
 */
import '@/app/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cold War Grand Strategy',
  description: 'A turn-based grand strategy game set in the Cold War era',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-typewriter">{children}</body>
    </html>
  )
}
