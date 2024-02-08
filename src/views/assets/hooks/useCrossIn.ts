import { ref, onBeforeUnmount } from 'vue';
import TronLinkApi from '@/utils/tronLink';
import { ETransfer } from '@/utils/api';
import { HeterogeneousInfo } from '@/store/types';
import { useI18n } from 'vue-i18n';
import { ethers } from 'ethers';
import nerveswap from 'nerveswap-sdk';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';

export default function useCrossIn(isTron = false) {
  const { t } = useI18n();
  let TronTransfer: any;
  const EvmTransfer = new ETransfer();
  const { getWalletInfo } = useBroadcastNerveHex();
  const { provider } = getWalletInfo();

  if (isTron) {
    TronTransfer = new TronLinkApi();
    window.addEventListener('message', function (e) {
      if (!e.data.message) return;
      // 账户改变
      if (e.data.message.action === 'accountsChanged') {
        // console.log('==accountsChanged==', e.data.message.data);
        TronTransfer.selectedAddress = e.data.message.data.address;
        TRONAddress.value = e.data.message.data.address;
      }
      // 断开连接
      if (e.data.message.action === 'disconnect') {
        // console.log('==disconnect==', e.data.message.data);
        TronTransfer.selectedAddress = '';
        TRONAddress.value = '';
      }
      // 网络切换
      if (e.data.message.action === 'setNode') {
        // this.reload();
        window.location.reload();
      }
    });
  }
  const TRONAddress = ref(TronTransfer?.selectedAddress);

  async function connect() {
    if (isTron) {
      if (!TronTransfer.hasTronLink) throw t('public.public25');
      const address = await TronTransfer.requestAccount();
      /*
      * if (!TronTransfer.isReady()) {
      * // tronWeb.isReady 在锁定状态和连接被拒绝后都是false
        throw t('public.public26');
      }*/
      if (!address) {
        throw t('public.public26');
      }
      TRONAddress.value = address;
      return address;
    }
  }
  const balance = ref('');
  async function getBalance(
    heterogeneousInfo: HeterogeneousInfo,
    address: string,
    decimal?: number
  ) {
    const { contractAddress, isToken } = heterogeneousInfo;
    if (isTron) {
      if (isToken) {
        balance.value = await TronTransfer.getTrc20Balance(
          TRONAddress.value,
          contractAddress,
          decimal
        );
      } else {
        balance.value = await TronTransfer.getTrxBalance(TRONAddress.value);
      }
    } else {
      if (isToken) {
        balance.value = await EvmTransfer.getERC20Balance(
          contractAddress,
          decimal as number,
          address
        );
      } else {
        balance.value = await EvmTransfer.getEthBalance(address);
      }
    }
  }

  const fee = ref('');
  async function getFee(isToken: boolean) {
    fee.value = isTron ? '0' : await EvmTransfer.getGasPrice(isToken);
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
    if (isTron) {
      _needAuth = await TronTransfer.getTrc20Allowance(
        TRONAddress.value,
        heterogeneousChainMultySignAddress,
        contractAddress
      );
    } else {
      _needAuth = await nerveswap.evm.checkAuth({
        provider,
        tokenContract: contractAddress,
        multySignContract: heterogeneousChainMultySignAddress,
        address: address,
        amount: ethers.utils.parseUnits(amount!, decimals)
      });
      /* _needAuth = await EvmTransfer.getERC20Allowance(
        contractAddress,
        heterogeneousChainMultySignAddress,
        address,
        amount!,
        decimals!
      ); */
    }
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
    address: string
  ) {
    const { contractAddress, heterogeneousChainMultySignAddress } =
      heterogeneousInfo;
    let res: any = {};
    if (isTron) {
      res.hash = await TronTransfer.approveTrc20(
        TRONAddress.value,
        heterogeneousChainMultySignAddress,
        contractAddress
      );
    } else {
      res = await nerveswap.evm.approve({
        provider,
        tokenContract: contractAddress,
        multySignContract: heterogeneousChainMultySignAddress,
        address: address
      });
      /* res = await EvmTransfer.approveERC20(
        contractAddress,
        heterogeneousChainMultySignAddress,
        address
      ); */
    }
    if (res.hash) {
      refreshAuth = true;
      getERC20Allowance(heterogeneousInfo, address, authAmount, authDecimal);
    }
    return res;
  }

  async function sendTx(
    heterogeneousInfo: HeterogeneousInfo,
    nerveAddress: string,
    amount: string,
    address: string,
    decimal: number
  ) {
    const { contractAddress, heterogeneousChainMultySignAddress } =
      heterogeneousInfo;
    if (isTron) {
      const hash = await TronTransfer.crossOutToNerve(
        nerveAddress,
        amount,
        heterogeneousChainMultySignAddress,
        contractAddress,
        decimal
      );
      return { hash };
    } else {
      return await nerveswap.evm.crossIn({
        provider,
        multySignContract: heterogeneousChainMultySignAddress,
        nerveAddress,
        amount: ethers.utils.parseUnits(amount, decimal)._hex,
        from: address,
        tokenContract: contractAddress
      });
      /* const params = {
        multySignAddress: heterogeneousChainMultySignAddress,
        nerveAddress: nerveAddress,
        numbers: amount,
        fromAddress: address,
        contractAddress,
        decimals: decimal
      };
      // console.log(params);
      return await EvmTransfer.crossIn(params); */
    }
  }

  return {
    TRONAddress,
    connect,
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
  };
}
