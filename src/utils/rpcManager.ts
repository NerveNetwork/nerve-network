import storage from '@/utils/storage'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import generatedRpcMap from '@/constants/rpcUrls.generated.json'

export interface CustomRpcConfig {
  urls: string[]
  selected?: string
}

export type CustomRpcMap = Record<string, CustomRpcConfig>

const CUSTOM_RPC_STORAGE_KEY = 'customRpcMap'

function isNvmChain(chainName: string) {
  return _networkInfo[chainName]?.type === 'NVM'
}

function normalizeUrl(url: string) {
  return (url || '').trim()
}

function dedupeUrls(urls: string[]) {
  const set = new Set<string>()
  urls.forEach(url => {
    const normalized = normalizeUrl(url)
    if (normalized) {
      set.add(normalized)
    }
  })
  return Array.from(set)
}

export function getDefaultRpcUrls(chainName: string): string[] {
  const chain = _networkInfo[chainName]
  if (!chain) return []
  if (isNvmChain(chainName)) {
    return dedupeUrls(chain.rpcUrl ? [chain.rpcUrl] : [])
  }
  const generatedUrls =
    (generatedRpcMap as Record<string, { rpcUrls?: string[] }>)[chainName]?.rpcUrls || []
  const defaults = Array.isArray(chain.rpcUrls) ? chain.rpcUrls : []
  const compat = chain.rpcUrl ? [chain.rpcUrl] : []
  return dedupeUrls([...defaults, ...compat, ...generatedUrls])
}

export function getCustomRpcMap(): CustomRpcMap {
  return storage.get(CUSTOM_RPC_STORAGE_KEY) || {}
}

export function setCustomRpcMap(value: CustomRpcMap) {
  storage.set(CUSTOM_RPC_STORAGE_KEY, value)
}

export function resetRpcConfig(chainName: string) {
  if (isNvmChain(chainName)) return
  const customMap = getCustomRpcMap()
  if (customMap[chainName]) {
    delete customMap[chainName]
    setCustomRpcMap(customMap)
  }
}

export function getRpcConfig(chainName: string): CustomRpcConfig {
  const defaults = getDefaultRpcUrls(chainName)
  if (isNvmChain(chainName)) {
    return { urls: defaults, selected: defaults[0] }
  }
  const customMap = getCustomRpcMap()
  const chainCustom = customMap[chainName]
  const mergedUrls = dedupeUrls([...(chainCustom?.urls || []), ...defaults])
  const selected = chainCustom?.selected || mergedUrls[0]
  const urls = selected
    ? dedupeUrls([selected, ...mergedUrls.filter(url => url !== selected)])
    : mergedUrls
  return { urls, selected }
}

export function saveRpcConfig(chainName: string, config: CustomRpcConfig) {
  if (isNvmChain(chainName)) return
  const customMap = getCustomRpcMap()
  const urls = dedupeUrls(config.urls)
  const selected = urls.includes(config.selected || '') ? config.selected : urls[0]
  customMap[chainName] = { urls, selected }
  setCustomRpcMap(customMap)
}

export function selectRpcUrl(chainName: string, url: string) {
  if (isNvmChain(chainName)) return
  const config = getRpcConfig(chainName)
  if (!config.urls.includes(url)) return
  saveRpcConfig(chainName, { ...config, selected: url })
}

export function addRpcUrl(chainName: string, url: string) {
  if (isNvmChain(chainName)) return
  const config = getRpcConfig(chainName)
  const urls = dedupeUrls([...config.urls, url])
  const selected = config.selected || urls[0]
  saveRpcConfig(chainName, { urls, selected })
}

export function updateRpcUrl(chainName: string, oldUrl: string, newUrl: string) {
  if (isNvmChain(chainName)) return
  const config = getRpcConfig(chainName)
  const urls = config.urls.map(url => (url === oldUrl ? newUrl : url))
  const selected = config.selected === oldUrl ? newUrl : config.selected
  saveRpcConfig(chainName, { urls, selected })
}

export function deleteRpcUrl(chainName: string, url: string) {
  if (isNvmChain(chainName)) return false
  const config = getRpcConfig(chainName)
  const defaults = getDefaultRpcUrls(chainName)
  if (defaults.includes(url)) return false
  const urls = config.urls.filter(v => v !== url)
  const selected = config.selected === url ? urls[0] : config.selected
  saveRpcConfig(chainName, { urls, selected })
  return true
}
