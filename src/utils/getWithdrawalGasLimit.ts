import { withdrawalGasLimit } from '@/service/api';
import storage from '@/utils/storage';

interface Res {
  [key: string]: {
    gasLimitOfWithdraw: string;
    extend: string | null;
  };
}
export default async function getWithdrawalGasLimit(): Promise<Res | null> {
  const result = await withdrawalGasLimit();
  if (result) {
    storage.set('gasLimitConfig', result, 'session');
    return result;
  }
  return null;
}
