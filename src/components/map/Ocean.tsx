/**
 * @file 海洋/背景层
 * @desc Era I羊皮纸背景矩形
 */
'use client'

interface OceanProps {
  width: number
  height: number
  onClick?: () => void
}

export function Ocean({ width, height, onClick }: OceanProps) {
  return (
    <rect
      x={0} y={0}
      width={width}
      height={height}
      fill="url(#parchment-bg)"
      filter="url(#parchment-texture)"
      onClick={onClick}
      style={{ cursor: onClick ? 'default' : undefined }}
    />
  )
}
