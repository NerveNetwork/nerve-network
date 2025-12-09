import { ethers } from 'ethers';
import storage from '@/utils/storage';
import { ETransfer } from '@/utils/api';
import { getAssetPrice } from '@/service/api';
import { getWithdrawalGasLimit } from '@/utils/getSystemConfig';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import {
  floatToCeil,
  Times,
  Minus,
  fixNumber
} from '@/utils/util';
import { getNVMFee } from './useNVMCrossIn';


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
  isNVM?: boolean
  hId: number;
  feeDecimals: number;
  feeAssetKey: string;
  useMainAsset: boolean;
  isNVT?: boolean;
  isTRX?: boolean;
}

export default function useCrossOutFee() {
  /* const fee = ref('');
  const addFeeAmount = ref('');
  const btcFeePaiedEnough = ref(false); // btc cross oust had paid enougn for nerve pack tx
  const canAdd = ref(true); // btc cross out can add addition fee

  let btcWithdrawalInfo: IBTCWithdrawalInfo = {
    feeRate: '',
    utxos: []
  };

  let fchWithdrawalInfo: IFCHWithdrawalInfo = {
    feeRate: '',
    utxos: [],
    splitGranularity: 0
  } */

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
    const { name: targetChainName, type: targetChainType, assetKey: mainAssetKey } = targetChainInfo;
    if (targetChainType === 'NVM') {
      let res = '';
      const nvmFee = await getNVMFee(targetChainName)
      if (useMainAsset) {
        res = nvmFee
      } else {
        const [feeChainId, feeAssetId] = feeAssetKey.split('-');
        const [mainAssetChainId, mainAssetAssetId] = mainAssetKey
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
          .mul(nvmFee)
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
        res = ethers.utils.formatUnits(result, feeDecimals).toString();
      }
      return floatToCeil(res, 6);
    } else {
      
      const transfer = new ETransfer(targetChainName);
      let res = '';
      const { gasLimitOfWithdraw : gasLimit } = await getGasLimit(hId);
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
      res = floatToCeil(res, 6);
      return res;
    }
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
