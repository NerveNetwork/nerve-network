#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const CONFIG_PATH = path.join(ROOT, 'src/utils/heterogeneousChainConfig.ts')
const OUTPUT_PATH = path.join(ROOT, 'src/constants/rpcUrls.generated.json')
const CHAINLIST_URL = 'https://chainid.network/chains.json'
const CHAIN_SPECIFIC_WHITELIST = {
  Akashic: ['akashicrecords.io'],
  ETHW: ['ethereumpow.org']
}
const TESTNET_KEYWORDS = [
  'testnet',
  'goerli',
  'sepolia',
  'mumbai',
  'rinkeby',
  'kovan',
  'ropsten',
  'fuji',
  'shasta',
  'alfajores',
  'athens',
  'mordor'
]

function uniq(list) {
  return Array.from(new Set(list.filter(Boolean)))
}

function normalizeRpc(url) {
  if (!url) return ''
  const cleaned = url.replace(/\$\{[^}]+\}/g, '').trim()
  if (!cleaned.startsWith('http')) return ''
  return cleaned.replace(/\/+$/, '')
}

function parseRpcMap(fileContent) {
  const rpcMap = {}
  const rpcSectionMatch = fileContent.match(/export const RPC_URL = \{([\s\S]*?)\n\}/)
  if (!rpcSectionMatch) return rpcMap
  const section = rpcSectionMatch[1]
  const keyRegex = /([A-Za-z0-9_]+):([\s\S]*?)(?=\n\s{2}[A-Za-z0-9_]+:|$)/g
  let match
  while ((match = keyRegex.exec(section))) {
    const key = match[1]
    const expr = match[2]
    // Prefer production branch for expressions like: isBeta ? 'test' : 'main'
    const ternaryMatch = expr.match(/\?\s*([\s\S]*?)\s*:\s*([\s\S]*)/)
    const effectiveExpr = ternaryMatch ? ternaryMatch[2] : expr
    const urls = uniq(
      [...effectiveExpr.matchAll(/https?:\/\/[^'"\s,]+/g)].map(v => normalizeRpc(v[0]))
    )
    rpcMap[key] = urls
  }
  return rpcMap
}

function parseEvmChains(fileContent) {
  const result = []
  const blockRegex = /^\s{2}(.+?):\s\{([\s\S]*?)^\s{2}\},?$/gm
  let match
  while ((match = blockRegex.exec(fileContent))) {
    const rawKey = match[1].trim()
    const body = match[2]
    if (!body.includes("type: 'EVM'")) continue
    const key = rawKey.replace(/^'(.+)'$/, '$1')
    const nameMatch = body.match(/name:\s*'([^']+)'/)
    const nativeIdLineMatch = body.match(/nativeId:\s*([^\n,]+)/)
    const rpcRefMatch = body.match(/rpcUrl:\s*RPC_URL\.([A-Za-z0-9_]+)/)
    const chainName = nameMatch ? nameMatch[1] : key
    const nativeIdExpr = nativeIdLineMatch ? nativeIdLineMatch[1] : ''
    const nativeIds = [...nativeIdExpr.matchAll(/'0x[0-9a-fA-F]+'/g)].map(v =>
      v[0].slice(1, -1)
    )
    const nativeId = nativeIds.length > 1 ? nativeIds[1] : nativeIds[0] || ''
    const chainId = nativeId.startsWith('0x') ? Number.parseInt(nativeId, 16) : NaN
    result.push({
      key,
      chainName,
      chainId: Number.isFinite(chainId) ? chainId : null,
      rpcRef: rpcRefMatch ? rpcRefMatch[1] : null
    })
  }
  return result
}

async function probeEthChainId(url, timeoutMs = 4500) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'eth_chainId',
        params: []
      }),
      signal: controller.signal
    })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data?.result === 'string' ? data.result : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function isWhitelistedForChain(chainName, url) {
  const allowHosts = CHAIN_SPECIFIC_WHITELIST[chainName]
  if (!allowHosts?.length) return true
  try {
    const { hostname } = new URL(url)
    return allowHosts.some(host => hostname === host || hostname.endsWith(`.${host}`))
  } catch {
    return false
  }
}

function looksLikeTestnetUrl(url) {
  const lower = (url || '').toLowerCase()
  return TESTNET_KEYWORDS.some(keyword => lower.includes(keyword))
}

async function filterValidEvmRpcUrls(chainName, chainId, urls) {
  const expectedHex = chainId ? `0x${chainId.toString(16)}`.toLowerCase() : ''
  const results = await Promise.all(
    urls.map(async url => {
      if (!isWhitelistedForChain(chainName, url)) return null
      if (looksLikeTestnetUrl(url)) return null
      const remoteChainId = await probeEthChainId(url)
      if (!remoteChainId) return null
      if (!expectedHex) return url
      return remoteChainId.toLowerCase() === expectedHex ? url : null
    })
  )
  return uniq(results.filter(Boolean))
}

async function main() {
  const source = await fs.readFile(CONFIG_PATH, 'utf8')
  const rpcMap = parseRpcMap(source)
  const evmChains = parseEvmChains(source)

  const chainlistRes = await fetch(CHAINLIST_URL)
  if (!chainlistRes.ok) {
    throw new Error(`Failed to fetch chainlist: ${chainlistRes.status}`)
  }
  const chainlist = await chainlistRes.json()
  const chainlistMap = new Map(chainlist.map(item => [item.chainId, item]))

  const output = {}
  for (const chain of evmChains) {
    const baseUrls = chain.rpcRef ? rpcMap[chain.rpcRef] || [] : []
    const chainlistItem = chain.chainId ? chainlistMap.get(chain.chainId) : null
    const rawChainlistUrls = uniq(
      (chainlistItem?.rpc || []).map(url => normalizeRpc(url)).filter(Boolean)
    )
    const chainlistUrls = await filterValidEvmRpcUrls(
      chain.chainName,
      chain.chainId,
      rawChainlistUrls
    )
    const baseValidated = await filterValidEvmRpcUrls(
      chain.chainName,
      chain.chainId,
      baseUrls
    )
    output[chain.chainName] = {
      chainId: chain.chainId,
      rpcUrls: uniq([...baseValidated, ...chainlistUrls]).slice(0, 8)
    }
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf8')
  console.log(`Generated ${Object.keys(output).length} chains to ${OUTPUT_PATH}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
