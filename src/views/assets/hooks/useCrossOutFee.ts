import { ref } from 'vue';
// @ts-ignore
import nerveUtil from 'nerve-sdk-js/lib/test/api/util';
import useToast from '@/hooks/useToast';
import storage from '@/utils/storage';
import { ETransfer, calWithdrawalFeeForBTC } from '@/utils/api';
import { getAssetPrice } from '@/service/api';
import { getWithdrawalGasLimit } from '@/utils/getSystemConfig';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import {
  floatToCeil,
  isBeta,
  timesDecimals,
  Times,
  divisionDecimals,
  Division,
  Minus,
  divisionAndFix,
  fixNumber
} from '@/utils/util';
import nerveswap from 'nerveswap-sdk';

import type { IBTCWithdrawalInfo } from '../types';

async function getGasLimit(chainId: number) {
  let gasLimitConfig = storage.get('gasLimitConfig');
  if (!gasLimitConfig) {
    gasLimitConfig = await getWithdrawalGasLimit();
  }
  if (!gasLimitConfig) {
    throw 'Fail to get GasLimit';
  }
  return gasLimitConfig[chainId].gasLimitOfWithdraw;
}

interface IGetFeeParams {
  hId: number;
  feeDecimals: number;
  feeAssetKey: string;
  useMainAsset: boolean;
  isNVT?: boolean;
  isTRX?: boolean;
}

interface IGetBTCFeeParams {
  amount: string;
  useMainAsset: boolean;
  feeDecimals: number;
  feeAssetKey?: string;
  isNVT?: boolean;
}

interface IGetBTCAddFeeAmount {
  hash: string;
  outerTxHash: string;
  hId: number;
  feeInfo: {
    value: string;
    symbol: string;
    decimals: number;
    assetKey: string;
  };
}

export default function useCrossOutFee() {
  const { toastError } = useToast();
  const fee = ref('');
  const addFeeAmount = ref('');
  const btcFeePaiedEnough = ref(false); // btc cross oust had paid enougn for nerve pack tx
  const canAdd = ref(true); // btc cross out can add addition fee

  let btcWithdrawalInfo: IBTCWithdrawalInfo = {
    feeRate: '',
    utxos: []
  };

  async function getCrossOutFee(params: IGetFeeParams = {} as IGetFeeParams) {
    const {
      hId,
      feeDecimals,
      feeAssetKey,
      useMainAsset,
      isNVT = false,
      isTRX = false
    } = params;
    const targetChainInfo = Object.values(_networkInfo).find(
      v => v.chainId === hId
    );
    if (!targetChainInfo) return '';
    const targetChainName = targetChainInfo.chainName;
    const transfer = new ETransfer(targetChainName);
    let res = '';
    const gasLimit = await getGasLimit(hId);
    if (useMainAsset) {
      if (targetChainName === 'TRON') {
        res = transfer.calWithdrawalFeeForTRON(
          gasLimit,
          '',
          '',
          feeDecimals,
          true
        );
      } else {
        res = await transfer.calWithdrawalFee(
          '',
          '',
          gasLimit,
          feeDecimals,
          true,
          hId
        );
      }
    } else {
      const [feeChainId, feeAssetId] = feeAssetKey.split('-');
      const [mainAssetChainId, mainAssetAssetId] =
        targetChainInfo.assetKey.split('-');
      const feeAssetUSD = (await getAssetPrice(
        +feeChainId,
        +feeAssetId,
        true // only fee asset need be true
      )) as string;
      const L1MainAssetUSD = (await getAssetPrice(
        +mainAssetChainId,
        +mainAssetAssetId
      )) as string;
      if (targetChainName === 'TRON') {
        res = transfer.calWithdrawalFeeForTRON(
          gasLimit,
          L1MainAssetUSD,
          feeAssetUSD,
          feeDecimals,
          false,
          isNVT
        );
      } else {
        res = await transfer.calWithdrawalFee(
          L1MainAssetUSD,
          feeAssetUSD,
          gasLimit,
          feeDecimals,
          false,
          hId,
          isNVT,
          isTRX
        );
      }
    }
    fee.value = floatToCeil(res, 6);
    return res;
  }

  async function getBTCWithdrawalInfo(multySignAddress: string) {
    if (!multySignAddress) return;
    const info = await nerveswap.btc.getBTCWithdrawalInfo(
      !isBeta,
      multySignAddress
    );
    btcWithdrawalInfo = info;
  }

  async function getBTCCrossOutFee(params: IGetBTCFeeParams) {
    const {
      amount,
      useMainAsset,
      feeDecimals,
      feeAssetKey = '',
      isNVT = false
    } = params;
    let res = '';
    try {
      const { feeRate, utxos } = btcWithdrawalInfo;
      let btcFeeAmount = nerveswap.btc.getBTCWithdrawalFee(
        utxos,
        feeRate,
        timesDecimals(amount || '0.0001', 8)
      );
      btcFeeAmount = Times(btcFeeAmount, 1.3).toFixed(0);
      if (useMainAsset) {
        res = calWithdrawalFeeForBTC(btcFeeAmount, '', '', feeDecimals, true);
      } else {
        const targetChainInfo = Object.values(_networkInfo).find(
          v => v.chainName === 'BTC'
        );
        const [feeChainId, feeAssetId] = feeAssetKey!.split('-');
        const [mainAssetChainId, mainAssetAssetId] =
          targetChainInfo!.assetKey.split('-');
        const feeAssetUSD = (await getAssetPrice(
          +feeChainId,
          +feeAssetId,
          true // only fee asset need be true
        )) as string;
        const L1MainAssetUSD = (await getAssetPrice(
          +mainAssetChainId,
          +mainAssetAssetId
        )) as string;
        res = calWithdrawalFeeForBTC(
          btcFeeAmount,
          L1MainAssetUSD,
          feeAssetUSD,
          feeDecimals,
          false,
          isNVT
        );
      }
    } catch (e) {
      res = '';
      toastError(e);
    }
    fee.value = floatToCeil(res, 6);
    return res;
  }

  async function getBTCAddFeeAmount(params: IGetBTCAddFeeAmount) {
    const { feeInfo, hash, hId, outerTxHash } = params;
    if (hId === 201) {
      const requestFeeInfo = await nerveUtil.getMinimumFeeOfWithdrawal(
        hId,
        hash
      );
      const { minimumFee, utxoSize, feeRate } = requestFeeInfo;
      if (minimumFee && utxoSize && feeRate) {
        canAdd.value = true;
      } else {
        canAdd.value = false;
      }
      const requestBTC = divisionDecimals(minimumFee, 8);
      const btcInfo = Object.values(_networkInfo).find(
        v => v.chainName === 'BTC'
      )!;
      if (feeInfo.assetKey === btcInfo.assetKey) {
        // use btc as fee
        if (outerTxHash) {
          btcFeePaiedEnough.value = true;
          const speedUpFee = await nerveswap.btc.getBTCSpeedUpAmount(
            !isBeta,
            utxoSize,
            feeRate
          );
          // console.log(speedUpFee, 'btc-enough');
          addFeeAmount.value = speedUpFee
            ? divisionAndFix(Times(speedUpFee, 1.3), 8, 8)
            : '';
        } else {
          btcFeePaiedEnough.value = false;
          const diff = Minus(requestBTC, feeInfo.value).toFixed();
          addFeeAmount.value = diff > 0 ? diff : '';
        }
      } else {
        const [feeChainId, feeAssetId] = feeInfo.assetKey.split('-');
        const [btcChainId, btcAssetId] = btcInfo.assetKey.split('-');
        const feeAssetUSD = (await getAssetPrice(
          +feeChainId,
          +feeAssetId,
          true // only fee asset need be true
        )) as string;
        const L1MainAssetUSD = (await getAssetPrice(
          +btcChainId,
          +btcAssetId
        )) as string;
        if (outerTxHash) {
          btcFeePaiedEnough.value = true;
          const speedUpFee = await nerveswap.btc.getBTCSpeedUpAmount(
            !isBeta,
            utxoSize,
            feeRate
          );
          if (speedUpFee) {
            // console.log(speedUpFee, 'btc-enough');
            const _amount = Division(
              Times(divisionDecimals(speedUpFee, 8), L1MainAssetUSD).toFixed(),
              feeAssetUSD
            ).toFixed();
            const finalAmount = fixNumber(
              Times(_amount, 1.3).toFixed(),
              feeInfo.decimals
            );
            addFeeAmount.value =
              (feeInfo.symbol === 'NVT'
                ? Math.ceil(+finalAmount)
                : finalAmount) + '';
          } else {
            addFeeAmount.value = '';
          }
        } else {
          btcFeePaiedEnough.value = false;
          const diff = Minus(
            Times(requestBTC, L1MainAssetUSD),
            Times(feeInfo.value, feeAssetUSD)
          ).toFixed();
          if (diff > 0) {
            const _amount = Division(diff, feeAssetUSD).toFixed();
            addFeeAmount.value =
              (feeInfo.symbol === 'NVT' ? Math.ceil(+_amount) : _amount) + '';
          } else {
            addFeeAmount.value = '';
          }
        }
      }
    }
  }

  async function getAddFeeAmount(params: IGetFeeParams, paied: string) {
    try {
      const currentFee = await getCrossOutFee(params);
      const diff = Minus(currentFee, paied).toFixed();
      // @ts-ignore
      if (diff > 0) {
        const { feeDecimals, isNVT, isTRX } = params;
        const amount = fixNumber(Times(diff, 1.1).toFixed(), feeDecimals);
        addFeeAmount.value = isNVT || isTRX ? Math.ceil(amount) + '' : amount;
      } else {
        addFeeAmount.value = '';
      }
    } catch {
      addFeeAmount.value = '';
    }
  }

  return {
    fee,
    getCrossOutFee,
    getBTCWithdrawalInfo,
    getBTCCrossOutFee,
    addFeeAmount,
    btcFeePaiedEnough,
    canAdd,
    getBTCAddFeeAmount,
    getAddFeeAmount
  };
}
