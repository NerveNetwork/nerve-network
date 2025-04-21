import { isBeta } from '@/utils/util';
export const NKey = isBeta ? '2-1' : '1-1';
export const NSymbol = 'NAI';
export const NDecimals = 4;
export const NULSDecimals = 8;
export const NDiffDeciamsl = NULSDecimals - NDecimals;

interface IToken {
  chainId: number;
  assetId: number;
  symbol: string;
  decimals: number;
  decimal: number;
  assetKey: string;
}
export function calDecimalsAndSymbol(item: IToken) {
  const { chainId, assetId, symbol, decimals, decimal, assetKey } = item;
  const _assetKey = assetKey || chainId + '-' + assetId;
  const isNULS = symbol == 'NULS' || _assetKey === NKey;
  const originDecimal = decimals || decimal;
  const newDecimals = isNULS ? NDecimals : originDecimal;
  return {
    decimals: newDecimals,
    symbol: isNULS ? NSymbol : symbol
  };
}
