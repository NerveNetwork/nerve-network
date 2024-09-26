// BTC AND BTC-like chain cross out logic
import { ref } from 'vue';
import nerveswap from 'nerveswap-sdk';
// @ts-ignore
import nerveUtil from 'nerve-sdk-js/lib/test/api/util';
import useToast from '@/hooks/useToast';
import {
  isBeta,
  timesDecimals,
  Times,
  divisionDecimals,
  Division,
  Minus,
  divisionAndFix,
  fixNumber,
  floatToCeil
} from '@/utils/util';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import { calWithdrawalFeeForBTC } from '@/utils/api';
import { getAssetPrice } from '@/service/api';

import type { IBTCWithdrawalInfo } from '../types';

interface IGetBTCFeeParams {
  amount: string;
  useMainAsset: boolean;
  feeDecimals: number;
  feeAssetKey?: string;
  isNVT?: boolean;
  withdrawalChain?: string
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

const prociderConfig = {
  201: nerveswap.btc,
  202: nerveswap.fch,
  203: nerveswap.bch
};



export default function useBTCsCrossOut(chainName?: string) {
  const hid = checkIsBTCs(chainName || 'BTC');
  const { toastError } = useToast();
  let isBTCs = !!chainName && !!hid
  const btcFeePaiedEnough = ref(false); // btc cross oust had paid enougn for nerve pack tx
  const canAdd = ref(true); // btc cross out can add addition fee
  let btcWithdrawalInfo: IBTCWithdrawalInfo = {
    feeRate: '',
    utxos: [],
    splitGranularity: 0
  };

  function checkIsBTCs(chainName: string) {
    const config = {
      BTC: 201,
      FCH: 202,
      BCH: 203
    };
    return config[chainName] || null;
  }

  async function getBTCsWithdrawalInfo(multySignAddress: string) {
    if (!multySignAddress) return;
    const provider = prociderConfig[hid];
    let info;
    if (hid === 201) {
      info = await provider.getWithdrawInfo(!isBeta, multySignAddress);
    } else {
      info = await provider.getWithdrawInfo(multySignAddress, hid);
    }
    btcWithdrawalInfo = info;
  }

  function validBTCsAddress(address: string) {
    const provider = prociderConfig[hid];
    let valid = true;
    if (hid === 201) {
      valid = provider.validateAddress(!isBeta, address);
    } else {
      valid = provider.validateAddress(address);
    }
    return valid
  }

  async function getBTCsCrossOutFee(params: IGetBTCFeeParams) {
    let res = ''
    try {
      if (hid === 201) {
        res = await getBTCCrossOutFee(params);
      } else {
        res = await getFCHCrossOutFee(params);
      }
    } catch(e) {
      res = '';
      toastError(e);
    }
    return res
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
        v => v.name === 'BTC'
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
    res = floatToCeil(res, 6);
    return res;
  }

  async function getFCHCrossOutFee(params: IGetBTCFeeParams) {
    const {
      amount,
      useMainAsset,
      feeDecimals,
      feeAssetKey = '',
      isNVT = false,
      withdrawalChain = 'FCH'
    } = params;
    let res = '';
    try {
      const { feeRate, utxos, splitGranularity } = btcWithdrawalInfo;
      const provider = prociderConfig[hid]
      let fchFeeAmount = provider.getWithdrawalFee(
        utxos,
        feeRate,
        timesDecimals(amount || '0.0001', 8),
        splitGranularity
      )
      fchFeeAmount = Times(fchFeeAmount, 1.3).toFixed(0);
      if (useMainAsset) {
        res = calWithdrawalFeeForBTC(fchFeeAmount, '', '', feeDecimals, true);
      } else {
        const targetChainInfo = Object.values(_networkInfo).find(
          v => v.name === withdrawalChain
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
          fchFeeAmount,
          L1MainAssetUSD,
          feeAssetUSD,
          feeDecimals,
          false,
          isNVT
        );
      }
    } catch (e) {
      console.log(e, 234234)
      res = '';
      toastError(e);
    }
    console.log(res, 234)
    res = floatToCeil(res, 6);
    return res;
  }

  async function getBTCsAddFeeAmount(params: IGetBTCAddFeeAmount) {
    if (hid === 201) {
      return await getBTCAddFeeAmount(params);
    } else {
      return await getFCHAddFeeAmount(params);
    }
  }

  async function getBTCAddFeeAmount(params: IGetBTCAddFeeAmount) {
    const { feeInfo, hash, hId, outerTxHash } = params;

    if (hId !== 201) return ''

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
    const btcInfo = Object.values(_networkInfo).find(v => v.name === 'BTC')!;
    let addFeeAmount = '';
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
        addFeeAmount = speedUpFee
          ? divisionAndFix(Times(speedUpFee, 1.3), 8, 8)
          : '';
      } else {
        btcFeePaiedEnough.value = false;
        const diff = Minus(requestBTC, feeInfo.value).toFixed();
        // @ts-ignore
        addFeeAmount = diff > 0 ? diff : '';
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
          addFeeAmount =
            (feeInfo.symbol === 'NVT'
              ? Math.ceil(+finalAmount)
              : finalAmount) + '';
        } else {
          addFeeAmount = '';
        }
      } else {
        btcFeePaiedEnough.value = false;
        const diff = Minus(
          Times(requestBTC, L1MainAssetUSD),
          Times(feeInfo.value, feeAssetUSD)
        ).toFixed();
        // @ts-ignore
        if (diff > 0) {
          const _amount = Division(diff, feeAssetUSD).toFixed();
          addFeeAmount =
            (feeInfo.symbol === 'NVT' ? Math.ceil(+_amount) : _amount) + '';
        } else {
          addFeeAmount = '';
        }
      }
    }
    return addFeeAmount
    
  }

  async function getFCHAddFeeAmount(params: IGetBTCAddFeeAmount) {
    const { feeInfo, hash, hId, outerTxHash } = params;
  
    if (hId !== 202 && hId !== 203) return ''

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
    const requestFCH = divisionDecimals(minimumFee, 8);
    const chainName = hId === 202 ? 'FCH' : 'BCH'
    const fchInfo = Object.values(_networkInfo).find(v => v.name === chainName)!;
    let addFeeAmount = ''
    if (feeInfo.assetKey === fchInfo.assetKey) {
      const diff = Minus(requestFCH, feeInfo.value).toFixed();
      // @ts-ignore
      addFeeAmount = diff > 0 ? diff : '';
    } else {
      const [feeChainId, feeAssetId] = feeInfo.assetKey.split('-');
      const [fchChainId, fchAssetId] = fchInfo.assetKey.split('-');
      const feeAssetUSD = (await getAssetPrice(
        +feeChainId,
        +feeAssetId,
        true // only fee asset need be true
      )) as string;
      const L1MainAssetUSD = (await getAssetPrice(
        +fchChainId,
        +fchAssetId
      )) as string;
      const diff = Minus(
        Times(requestFCH, L1MainAssetUSD),
        Times(feeInfo.value, feeAssetUSD)
      ).toFixed();
      // @ts-ignore
      if (diff > 0) {
        const _amount = Division(diff, feeAssetUSD).toFixed();
        addFeeAmount =
          (feeInfo.symbol === 'NVT' ? Math.ceil(+_amount) : _amount) + '';
      } else {
        addFeeAmount = '';
      }
    }
    return addFeeAmount
    
  }

  return {
    isBTCs,
    btcHid: hid,
    checkIsBTCs,
    getBTCsWithdrawalInfo,
    validBTCsAddress,
    getBTCsCrossOutFee,
    btcFeePaiedEnough,
    canAdd,
    getBTCsAddFeeAmount
  };
}
