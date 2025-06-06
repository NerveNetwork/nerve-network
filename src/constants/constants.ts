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
  const originDecimal = decimals || decimal || 0;
  const newDecimals = isNULS ? NDecimals : originDecimal;
  const _symbol = replaceNULS(isNULS ? NSymbol : symbol);
  return {
    decimals: newDecimals,
    symbol: _symbol
  };
}

export function replaceNULS(str: string): string {
  return str.replace(
    /(^|\b)NULS(\b|$)|(^NULS_)|(_NULS(\b|$))|(_NULS_)/g,
    function (match) {
      return match.replace('NULS', 'NAI');
    }
  );
}
