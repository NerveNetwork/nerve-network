import { onMounted, onUnmounted, ref, Ref } from 'vue';

/**
 * useObserveAnimate
 * @param animateClass 动画class名，默认'animate-in'
 * @param options IntersectionObserver配置
 * @param delayMs 动画延迟（毫秒），可选
 * @returns 元素ref
 */
export function useObserveAnimate<T extends HTMLElement = HTMLElement>(
  animateClass = 'animate-in',
  options?: IntersectionObserverInit,
  delayMs?: number
) {
  const elRef = ref<T | null>(null);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (elRef.value) {
      observer = new window.IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (delayMs) {
              setTimeout(() => {
                entry.target.classList.add(animateClass);
              }, delayMs);
            } else {
              entry.target.classList.add(animateClass);
            }
            observer && observer.unobserve(entry.target); // 只触发一次
          }
        });
      }, options || { threshold: 0.1 });
      observer.observe(elRef.value);
    }
  });

  onUnmounted(() => {
    if (observer && elRef.value) {
      observer.unobserve(elRef.value);
      observer.disconnect();
    }
  });

  return elRef;
}
