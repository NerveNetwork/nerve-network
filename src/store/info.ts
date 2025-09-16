import { ref } from 'vue'
import { defineStore } from 'pinia'
import storage from '@/utils/storage'

export const useInfoStore = defineStore('info', () => {
  const watchTokens = ref<string[]>(storage.get('watchTokens') || [])
  const watchPools = ref<string[]>(storage.get('watchPools') || [])

  const changeWatchTokens = (tokens: string[]) => {
    watchTokens.value = tokens
  }
  const changeWatchPools = (pools: string[]) => {
    watchPools.value = pools
  }

  return {
    watchTokens,
    watchPools,
    changeWatchTokens,
    changeWatchPools
  }
})
