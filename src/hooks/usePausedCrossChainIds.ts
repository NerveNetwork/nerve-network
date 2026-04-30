import { computed, ref } from 'vue'
import { getCrossChainPausedHtgChainIds } from '@/service/api/public'
import config from '@/config'
import storage from '@/utils/storage'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'

export default function usePausedCrossChainIds(getNetwork: () => string) {
  const pausedChainIds = ref<number[]>([])
  const pausedChainIdsReady = ref(false)

  const isNetworkPaused = computed(() => {
    // 在暂停链列表就绪前，先按“已暂停”处理，避免 CrossIn/CrossOut 闪现
    if (!pausedChainIdsReady.value) return true
    const currentChainId = _networkInfo[getNetwork()]?.chainId
    return pausedChainIds.value.includes(currentChainId)
  })

  async function initPausedChainIds() {
    const cacheKey = 'pausedChainIdsCache'
    const cached = storage.get(cacheKey, 'session')
    if (cached?.list && Date.now() - cached.ts < 60 * 1000) {
      pausedChainIds.value = cached.list
      pausedChainIdsReady.value = true
      return
    }
    try {
      let list: number[] = []
      let fetched = false
      for (let retry = 0; retry < 2 && !list.length; retry++) {
        try {
          list = await getCrossChainPausedHtgChainIds(config.chainId)
          fetched = true
          break
        } catch (e) {
          if (retry === 1) throw e
        }
      }
      if (!fetched) return
      pausedChainIds.value = list
      storage.set(cacheKey, { list, ts: Date.now() }, 'session')
      pausedChainIdsReady.value = true
    } catch (e) {
      console.error('Failed to get paused chain ids:', e)
      pausedChainIds.value = []
    }
  }

  initPausedChainIds()

  return {
    pausedChainIds,
    pausedChainIdsReady,
    isNetworkPaused,
    initPausedChainIds
  }
}
