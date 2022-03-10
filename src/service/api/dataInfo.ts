import { listen } from '@/service/socket/promiseSocket';
import config from '@/config';
import { genId } from '@/utils/util';

const url = config.WS_URL;

/**
 * @desc 资产收藏列表信息
 * @params [assetKey]
 */

export async function getFocusAssetsInfo(data: string[]) {
  const keys = data.slice();
  const channel = 'db_fav_tokens';
  const params = {
    method: channel,
    id: genId(),
    params: { array: keys }
  };
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
}

/**
 * @desc 获取100天内资产的交易量、流动性、价格
 * @params tokenKey
 */

export async function getTokenAnalytics(tokenKey: string) {
  const channel = 'db_token_analytics';
  const params = {
    method: channel,
    id: genId(),
    params: { tokenKey }
  };
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
}

/**
 * @desc 获取300天内的总流动量数据和24小时交易量数据，支持pool过滤
 * @params tokenKey
 */

export async function get300DaysData() {
  const channel = 'db_analytics';
  const params = {
    method: channel,
    id: genId(),
    params: {}
  };
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
}

/**
 * @desc 资产排名列表
 * @params
 */
interface TokenListParam {
  pageIndex?: number;
  pageSize?: number;
  orderby?: string;
  sorting?: 'asc' | 'desc';
}
export async function getTokenList(data: TokenListParam) {
  const pageIndex = data.pageIndex || 1;
  const pageSize = data.pageSize || 5;
  const orderby = data.orderby || 'field';
  const sorting = data.sorting || 'asc';
  const channel = 'db_tokens';
  const params = {
    method: channel,
    id: genId(),
    params: { pageIndex, pageSize, orderby, sorting }
  };
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
}

/**
 * @desc 交易对排名列表，支持根据token-key查询
 * @params
 */
interface PairListParam extends TokenListParam {
  tokenKey: string;
}
export async function getPairList(data: PairListParam) {
  const pageIndex = data.pageIndex || 1;
  const pageSize = data.pageSize || 5;
  const orderby = data.orderby || 'field';
  const sorting = data.sorting || 'asc';
  const tokenKey = data.tokenKey || '';
  const channel = 'db_pools';
  const params = {
    method: channel,
    id: genId(),
    params: { pageIndex, pageSize, orderby, sorting, tokenKey }
  };
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
}

/**
 * @desc 交易对收藏列表信息
 * @params [pairAddress]
 */

export async function getFocusPairsInfo(data: string[]) {
  const keys = data.slice();
  const channel = 'db_fav_pools';
  const params = {
    method: channel,
    id: genId(),
    params: { array: keys }
  };
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
}

/**
 * @desc 资产详情
 * @params tokenKey
 */

export async function getTokenInfo(tokenKey: string) {
  const channel = 'db_token';
  const params = {
    method: channel,
    id: genId(),
    params: { tokenKey }
  };
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
}

/**
 * @desc 交易对详情
 * @params pairAddress
 */

export async function getPoolInfo(address: string) {
  const channel = 'db_pool';
  const params = {
    method: channel,
    id: genId(),
    params: { address }
  };
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
}

/**
 * @desc 交易列表：支持过滤条件pool、token、operation
 * @params pairAddress
 */
interface TxParam extends TokenListParam {
  tokenKey?: string;
  address?: string;
  operation?: 'SWAP' | 'ADDLP' |'REOMVELP'
}

export async function getTxs(data: TxParam) {
  const pageIndex = data.pageIndex || 1;
  const pageSize = data.pageSize || 5;
  const channel = 'db_transactions';
  const params = {
    method: channel,
    id: genId(),
    params: { ...data, pageIndex, pageSize }
  };
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
}

/**
 * @desc 搜索token或者pool
 * @params text
 */

export async function searchText(text: string) {
  const channel = 'db_search';
  const params = {
    method: channel,
    id: genId(),
    params: { text }
  };
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
}
