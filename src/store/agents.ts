import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import useToast from '@/hooks/useToast'
import { useWalletStore } from '@/store/wallet'
import { getProjectList, getSysConfig } from '@/service/api'
import type { IProject } from '@/service/api/types'

export const useAgentStore = defineStore('agent', () => {
  const { toastError } = useToast()
  const wallet = useWalletStore()
  const loading = ref(true)
  const list = ref<IProject[]>([])
  const maxAgentCount = ref(0)
  const checkLoading = ref(false)

  const getList = async () => {
    if (!wallet.user?.userId) return;
    const res = await getProjectList()
    list.value = res
    loading.value = false
  }

  

  const beforeCreateAgent = async (cb: () => Promise<void> | void) => {
    if (checkLoading.value || !wallet.user?.userId) return
    checkLoading.value = true
    try {
      if (!list.value.length) {
        await getList()
      }
      checkLoading.value = false
      if (!maxAgentCount.value) {
        toastError('Network error') 
        return
      }
      if (maxAgentCount.value - list.value.length <= 0) {
        toastError(`Maximum agents is ${maxAgentCount.value}`) 
        return
      }
      await cb()
    } catch (e) {
      toastError(e)
      checkLoading.value = false
    }
    
  }

  const getMaxAgentCount = () => {
    getSysConfig().then(res => {
      maxAgentCount.value = res.maxProjectCount
    })
  }

  return {
    loading,
    list,
    checkLoading,
    getList,
    getMaxAgentCount,
    beforeCreateAgent
  }
})
