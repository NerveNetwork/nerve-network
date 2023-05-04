export interface IPushAssetItem {
  chainId: number;
  assetId: number;
  assetKey: string;
  decimals: number;
  symbol: string;
  logo: string;
  listAvailable: string;
}

export interface IPushAssetRes {
  assetList: IPushAssetItem[];
  quoteAsset: IPushAssetItem;
}

export interface IPushPairInfo {
  id: string;
  hash: string;
  baseSymbol: string;
  baseAssetChainId: number;
  baseAssetId: number;
  baseDecimals: number;
  quoteSymbol: string;
  quoteAssetChainId: number;
  quoteAssetId: number;
  quoteAssetLogo: string;
  baseAssetLogo: string;
  quoteDecimals: number;
  minBaseAmount: string;
  minQuoteAmount: string;
  tradingName: string;
}

export interface IPushOrderItem {
  id: string;
  hash: string;
  baseSymbol: string;
  baseAssetChainId: number;
  baseAssetId: number;
  baseDecimals: number;
  quoteSymbol: string;
  quoteAssetChainId: number;
  quoteAssetId: number;
  quoteAssetLogo?: string;
  baseAssetLogo?: string;
  quoteDecimals: number;
  minBaseAmount: number;
  minQuoteAmount: number;
  tradingName?: string;
  type: number;
  price: string;
  amount: string;
  level: number;
  baseAssetKey: string;
}

export interface IMyOrderItem {
  address: string;
  baseAmount: string;
  baseDealAmount: string;
  undealedAmount: string;
  baseAssetChainId: number;
  baseAssetId: number;
  baseAssetLogo: string;
  baseDecimals: number;
  baseSymbol: string;
  hash: string;
  price: string;
  quoteDecimals: number;
  quoteSymbol: string;
  tradingHash: string;
  type: 1 | 2;
  baseAssetKey: string;
}
