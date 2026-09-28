import http from '@/service';
import config from '@/config';
import { ISwapApi } from './types/mint';

export type RefundStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'REJECTED';

export interface IRefundTicket {
  id: number;
  nerveTxHash: string;
  assetChainId: number;
  assetId: number;
  assetKey: string;
  assetChainName?: string;
  symbol?: string;
  amount: string;
  amountDisplay?: string;
  decimals?: number;
  feeRatePercent?: number;
  feeAmountDisplay?: string;
  netAmountDisplay?: string;
  txTime?: string;
  fromAddress: string;
  status: RefundStatus;
  noRoute?: boolean;
  rejectReason?: string | null;
  payoutAddress?: string;
  payoutHtgChainId?: number;
  payoutHtgChainName?: string;
  payoutHtgChainLabel?: string;
  payoutTokenSymbol?: string;
  payoutTokenAddress?: string;
  payoutTokenDecimals?: number;
  payoutTxHash?: string | null;
  busTxHash?: string | null;
}

function unwrap<T>(result: ISwapApi<T> & { msg?: string }): T {
  if (!result || result.code !== 0) {
    throw new Error(result?.msg || result?.message || 'Request failed');
  }
  return result.data;
}

export async function getRefundTickets(address = '', hash = '') {
  const result = await http.get<ISwapApi<IRefundTicket[]>>({
    url: config.swap_url + '/swap/refund/tickets',
    params: { address: address.trim(), hash: hash.trim() }
  });
  return unwrap(result) || [];
}

export async function getRefundTicket(id: number) {
  const result = await http.get<ISwapApi<IRefundTicket>>({
    url: config.swap_url + '/swap/refund/tickets/' + id
  });
  return unwrap(result);
}
