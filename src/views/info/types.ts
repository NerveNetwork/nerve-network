
export interface ChartItem {
  label: number;
  value: string;
}

export interface TokenItem {
  name: string;
  assetKey: string;
  price: string;
  priceChange: string;
  txs: string;
  liq: string;
}

export interface PoolItem {
  name: string;
  address: string;
  tx_24: string;
  tx_7d: string;
  lp_24: string;
  apr: string;
  liq: string;
  token0Symbol: string;
  token1Symbol: string;
}

export interface SearchToken {
  symbol: string;
  price: string;
  txs: string;
  liq: string;
  assetKey: string;
  isWatch: boolean;
}

export interface SearchPool {
  name: string;
  address: string;
  liq: string;
  isWatch: boolean;
  asset1: any;
  asset2: any;
  lpName: string;
}

export interface TokenDetail {
  name: string;
  assetKey: string;
  tx_24: string;
  tx_7d: string;
  tx_24_count: string;
  liq: string;
}

export interface PoolDetail extends PoolItem {
  token0: string;
  token0Decimals: number;
  reserve0: string;
  token1: string;
  token1Decimals: number;
  reserve1: string;
  tokenLP: string;
}

export interface ChartTabItem {
  tx: ChartItem[];
  liq: ChartItem[];
  price: ChartItem[];
}

export interface TxItem {
  type: string;
  hash: string;
  time: string;
  totalVal: string;
  token0: string;
  amount0: string;
  token1: string;
  amount1: string;
  address: string;
}

export enum TxType {
  ALL = 'ALL',
  SWAP = 'SWAP',
  ADDLP = 'ADDLP',
  REOMVELP = 'REOMVELP'
}
