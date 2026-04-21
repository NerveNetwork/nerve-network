import sdkApi from 'nerve-sdk-js/lib/api/sdk';
import { ethers, BigNumber } from 'ethers';
import { getChainInfo, timesDecimals } from '../utils/utils';
import {
  getHetergenousChainInfo,
  getHetergenousChainConfig
} from '../utils/heterogeneousChainConfig';
import { getAssetPrice, getWithdrawalGasLimit } from '../service/api';

/**
 * @param {number} chainId  the hetergenous chainId
 * @returns
 */
export async function getWithdrawalInfo(chainId) {
  const configs = getHetergenousChainConfig();
  const heterogeneousChain = getHetergenousChainInfo(chainId);
  if (!heterogeneousChain) {
    throw new Error('Invalid chain');
  }

  const { assetKey, chainName, rpcUrl } = heterogeneousChain;

  const [L1ChainId, L1AssetId] = assetKey.split('-');
  const mainAssetUSD = await getAssetPrice(+L1ChainId, +L1AssetId, false);

  const NerveInfo = getChainInfo().NERVE;
  // use NVT for fee
  const feeUSD = await getAssetPrice(
    NerveInfo.chainId,
    NerveInfo.assetId,
    true
  ); // only fee asset need be true
  const feeDecimals = 8;

  const gasLimit = await getGasLimit(chainId);

  let totalL1Fee;
  if (chainName === 'TRON') {
    totalL1Fee = gasLimit;
  } else {
    const ethereumChain = configs.Ethereum;
    const withdrawalProvider = getFallbackProvider(
      heterogeneousChain.rpcUrls || [rpcUrl]
    );
    const ethereumProvider = getFallbackProvider(
      ethereumChain.rpcUrls || [ethereumChain.rpcUrl]
    );

    const gasPrice = await withdrawalProvider.getGasPrice();
    const gasLimit_big = BigNumber.from(gasLimit);

    const ethGasPrice = await ethereumProvider.getGasPrice();
    const extraL1FeeBig = sdkApi.getL1Fee(chainId, ethGasPrice);
    totalL1Fee = gasLimit_big.mul(gasPrice).add(extraL1FeeBig);
  }
  const feeUSDBig = ethers.utils.parseUnits(feeUSD.toString(), 18);
  const mainAssetUSDBig = ethers.utils.parseUnits(mainAssetUSD.toString(), 18);
  const chainDecimals = chainName === 'TRON' ? 6 : 18;
  let result = mainAssetUSDBig
    .mul(totalL1Fee)
    .mul(ethers.utils.parseUnits('1', feeDecimals))
    .div(ethers.utils.parseUnits('1', chainDecimals))
    .div(feeUSDBig);
  // use Math.ceil to handle fee
  const numberStr = ethers.utils.formatUnits(result, feeDecimals);
  const ceil = Math.ceil(+numberStr) || 1;
  result = ethers.utils.parseUnits(ceil.toString(), feeDecimals).toString();
  const finalFee = formatEthers(result, feeDecimals);
  return {
    feeInfo: {
      amount: timesDecimals(finalFee, feeDecimals),
      assetChainId: NerveInfo.chainId,
      assetId: NerveInfo.assetId
    },
    heterogeneousChainId: chainId
  };
}

function getFallbackProvider(rpcUrls = []) {
  const providers = rpcUrls
    .filter(Boolean)
    .map((url, index) => ({
      provider: new ethers.providers.JsonRpcProvider(url),
      priority: index + 1,
      weight: index === 0 ? 2 : 1,
      stallTimeout: 1500
    }));
  if (!providers.length) {
    throw new Error('No rpc url available');
  }
  if (providers.length === 1) {
    return providers[0].provider;
  }
  return new ethers.providers.FallbackProvider(providers, 1);
}

async function getGasLimit(chainId) {
  const gasLimitConfig = await getWithdrawalGasLimit();
  return gasLimitConfig[chainId].gasLimitOfWithdraw;
}

function formatEthers(amount, decimals) {
  return ethers.utils.formatUnits(amount, decimals).toString();
}
