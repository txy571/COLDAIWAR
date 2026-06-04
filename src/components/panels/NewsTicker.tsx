/**
 * @file 底部新闻滚动条
 * @desc 无限循环CSS动画，速度随新闻数量自适应(20s+5s/条)
 *       无新闻时隐藏
 */
'use client'

import { useGameStore } from '@/store/gameStore'
import type { NewsItem } from '@/types'

export function NewsTicker() {
  const newsFeed = useGameStore(s => s.newsFeed)

  if (newsFeed.length === 0) return null

  return (
    <div className="h-8 bg-stone-800 border-t-2 border-stone-700 flex items-center overflow-hidden">
      <div className="h-full px-3 flex items-center bg-stone-900 border-r-2 border-stone-700 text-stone-400 text-xs font-bold tracking-wider shrink-0">
        📰 快讯
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div
          className="animate-scroll flex gap-16 whitespace-nowrap py-1"
          style={{ animationDuration: `${Math.max(20, newsFeed.length * 5)}s` }}
        >
          {[...newsFeed, ...newsFeed].map((item: NewsItem, i) => (
            <span key={`${item.id}_${i}`} className="inline-flex items-center gap-2 text-xs text-stone-400 font-mono">
              <span className="text-amber-600">◆</span>
              <span>{item.headline}</span>
              <span className="text-stone-600">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
