import { createVNode, render, type App } from 'vue'
import BaseLoading from '@/components/Base/Loading/index.vue'
import { vLoading } from '@/components/Base/Loading/loading-directives'

export interface LoadingOptions {
  text?: string
  target?: string | HTMLElement
  size?: 'sm' | 'md' | 'lg'
}

interface LoadingInstance {
  target: HTMLElement
  container: HTMLElement
  vnode: any
  originalOverflow: string | null
}

class LoadingService {
  private static instances = new Map<symbol, LoadingInstance>()

  private static getTarget(target?: string | HTMLElement): HTMLElement {
    if (!target) return document.body
    
    if (typeof target === 'string') {
      const el = document.querySelector(target)
      if (!el) {
        console.warn(`[Loading] Target element not found: ${target}`)
        return document.body
      }
      return el as HTMLElement
    }
    
    return target
  }

  private static lockScroll(target: HTMLElement) {
    const originalOverflow = target.style.overflow
    target.style.overflow = 'hidden'
    return originalOverflow
  }

  private static unlockScroll(target: HTMLElement, originalOverflow: string | null) {
    if (originalOverflow !== null) {
      target.style.overflow = originalOverflow
    } else {
      target.style.overflow = ''
    }
  }

  static show(options: LoadingOptions = {}): symbol {
    // 创建唯一标识
    const id = Symbol()
    
    // 创建容器
    const container = document.createElement('div')
    const target = this.getTarget(options.target)
    
    // 设置容器样式
    if (target === document.body) {
      container.style.position = 'fixed'
      container.style.zIndex = '9999'
      container.style.top = '0'
      container.style.left = '0'
    } else {
      target.style.position = 'relative'
    }

    const vnode = createVNode(BaseLoading, {
      visible: true,
      text: options.text,
      size: options.size || 'md',
      fullscreen: target === document.body
    })

    render(vnode, container)
    target.appendChild(container)

    // 保存实例信息
    const originalOverflow = target === document.body ? this.lockScroll(document.body) : null
    this.instances.set(id, {
      target,
      container,
      vnode,
      originalOverflow
    })

    return id
  }

  static close(id?: symbol) {
    if (id) {
      // 关闭指定实例
      const instance = this.instances.get(id)
      if (instance) {
        this.closeInstance(instance)
        this.instances.delete(id)
      }
    } else {
      // 关闭所有实例
      this.instances.forEach(instance => {
        this.closeInstance(instance)
      })
      this.instances.clear()
    }
  }

  private static closeInstance(instance: LoadingInstance) {
    const { target, container, vnode, originalOverflow } = instance
    
    // 更新visible状态
    vnode.component!.props.visible = false
    
    // 延迟移除DOM
    setTimeout(() => {
      render(null, container)
      target.removeChild(container)
      
      if (target === document.body) {
        this.unlockScroll(document.body, originalOverflow)
      }
    }, 200)
  }
}

export function useLoadingPlugin(app: App) {
  app.config.globalProperties.$loading = LoadingService
  app.directive('loading', vLoading)
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $loading: typeof LoadingService
  }
}

export default LoadingService