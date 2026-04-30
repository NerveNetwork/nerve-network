type CrossVisibilityAsset = {
  canToL1?: boolean
  assetKey?: string
} | null | undefined

const DISABLED_CROSS_NETWORKS = ['BRISE', 'Bitgert', 'TBC']
const SMART_BCH_BLOCKED_CROSS_IN_ASSET_KEY = '9-449'

export function isCrossDisabledNetwork(network: string) {
  return DISABLED_CROSS_NETWORKS.includes(network)
}

export function canShowCrossOut(
  network: string,
  isNetworkPaused: boolean,
  asset?: CrossVisibilityAsset
) {
  if (isCrossDisabledNetwork(network) || isNetworkPaused) return false
  if (!asset) return true
  return !!asset.canToL1
}

export function canShowCrossIn(
  network: string,
  isNetworkPaused: boolean,
  asset?: CrossVisibilityAsset
) {
  if (!canShowCrossOut(network, isNetworkPaused, asset)) return false
  return !(
    network === 'smartBCH' &&
    asset?.assetKey === SMART_BCH_BLOCKED_CROSS_IN_ASSET_KEY
  )
}
