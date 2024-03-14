export type ISwapApi<T> = {
  code: number;
  data: T;
  message: string;
};

export type IMintItem = {
  id: number;
  mintAssetSymbol: string;
  mintAsset: string;
  mintAssetDecimals: number;
  mintEach: string;
  mintMax: string;
  startTime: string;
  assetUnlockTime: string;
  mintFeeAssetSymbol: string;
  mintFeeAsset: string;
  mintFee: string;
  mintFeeAssetDecimals: number;
  poolRatio: number;
  lpLockDay: number;
  progress: string;
  mintCount?: number;
  mintCountLimit?: number;
  mintCountLimitPerUser?: number;
  mintAssetSourceChainId: number;
  registerChain: string;
  whitelistAddr: boolean;
  mintMinutesForWhitelist: number;
  remainingTotalMintCount: number;
};
