import { type DirectiveBinding } from 'vue'
import { createVNode, render } from 'vue'
import Loading from './index.vue'

const loadingMap = new WeakMap<HTMLElement, {
  container: HTMLElement
  vm: any
}>()

interface LoadingOptions {
  show?: boolean
  text?: string
  size?: string
}

function getLoadingOptions(value: boolean | LoadingOptions): LoadingOptions {
  if (typeof value === 'boolean') {
    return { show: value }
  }
  return value
}

function createLoadingComponent(el: HTMLElement, binding: DirectiveBinding) {
  const container = document.createElement('div')
  
  if (!binding.modifiers.fullscreen) {
    el.style.position = 'relative'
  }

  const options = getLoadingOptions(binding.value)

  const vm = createVNode(Loading, {
    visible: true,
    text: options.text || '',
    size: options.size || 'md',
    fullscreen: binding.modifiers.fullscreen
  })

  render(vm, container)

  const target = binding.modifiers.fullscreen ? document.body : el
  target.appendChild(container)

  loadingMap.set(el, {
    container,
    vm
  })

  if (binding.modifiers.fullscreen) {
    document.body.style.overflow = 'hidden'
  }
}

function removeLoadingComponent(el: HTMLElement) {
  const loading = loadingMap.get(el)
  if (loading) {
    const { container, vm } = loading
    
    vm.component!.props.visible = false
    
    setTimeout(() => {
      render(null, container)
      container.parentNode?.removeChild(container)
      loadingMap.delete(el)
      
      if (vm.component!.props.fullscreen) {
        document.body.style.overflow = ''
      }
    }, 200)
  }
}

function shouldShowLoading(value: boolean | LoadingOptions): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  return !!value.show
}

export const vLoading = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    if (shouldShowLoading(binding.value)) {
      createLoadingComponent(el, binding)
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const shouldShow = shouldShowLoading(binding.value)
    const shouldHide = !shouldShow
    const hasInstance = loadingMap.has(el)

    if (shouldShow && !hasInstance) {
      createLoadingComponent(el, binding)
    } else if (shouldHide && hasInstance) {
      removeLoadingComponent(el)
    }
  },
  unmounted(el: HTMLElement) {
    removeLoadingComponent(el)
  }
}