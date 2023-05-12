import { withdrawalGasLimit, crossChainInfo } from '@/service/api';
import storage from '@/utils/storage';

interface Res {
  [key: string]: {
    gasLimitOfWithdraw: string;
    extend: string | null;
  };
}

interface ChainRes {
  [key: string]: {
    assetSymbol: string;
    multySignAddress: string;
  };
}
export async function getWithdrawalGasLimit(): Promise<Res | null> {
  const result = await withdrawalGasLimit();
  if (result) {
    storage.set('gasLimitConfig', result, 'session');
    return result;
  }
  return null;
}

export async function getCrossChainInfo(): Promise<ChainRes | null> {
  const result = await crossChainInfo();
  if (result) {
    storage.set('crossChainInfo', result);
    return result;
  }
  return null;
}

export function getSystemConfig() {
  getWithdrawalGasLimit();
  getCrossChainInfo();
}
