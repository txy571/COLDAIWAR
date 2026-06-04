/**
 * @file 时代滤镜定义 (SVG defs)
 * @desc 三时代SVG滤镜：Era I羊皮纸纹理(feTurbulence) / Era II CRT发光 / Era III霓虹发光
 *       通用：争议领土斜线/东德条纹/血迹辉光/手绘边框微抖
 */
'use client'

import type { Era } from '@/types'

export function EraFilters({ era }: { era: Era }) {
  return (
    <defs>
      {/* ─── Contested territory hatch pattern ─── */}
      <pattern
        id="contested-hatch"
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <path
          d="M0,0 l0,8"
          stroke="#ffaa00"
          strokeWidth={1.5}
          opacity={0.4}
        />
      </pattern>

      {/* ─── Stripe pattern for divided countries (e.g., East Germany) ─── */}
      <pattern
        id="stripe-pattern"
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(30)"
      >
        <rect width="3" height="6" fill="#ffffff" opacity={0.15} />
        <rect x="3" width="3" height="6" fill="#000000" opacity={0.1} />
      </pattern>

      {/* Era I: Parchment texture */}
      <filter id="parchment-texture" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
        <feColorMatrix
          type="matrix"
          values="
            1 0 0 0 0.82
            0 1 0 0 0.72
            0 0 1 0 0.60
            0 0 0 0.15 0"
          in="noise"
          result="coloredNoise"
        />
        <feBlend mode="multiply" in="SourceGraphic" in2="coloredNoise" />
      </filter>

      {/* Hand-drawn border effect */}
      <filter id="hand-drawn-border" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="warp" />
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
      </filter>

      {/* Blood glow */}
      <filter id="blood-glow">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Era II: CRT glow (stub) */}
      {era === 'IRON_CURTAIN' && (
        <filter id="crt-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      )}

      {/* Era III: Neon glow (stub) */}
      {era === 'INFO_AGE' && (
        <filter id="neon-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      )}
    </defs>
  )
}
