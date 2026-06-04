/**
 * @file 时代图案定义 (SVG patterns/gradients)
 * @desc 羊皮纸渐变、血迹径向渐变、东德红色条纹、选中高亮光晕
 */
'use client'

export function EraPatterns() {
  return (
    <defs>
      {/* Era I: Parchment background gradient */}
      <linearGradient id="parchment-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d4c5a9" />
        <stop offset="100%" stopColor="#c4b599" />
      </linearGradient>

      {/* Era I: Blood stain radial gradient */}
      <radialGradient id="blood-stain" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#8b0000" stopOpacity="0.35" />
        <stop offset="60%" stopColor="#8b0000" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#8b0000" stopOpacity="0" />
      </radialGradient>

      {/* Stripe pattern for divided countries (East Germany) */}
      <pattern id="stripe-pattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="none" />
        <rect width="3" height="8" fill="#dc2626" opacity="0.6" />
      </pattern>

      {/* Selected country highlight */}
      <radialGradient id="highlight-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}
