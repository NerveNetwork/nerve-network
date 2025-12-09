import {
  divisionAndFix,
  Times,
  checkCanToL1,
  genId,
  isBeta,
  checkCanToL1OnCurrent,
  divisionDecimals
} from '@/utils/util'
import { listen } from '@/service/socket/promiseSocket'
import config from '@/config'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import http from '@/service'
import { HeterogeneousInfo } from '@/store/types'
import { getCrossChainInfo } from '@/utils/getSystemConfig'
import storage from '@/utils/storage'
import {
  calDecimalsAndSymbol,
  NSymbol,
  NKey,
  NDecimals
} from '@/constants/constants'

const url = config.WS_URL

//广播hex
export async function broadcastHex(txHex: string) {
  const res = await http.rPost('broadcastTx', txHex)
  return res.result || res
}

// 获取区块信息
export async function getBlockInfo() {
  const res = await http.rPost('getNodeInfo')
  return res?.result || null
}

/**
 * @desc 通过symbol获取资产价格
 * @param symbol 资产symbol
 */
export async function uniAssetPrice(symbol: string) {
  const channel = 'uniAssetPrice'
  const params = {
    method: channel,
    id: genId(),
    params: {
      symbol
    }
  }
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  })
}

/**
 * @desc 查询资产价格
 * @param chainId 资产chainId
 * @param assetId 资产assetId
 * @param isForCalFee 是否是提现手续费资产
 */
export async function getAssetPrice(
  chainId: number,
  assetId: number,
  isForCalFee?: boolean
) {
  const params = isForCalFee ? [chainId, assetId, 'FEE'] : [chainId, assetId]
  const key = chainId + '-' + assetId
  const res = await http.rPost('getBestSymbolPrice', params)
  let result = res?.result || '0'
  if (key === NKey) {
    result = divisionDecimals(result, NDecimals)
  }
  return result
}

/**
 * @desc 查询NVT价格, getBestSymbolPrice会在基础上扣除20%
 * @param chainId 资产chainId
 * @param assetId 资产assetId
 */
export async function getNVTPrice(chainId: number, assetId: number) {
  const res = await http.rPost('getBestSymbolPrice', [chainId, assetId])
  return res?.result || ''
}

/**
 * @desc 查询账户资产详情
 * @param chainId 资产chainId
 * @param assetId 资产assetId
 * @param address 账户nerve地址
 */
export async function getAssetBalance(
  chainId: number,
  assetId: number,
  address: string
) {
  const res = await http.rPost('getAccountBalance', [chainId, assetId, address])
  return res?.result || null
}

/**
 * @desc 获取账户资产列表
 * @param address 账户nerve地址
 */
export async function getAssetList(address = config.destroyAddress) {
  const result = await http.rPost('getAccountLedgerListV2', address)
  let res = result?.result
  if (!res) return []
  // adapt V2
  const crossChainInfo = storage.get('crossChainInfo')
  if (!crossChainInfo) {
    await getCrossChainInfo()
  }
  res.map((v: any) => {
    v.assetKey = v.chainId + '-' + v.assetId
    v.usdPrice = v.price
    v.balanceStr = v.balance
    v.list?.map((k: any) => {
      k.contractAddress = k.contract
      k.heterogeneousChainId = k.hId
      if (crossChainInfo && crossChainInfo[k.hId]) {
        const info = crossChainInfo[k.hId]
        k.chainName = info.assetSymbol
        k.heterogeneousChainMultySignAddress = info.multySignAddress
      } else {
        k.chainName = '' // TODO
        k.heterogeneousChainMultySignAddress = '' // TODO
      }
    })
    v.heterogeneousList = v.list
  })
  // 屏蔽H_NULS
  res = res.filter((asset: any) => {
    return asset.registerChainId !== 301
  })
  // 主网隐藏tron相关内容
  if (!isBeta) {
    // 过滤tron资产
    /*res = res.filter((asset: any) => {
      // return asset.assetKey !== '9-218' && asset.assetKey !== '9-219' && asset.registerChainId !== 108
      return asset.assetKey !== '9-219';
    });*/

    // 屏蔽BTE
    res = res.filter((asset: any) => {
      return asset.assetKey !== '9-528'
    })

    // 禁止SNEGY, MC2, XTMC跨链
    res.map((asset: any) => {
      const assetKey = asset.assetKey
      if (
        assetKey === '9-76' ||
        assetKey === '9-211' ||
        assetKey === '9-240' ||
        assetKey === '9-302'
      ) {
        asset.source = 1
      }
    })
  }
  res.map((item: any) => {
    const { decimals, symbol } = calDecimalsAndSymbol(item)
    item.decimals = decimals
    item.symbol = symbol
    const decimal = item.decimals
    item.number = divisionAndFix(item.total, decimal, decimal)
    item.locking = divisionAndFix(item.lock, decimal)
    // item.available = divisionAndFix(item.balanceStr, decimal, decimal);
    if (symbol == NSymbol) {
      item.valuation = Times(
        item.number || 0,
        divisionDecimals(item.usdPrice, decimals)
      ).toFixed(2)
      item.icon = ''
    } else {
      item.valuation = Times(item.number || 0, item.usdPrice).toFixed(2)
    }
    item.available = divisionAndFix(item.balanceStr, decimal, decimal)
    item.listAvailable = divisionAndFix(item.balanceStr, decimal, 6)
    item.originNetwork = Object.values(_networkInfo).find(
      v => v.chainId === item.registerChainId
    )?.label
    item.canToL1 = checkCanToL1(item)
    item.canToL1OnCurrent = checkCanToL1OnCurrent(item)
    item.registerContract = getContractAddress(
      item.heterogeneousList,
      item.registerChainId
    )
  })
  // 返回按字母排序
  const sortDataBySymbol = [...res]
    .sort((a, b) => (a.symbol.toUpperCase() < b.symbol.toUpperCase() ? 1 : -1))
    .sort((a, b) => (Number(a.available) < Number(b.available) ? 1 : -1))
  // .sort((a, b) => (a.valuation < b.valuation ? 1 : -1));
  const mainSymbol = sortDataBySymbol.find(item => item.symbol === 'NVT')
  const mainSymbolIndex = sortDataBySymbol.findIndex(
    item => item.symbol === 'NVT'
  )
  sortDataBySymbol.splice(mainSymbolIndex, 1)
  sortDataBySymbol.unshift(mainSymbol)
  return sortDataBySymbol
}

function getContractAddress(
  heterogeneousList: HeterogeneousInfo[],
  registerChainId: number
): string {
  if (!heterogeneousList || !heterogeneousList.length) {
    return ''
  }
  const info = heterogeneousList.find(
    v => v.heterogeneousChainId === registerChainId
  )
  return info ? info.contractAddress : ''
}

export async function getTx(hash: string) {
  const res = await http.rPost('getTx', hash)
  return res?.result || null
}

export async function getTokenHolders(assetKey: string) {
  const res = await http.rPost('getHoldersByAssetKey', [assetKey, 1, 6])
  return res?.result?.list || []
}

export async function getTronTx(hash: string) {
  const origin = config.isBeta
    ? 'https://shastapi.tronscan.org'
    : 'https://apilist.tronscan.org'
  const baseUrl = origin.split('/#')[0]
  const res = await http.get({
    url: baseUrl + '/api/transaction-info?hash=' + hash
  })
  let status = 0
  if (res && res.block) {
    if (res.confirmed) {
      status = res.contractRet === 'SUCCESS' ? 1 : -1
    }
    return {
      status,
      ...res
    }
  } else {
    return null
  }
  /* if (res && res.confirmed === true) {
    return {
      status: 1,
      ...res
    };
  }
  return {
    status: 0,
    ...res
  }; */
}

export async function getFCHTx(hash: string) {
  const baseUrl = _networkInfo.FCH.origin
  const res = await http.get({
    url: baseUrl + '/APIP/sn2/v1/txByIds',
    params: { ids: hash }
  })
  return res.data || null
}

// withdrawal gasLimit
export async function withdrawalGasLimit() {
  const res = await http.rPost('gasLimitOfHeterogeneousChains')
  return res?.result || null
}

export async function crossChainInfo() {
  const res = await http.rPost('getCrossChainInfo')
  return res?.result || null
}

export async function getDeployMinter(chainId: number) {
  const res = await http.get({
    url: `${config.sys_url}/api/minter/${chainId}`
  })
  return res
}

export async function registerCrossChainAsset(
  contractAddress: string,
  owner: string,
  txHash: string,
  chainId: number,
  assetId: string
) {
  const result = await http.post({
    url: `${config.sys_url}/api/crosschain/asset`,
    data: {
      contractAddress,
      owner,
      txHash,
      chainId,
      assetId
    }
  })
  if (result.code === 0) {
    return true
  } else {
    throw result.msg
  }
}

export async function doListingToken(chainId: string, contract: string) {
  const result = await http.post({
    url: `${config.sys_url}/api//register/asset`,
    data: {
      chainId,
      contract
    }
  })
  if (result.code === 0) {
    return true
  } else {
    throw result.msg
  }
}

function createRPCParams(method: string, data: any) {
  return {
    jsonrpc: '2.0',
    id: Math.floor(Math.random() * 1000),
    method,
    params: data
  }
}

export async function getNVMBalanceList(
  apiUrl: string,
  chainId: number,
  address: string,
  assets: { chainId: number; assetId: number; contractAddress: string }[]
) {
  const res = await http.request<any>({
    url: apiUrl,
    method: 'POST',
    data: createRPCParams('getBalanceList', [chainId, address, assets])
  })
  return res.result
}

export async function getNVMTokenAllowance(
  apiUrl: string,
  chainId: number,
  owner: string,
  tokenContract: string,
  spenderContract: string
) {
  const params = createRPCParams('invokeView', [
    chainId,
    tokenContract,
    'allowance',
    '(Address owner, Address spender) return BigInteger',
    [owner, spenderContract]
  ])
  const res = await http.request<any>({
    url: apiUrl,
    method: 'POST',
    data: params
  })
  return res?.result?.result || '0'
}

export async function getNVMTx(apiUrl: string, chainId: number, hash: string) {
  const res = await http.request<any>({
    url: apiUrl,
    method: 'POST',
    data: createRPCParams('getTx', [chainId, hash])
  })
  // const res = await http.rPost('getTx', hash)
  return res?.result || null
}
