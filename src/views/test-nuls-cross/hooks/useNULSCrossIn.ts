import { ref, onBeforeUnmount } from 'vue'
import { HeterogeneousInfo } from '@/store/types'
import { divisionDecimals, timesDecimals } from '@/utils/util'

import { getNULSBalanceList, getTokenAllowance } from '@/service/api'
import nerve from 'nerve-sdk-js'
import { H_NULS } from '@/utils/heterogeneousChainConfig'

import { getGasLimit } from './useCrossOutFee'

export default function useCrossIn() {
  const balance = ref('')
  async function getBalance(
    heterogeneousInfo: HeterogeneousInfo,
    address: string,
    decimal?: number
  ) {
    const { contractAddress, isToken } = heterogeneousInfo

    const assetInfo = isToken
      ? {
          chainId: 0,
          assetId: 0,
          contractAddress
        }
      : { chainId: 1, assetId: 1, contractAddress: '' }

    const result = await getNULSBalanceList(address, [assetInfo])
    balance.value = divisionDecimals(result[0].balance, decimal)
  }

  const fee = ref('')
  async function getFee() {
    const { gasLimitOfWithdraw, extend } = await getGasLimit(H_NULS.chainId)
    const crossFee = await nerve.getNulsL1Fee(H_NULS.chainId, H_NULS.decimals)
    const gasFee = gasLimitOfWithdraw * extend
    let _fee = Number(crossFee) + gasFee + ''
    fee.value = divisionDecimals(_fee, 4)
    return fee.value
  }

  const needAuth = ref(false);
  const authLoading = ref(true);
  let refreshAuth = false;
  let checkAuthTimer: number;
  let authAmount: string | undefined;
  let authDecimal: number | undefined;

  async function getERC20Allowance(
    heterogeneousInfo: HeterogeneousInfo,
    address: string,
    amount?: string,
    decimals?: number
  ) {
    authAmount = amount;
    authDecimal = decimals;
    const { contractAddress, heterogeneousChainMultySignAddress } =
      heterogeneousInfo;
    let _needAuth = true;
    
    const allowance = await getTokenAllowance(address, contractAddress, heterogeneousChainMultySignAddress)
    // @ts-ignore
    _needAuth = allowance - timesDecimals(amount, decimals) < 0

    console.log(_needAuth, '234', allowance, timesDecimals(amount, decimals));
    
    setTimeout(() => {
      updateAuthState(_needAuth, false);
    }, 2000);

    if (!needAuth.value) {
      refreshAuth = false;
    }
    if (checkAuthTimer) {
      clearTimeout(checkAuthTimer);
    }
    if (refreshAuth) {
      checkAuthTimer = window.setTimeout(() => {
        // @ts-ignore
        getERC20Allowance(heterogeneousInfo, address, amount, decimals);
      }, 5000);
    }
  }
  onBeforeUnmount(() => {
    if (checkAuthTimer) {
      clearTimeout(checkAuthTimer);
    }
  });

  async function updateAuthState(_needAuth: boolean, _authLoading: boolean) {
    needAuth.value = _needAuth;
    authLoading.value = _authLoading;
  }

  async function approveERC20(
    heterogeneousInfo: HeterogeneousInfo,
    address: string,
    amount: string
  ) {
    const { contractAddress, heterogeneousChainMultySignAddress } =
      heterogeneousInfo;
    const data = {
      from: address,
      value: 0,
      contractAddress: contractAddress,
      methodName: 'approve',
      methodDesc: '',
      args: [heterogeneousChainMultySignAddress, amount]
    };
    const hash = await window.NaboxWallet.nai.contractCall(data);
    const res = { hash }
    
    if (res.hash) {
      refreshAuth = true;
      getERC20Allowance(heterogeneousInfo, address, authAmount, authDecimal);
    }
    return res;
  }

  async function sendTx(
    heterogeneousInfo: HeterogeneousInfo,
    NULSAddress: string,
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
      from: NULSAddress,
      value,
      contractAddress: heterogeneousChainMultySignAddress,
      methodName: "crossOutII",
      methodDesc: "",
      args: [nerveAddress, tokenAmount, nrc20Address, ''],
      multyAssetValues: []
    }
    console.log(data, 'contract-data');
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
    getERC20Allowance,
    approveERC20,
    sendTx
  }
}
