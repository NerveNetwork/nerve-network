<template>
  <button v-if="showAdvanced" :class="buttonClass" @click="visible = true">Advanced</button>
  <Modal
    v-if="showAdvanced"
    v-model="visible"
    title="Advanced RPC"
    container-class="w-[760px] max-w-[95vw]">
    <div class="rounded-md border border-line/40 bg-card/30 px-3 py-2">
      <div class="mb-2 flex items-center justify-between gap-2">
        <div class="text-[11px] text-label">
          <template v-if="isNvm">
            NVM chain uses fixed single RPC and cannot be edited.
          </template>
          <template v-else>
            Manage RPC URLs for current chain.
          </template>
        </div>
        <div class="flex items-center gap-2" v-if="!isNvm">
          <button class="btn text-[11px] text-label hover:text-warning" @click="restoreDefaults">
            Reset
          </button>
          <button
            class="btn inline-flex h-6 -translate-y-[2px] items-center justify-center px-0 text-2xl leading-none text-label hover:text-primary"
            :disabled="testingAll"
            title="Health Check"
            @click="testAll">
            <span :class="[testingAll && 'animate-spin']">⟳</span>
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <div v-for="item in editableUrls" :key="item.id" class="rounded-md bg-input p-2">
          <div class="flex items-center gap-2">
            <input
              type="radio"
              name="rpc-selected"
              class="cursor-pointer"
              :checked="item.url === selectedUrl"
              :disabled="isNvm"
              @change="select(item.url)" />
            <input
              v-model="item.url"
              :disabled="isNvm"
              class="h-8 w-[78%] rounded-md border border-line bg-[#08090B] px-2 text-xs"
              :placeholder="item.placeholder" />
            <span class="w-12 text-right text-[11px] text-label">
              {{
                statusMap[item.originalUrl]?.status === 'ok'
                  ? `${statusMap[item.originalUrl]?.latency}ms`
                  : statusMap[item.originalUrl]?.status === 'testing'
                    ? '...'
                    : '--'
              }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="!isNvm && currentSelectedItem"
        class="mt-2 flex items-center justify-end gap-3 pr-1 text-[11px] text-label">
        <button class="btn text-label hover:text-primary" @click="testSelected">Test</button>
        <button class="btn text-label hover:text-primary" @click="saveSelected">Save</button>
        <button
          class="btn text-label hover:text-error"
          :disabled="currentSelectedItem.isDefault"
          @click="deleteSelected">
          Delete
        </button>
      </div>

      <div class="mt-3 flex gap-2" v-if="!isNvm">
        <input
          v-model="newUrl"
          class="h-8 flex-1 rounded-md border border-line bg-[#08090B] px-2 text-xs"
          placeholder="https://your-rpc-url" />
        <button class="btn rounded-md border border-line/60 px-3 text-xs text-label hover:text-primary" @click="add">
          Add
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useWalletStore } from '@/store/wallet'
import Modal from '@/components/Base/Modal/index.vue'
import useToast from '@/hooks/useToast'
import {
  addRpcUrl,
  deleteRpcUrl,
  getDefaultRpcUrls,
  getRpcConfig,
  resetRpcConfig,
  selectRpcUrl,
  updateRpcUrl
} from '@/utils/rpcManager'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'

withDefaults(
  defineProps<{
    buttonClass?: string
  }>(),
  {
    buttonClass: 'btn text-[11px] text-label hover:text-primary'
  }
)

interface UrlItem {
  id: string
  url: string
  placeholder: string
  isDefault: boolean
  originalUrl: string
}

const walletStore = useWalletStore()
const { chain } = storeToRefs(walletStore)
const { toastError, toastSuccess } = useToast()
const visible = ref(false)
const chainName = computed(() => chain.value || '')
const showAdvanced = computed(() => _networkInfo[chainName.value]?.type === 'EVM')
const isNvm = computed(() => _networkInfo[chainName.value]?.type === 'NVM')
const selectedUrl = ref('')
const editableUrls = ref<UrlItem[]>([])
const newUrl = ref('')
const testingAll = ref(false)
const statusMap = ref<
  Record<string, { status: 'idle' | 'testing' | 'ok' | 'fail'; latency?: number }>
>({})
const currentSelectedItem = computed(() =>
  editableUrls.value.find(item => item.url === selectedUrl.value)
)

function rebuild() {
  if (!chainName.value) return
  const config = getRpcConfig(chainName.value)
  const defaults = getDefaultRpcUrls(chainName.value)
  selectedUrl.value = config.selected || ''
  editableUrls.value = config.urls.map(url => ({
    id: `${Date.now()}-${url}`,
    url,
    placeholder: 'RPC URL',
    isDefault: defaults.includes(url),
    originalUrl: url
  }))
}

watch([() => chainName.value, () => visible.value], () => {
  if (visible.value) rebuild()
})

function isValidUrl(url: string) {
  return /^https?:\/\//.test(url.trim())
}

function select(url: string) {
  if (!chainName.value) return
  selectRpcUrl(chainName.value, url)
  selectedUrl.value = url
}

function add() {
  if (!chainName.value) return
  if (!isValidUrl(newUrl.value)) {
    toastError('Invalid RPC URL')
    return
  }
  addRpcUrl(chainName.value, newUrl.value)
  newUrl.value = ''
  rebuild()
}

function save(item: UrlItem) {
  if (!chainName.value) return
  if (!isValidUrl(item.url)) {
    toastError('Invalid RPC URL')
    return
  }
  updateRpcUrl(chainName.value, item.originalUrl, item.url)
  toastSuccess('Saved')
  rebuild()
}

function remove(url: string) {
  if (!chainName.value) return
  const success = deleteRpcUrl(chainName.value, url)
  if (!success) {
    toastError('Default RPC cannot be deleted')
    return
  }
  toastSuccess('Deleted')
  rebuild()
}

async function testRpcUrl(url: string) {
  const method = 'eth_blockNumber'
  const start = Date.now()
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params: [] }),
      signal: controller.signal
    })
    if (!res.ok) throw new Error('http error')
    const data = await res.json()
    if (data.error) throw new Error(data.error.message || 'rpc error')
    return Date.now() - start
  } finally {
    clearTimeout(timer)
  }
}

async function testOne(url: string) {
  statusMap.value[url] = { status: 'testing' }
  try {
    const latency = await testRpcUrl(url)
    statusMap.value[url] = { status: 'ok', latency }
  } catch {
    statusMap.value[url] = { status: 'fail' }
  }
}

async function testAll() {
  testingAll.value = true
  try {
    for (const item of editableUrls.value) {
      await testOne(item.originalUrl)
    }
  } finally {
    testingAll.value = false
  }
}

async function testSelected() {
  if (!currentSelectedItem.value) return
  await testOne(currentSelectedItem.value.originalUrl)
}

function saveSelected() {
  if (!currentSelectedItem.value) return
  save(currentSelectedItem.value)
}

function deleteSelected() {
  if (!currentSelectedItem.value) return
  remove(currentSelectedItem.value.url)
}

function restoreDefaults() {
  if (!chainName.value) return
  resetRpcConfig(chainName.value)
  toastSuccess('RPC restored to defaults')
  rebuild()
}
</script>
