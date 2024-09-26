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

  /* async function getBTCWithdrawalInfo(multySignAddress: string) {
    if (!multySignAddress) return;
    const info = await nerveswap.btc.getBTCWithdrawalInfo(
      !isBeta,
      multySignAddress
    );
    btcWithdrawalInfo = info;
  } */

  /* async function getBTCCrossOutFee(params: IGetBTCFeeParams) {
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
    } catch (e) {
      res = '';
      toastError(e);
    }
    fee.value = floatToCeil(res, 6);
    return res;
  } */

  /* async function getBTCAddFeeAmount(params: IGetBTCAddFeeAmount) {
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
      const btcInfo = Object.values(_networkInfo).find(v => v.name === 'BTC')!;
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
          // @ts-ignore
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
          // @ts-ignore
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

  async function getFCHAddFeeAmount(params: IGetBTCAddFeeAmount) {
    const { feeInfo, hash, hId, outerTxHash } = params;
    if (hId === 202 || hId === 203) {
      const requestFeeInfo = await nerveUtil.getMinimumFeeOfWithdrawal(
        hId,
        hash
      );
      console.log(requestFeeInfo, '2342423')
      const { minimumFee, utxoSize, feeRate } = requestFeeInfo;
      if (minimumFee && utxoSize && feeRate) {
        canAdd.value = true;
      } else {
        canAdd.value = false;
      }
      const requestFCH = divisionDecimals(minimumFee, 8);
      const chainName = hId === 202 ? 'FCH' : 'BCH'
      const fchInfo = Object.values(_networkInfo).find(v => v.name === chainName)!;
      if (feeInfo.assetKey === fchInfo.assetKey) {
        const diff = Minus(requestFCH, feeInfo.value).toFixed();
        // @ts-ignore
        addFeeAmount.value = diff > 0 ? diff : '';
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
          addFeeAmount.value =
            (feeInfo.symbol === 'NVT' ? Math.ceil(+_amount) : _amount) + '';
        } else {
          addFeeAmount.value = '';
        }
        // console.log(addFeeAmount.value, '=====')
      }
    }
  } */

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

  /* async function getFCHWithdrawalInfo(senderAddress: string, hid: number) {
    if (!senderAddress) return;
    const provider = hid === 202 ? nerveswap.fch : nerveswap.bch
    const info = await provider.getWithdrawInfo(senderAddress, hid);
    // console.log(info, 234)
    fchWithdrawalInfo = info;
  }

  async function getFCHCrossOutFee(params: IGetBTCFeeParams & { withdrawalChain: string }) {
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
      const { feeRate, utxos, splitGranularity } = fchWithdrawalInfo;
      const provider = withdrawalChain === 'FCH' ? nerveswap.fch : nerveswap.bch
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
    fee.value = floatToCeil(res, 6);
    return res;
  } */

  return {
    getCrossOutFee,
    // getBTCWithdrawalInfo,
    // getBTCCrossOutFee,
    // getBTCAddFeeAmount,
    // getFCHAddFeeAmount,
    getAddFeeAmount,
    // getFCHWithdrawalInfo,
    // getFCHCrossOutFee
  };
}
