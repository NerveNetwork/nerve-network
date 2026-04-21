import { ethers } from 'ethers'
import { getEVMProvider } from '@/utils/providerUtil'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import { getRpcConfig } from '@/utils/rpcManager'

export function getFallbackRpcProvider(chainName: string) {
  const { urls } = getRpcConfig(chainName)
  const providers = urls
    .filter(Boolean)
    .map((url, index) => ({
      provider: new ethers.providers.JsonRpcProvider(url),
      priority: index + 1,
      weight: index === 0 ? 2 : 1,
      stallTimeout: 1500
    }))
  if (!providers.length) {
    throw new Error(`No rpc urls configured for ${chainName}`)
  }
  if (providers.length === 1) {
    return providers[0].provider
  }
  return new ethers.providers.FallbackProvider(providers, 1)
}

export function getPluginWeb3Provider() {
  const { provider } = getEVMProvider()
  if (!provider) return null
  return new ethers.providers.Web3Provider(provider)
}

export async function canUsePluginAsFallback(chainName: string) {
  const chainInfo = _networkInfo[chainName]
  if (!chainInfo || chainInfo.type !== 'EVM') return false
  const pluginProvider = getPluginWeb3Provider()
  if (!pluginProvider) return false
  const network = await pluginProvider.getNetwork()
  const currentChainIdHex = `0x${network.chainId.toString(16)}`
  return currentChainIdHex.toLowerCase() === chainInfo.nativeId.toLowerCase()
}
