/**
 * @file i18n Localization Helper
 * @desc Lightweight dictionary map supporting English and Simplified Chinese.
 */

export type Locale = 'zh' | 'en'

const translations: Record<Locale, Record<string, string>> = {
  zh: {
    title: '冷战大战略',
    year: '年份',
    usa: '美国',
    ussr: '苏联',
    turn: '轮',
    tension: '全球紧张度',
    score: '分',
    budget: '预算',
    support: '公众支持',
    advance: '推进',
    round: '第 {turn} 轮',
    hotspots: '战略热点',
    cws: '冷战分',
    situations: '当前局势',
    regional: '区域局势',
    alerts: '战略警报',
    intelTitle: '情报分析',
    commandCenter: '指挥中心',
    techTitle: '科技研发',
    settingsTitle: 'AI 裁判设置',
    newsTitle: '底部新闻',
    noSituations: '暂无活跃局势',
    zoomHint: '滚轮缩放 · 拖拽平移 · 双击放大',
    selectSide: '选择你的阵营开始博弈',
  },
  en: {
    title: 'Cold War Grand Strategy',
    year: 'Year',
    usa: 'USA',
    ussr: 'USSR',
    turn: 'Turn',
    tension: 'Global Tension',
    score: 'pts',
    budget: 'Budget',
    support: 'Public Support',
    advance: 'Advance',
    round: 'Turn {turn}',
    hotspots: 'Strategic Hotspots',
    cws: 'CWS Score',
    situations: 'Active Situations',
    regional: 'Regional Scores',
    alerts: 'Strategic Alerts',
    intelTitle: 'Intelligence Analysis',
    commandCenter: 'Command Center',
    techTitle: 'Technology Research',
    settingsTitle: 'AI Judge Settings',
    newsTitle: 'News Ticker',
    noSituations: 'No active situations',
    zoomHint: 'Scroll to Zoom · Drag to Pan · Double-click to Reset',
    selectSide: 'Select Your Faction to Begin',
  },
}

let currentLocale: Locale = 'zh'

export const i18n = {
  setLocale(locale: Locale) {
    currentLocale = locale
    if (typeof window !== 'undefined') {
      localStorage.setItem('game_locale', locale)
    }
  },

  getLocale(): Locale {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game_locale') as Locale
      if (saved === 'zh' || saved === 'en') {
        currentLocale = saved
      }
    }
    return currentLocale
  },

  t(key: string, variables?: Record<string, string | number>): string {
    const locale = this.getLocale()
    let text = translations[locale]?.[key] || translations['zh']?.[key] || key
    if (variables) {
      for (const [k, v] of Object.entries(variables)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    return text
  },
}
