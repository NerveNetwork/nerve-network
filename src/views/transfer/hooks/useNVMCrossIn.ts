import { ref, onBeforeUnmount, Ref, computed } from 'vue'
import { HeterogeneousInfo } from '@/store/types'
import { divisionDecimals, timesDecimals } from '@/utils/util'

import { getNVMBalanceList, getNVMTokenAllowance } from '@/service/api'
import nerve from 'nerve-sdk-js'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'

import { getGasLimit } from './useCrossOutFee'

export const getNVMFee = async (chainName: string) => {
  const chain = _networkInfo[chainName]
  const { gasLimitOfWithdraw, extend } = await getGasLimit(chain.chainId)
  const crossFee = await nerve.getNulsL1Fee(chain.chainId, chain.decimals)
  const gasFee = gasLimitOfWithdraw * extend
  let _fee = Number(crossFee) + gasFee + ''
  return divisionDecimals(_fee, chain.decimals)
}

export default function useNVMCrossIn(currentChain: Ref<string>) {
  const chainInfo = computed(() => {
    return _networkInfo[currentChain.value]
  })
  const balance = ref('')
  async function getBalance(
    heterogeneousInfo: HeterogeneousInfo,
    address: string,
    decimal?: number
  ) {
    const { rpcUrl, N_ChainId } = chainInfo.value
    const { contractAddress, isToken } = heterogeneousInfo

    const assetInfo = isToken
      ? {
          chainId: 0,
          assetId: 0,
          contractAddress
        }
      : { chainId: N_ChainId!, assetId: 1, contractAddress: '' }

    const result = await getNVMBalanceList(rpcUrl!, N_ChainId!, address, [assetInfo])
    balance.value = divisionDecimals(result[0].balance, decimal)
  }

  const fee = ref('')
  async function getFee() {
    const _fee = await getNVMFee(chainInfo.value.chainName)
    fee.value = _fee
  }

  const needAuth = ref(false)
  const authLoading = ref(true)
  let refreshAuth = false
  let checkAuthTimer: number
  let authAmount: string | undefined
  let authDecimal: number | undefined

  async function getNRC20Allowance(
    heterogeneousInfo: HeterogeneousInfo,
    address: string,
    amount?: string,
    decimals?: number
  ) {
    authAmount = amount
    authDecimal = decimals
    const { contractAddress, heterogeneousChainMultySignAddress } =
      heterogeneousInfo
    let _needAuth = true

    const allowance = await getNVMTokenAllowance(
      chainInfo.value.rpcUrl!,
      chainInfo.value.N_ChainId!,
      address,
      contractAddress,
      heterogeneousChainMultySignAddress
    )
    // @ts-ignore
    _needAuth = allowance - timesDecimals(amount, decimals) < 0

    setTimeout(() => {
      updateAuthState(_needAuth, false)
    }, 2000)

    if (!needAuth.value) {
      refreshAuth = false
    }
    if (checkAuthTimer) {
      clearTimeout(checkAuthTimer)
    }
    if (refreshAuth) {
      checkAuthTimer = window.setTimeout(() => {
        // @ts-ignore
        getNRC20Allowance(heterogeneousInfo, address, amount, decimals)
      }, 5000)
    }
  }
  onBeforeUnmount(() => {
    if (checkAuthTimer) {
      clearTimeout(checkAuthTimer)
    }
  })

  async function updateAuthState(_needAuth: boolean, _authLoading: boolean) {
    needAuth.value = _needAuth
    authLoading.value = _authLoading
  }

  async function approveNRC20(
    heterogeneousInfo: HeterogeneousInfo,
    address: string,
    amount: string
  ) {
    const { contractAddress, heterogeneousChainMultySignAddress } =
      heterogeneousInfo
    const data = {
      from: address,
      value: 0,
      contractAddress: contractAddress,
      methodName: 'approve',
      methodDesc: '',
      args: [heterogeneousChainMultySignAddress, amount]
    }
    const hash = await window.NaboxWallet.nai.contractCall(data)
    const res = { hash }

    if (res.hash) {
      refreshAuth = true
      getNRC20Allowance(heterogeneousInfo, address, authAmount, authDecimal)
    }
    return res
  }

  async function sendTx(
    heterogeneousInfo: HeterogeneousInfo,
    NVMAddress: string,
    nerveAddress: string,
    amount: string,
    decimal: number
  ) {
    const { contractAddress, heterogeneousChainMultySignAddress } =
      heterogeneousInfo

    let _amount = timesDecimals(amount, decimal)
    const value = !contractAddress ? _amount : 0
    const tokenAmount = contractAddress ? _amount : 0
    const nrc20Address = contractAddress ? contractAddress : ''
    const data = {
      from: NVMAddress,
      value,
      contractAddress: heterogeneousChainMultySignAddress,
      methodName: 'crossOutII',
      methodDesc: '',
      args: [nerveAddress, tokenAmount, nrc20Address, ''],
      multyAssetValues: []
    }
    // console.log(data, 'contract-data')
    const hash = await window.NaboxWallet.nai.contractCall(data)
    return { hash }
  }

  return {
    balance,
    getBalance,
    fee,
    getFee,
    needAuth,
    authLoading,
    updateAuthState,
    getNRC20Allowance,
    approveNRC20,
    sendTx
  }
}
