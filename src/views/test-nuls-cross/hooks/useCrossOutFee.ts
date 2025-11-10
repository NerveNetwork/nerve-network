import storage from '@/utils/storage';
import { getAssetPrice } from '@/service/api';
import { getWithdrawalGasLimit } from '@/utils/getSystemConfig';
import {
  floatToCeil,
  Times,
  Minus,
  fixNumber
} from '@/utils/util';
import useCrossIn from './useNULSCrossIn';
import { ethers } from 'ethers';


export async function getGasLimit(chainId: number) {
  let gasLimitConfig = storage.get('gasLimitConfig');
  if (!gasLimitConfig) {
    gasLimitConfig = await getWithdrawalGasLimit();
  }
  if (!gasLimitConfig) {
    throw 'Fail to get GasLimit';
  }
  return gasLimitConfig[chainId];
}

interface IGetFeeParams {
  hId: number;
  feeDecimals: number;
  feeAssetKey: string;
  useMainAsset: boolean;
  isNVT?: boolean;
  isTRX?: boolean;
}

export default function useCrossOutFee() {
  const { getFee } = useCrossIn()
  
  async function getCrossOutFee(params: IGetFeeParams = {} as IGetFeeParams) {
    
    const {
      hId,
      feeDecimals,
      feeAssetKey,
      useMainAsset,
      isNVT = false,
      isTRX = false
    } = params;
    
    const fee = await getFee()
    let res = '';
    if (useMainAsset) {
      res = fee
    } else {
      const [feeChainId, feeAssetId] = feeAssetKey.split('-');
      const [mainAssetChainId, mainAssetAssetId] = '5-194'
      const feeAssetUSD = (await getAssetPrice(
        +feeChainId,
        +feeAssetId,
        true // only fee asset need be true
      )) as string;
      const L1MainAssetUSD = (await getAssetPrice(
        +mainAssetChainId,
        +mainAssetAssetId
      )) as string;
      

      const feeUSDBig = ethers.utils.parseUnits(feeAssetUSD.toString(), 18);
      const mainAssetUSDBig = ethers.utils.parseUnits(
        L1MainAssetUSD.toString(),
        18
      );
      let result: any = mainAssetUSDBig
        .mul(fee)
        .mul(ethers.utils.parseUnits('1', feeDecimals))
        .div(ethers.utils.parseUnits('1', 18))
        .div(feeUSDBig);
      if (isNVT || isTRX) {
        // 如果是nvt，向上取整
        const numberStr = ethers.utils.formatUnits(result, feeDecimals);
        const ceil = Math.ceil(+numberStr) || 1;
        result = ethers.utils
          .parseUnits(ceil.toString(), feeDecimals)
          .toString();
      }
      const finalFee = ethers.utils.formatUnits(result, feeDecimals).toString();
      res = finalFee;
    }
    res = floatToCeil(res, 6);
    return res;
  }

  async function getAddFeeAmount(params: IGetFeeParams, paied: string) {
    let addFeeAmount = ''
    try {
      const currentFee = await getCrossOutFee(params);
      const diff = Minus(currentFee, paied).toFixed();
      // @ts-ignore
      if (diff > 0) {
        const { feeDecimals, isNVT, isTRX } = params;
        const amount = fixNumber(Times(diff, 1.1).toFixed(), feeDecimals);
        // @ts-ignore
        addFeeAmount = isNVT || isTRX ? Math.ceil(amount) + '' : amount;
      } else {
        addFeeAmount = '';
      }
    } catch {
      addFeeAmount = '';
    }
    return addFeeAmount
  }
  return {
    getCrossOutFee,
    getAddFeeAmount
  };
}
