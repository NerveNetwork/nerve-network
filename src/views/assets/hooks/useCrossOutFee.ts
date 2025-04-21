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
    const targetChainName = targetChainInfo.name;
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
