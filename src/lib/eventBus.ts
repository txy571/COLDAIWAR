/**
 * @file 简易事件总线
 * @desc 模块间通信的发布/订阅模式，用于AI裁判裁决结果→UI弹窗
 *       支持 emit/on，返回取消订阅函数
 */

type Listener = (...args: any[]) => void
const listeners: Record<string, Listener[]> = {}

export function emit(event: string, ...args: any[]) {
  (listeners[event] || []).forEach(fn => fn(...args))
}

export function on(event: string, fn: Listener) {
  if (!listeners[event]) listeners[event] = []
  listeners[event].push(fn)
  return () => {
    const i = listeners[event].indexOf(fn)
    if (i >= 0) listeners[event].splice(i, 1)
  }
}
