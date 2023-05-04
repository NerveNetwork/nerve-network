import { listen } from '@/service/socket/promiseSocket';
import config from '@/config';
import { genId } from '@/utils/util';
import { IPushAssetRes, IPushOrderItem, IMyOrderItem, IPushPairInfo } from '@/service/api/types/push';

const url = config.WS_URL;

// push支持的资产
export async function getPushAssetList() {
  const channel = 'pushAssetList';
  const params = {
    method: channel,
    id: genId(),
    params: {}
  };
  const result = await listen<IPushAssetRes>({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
  if (result) {
    result.assetList.map(v => {
      v.assetKey = v.chainId + '-' + v.assetId;
      v.listAvailable = '0';
    });
    result.quoteAsset.assetKey = result.quoteAsset.chainId + '-' + result.quoteAsset.assetId;
    result.quoteAsset.listAvailable = '';
  }
  return result;
}

// 查询交易对详情
export async function getPairInfo(name: string) {
  const channel = 'getTrading';
  const params = {
    method: channel,
    id: genId(),
    params: { hash: name }
  };
  return await listen<IPushPairInfo>({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
}

// 所有挂单 买单1/买单2
export async function getPushOrderList(type: 1 | 2, assetId = '') {
  const channel = 'pushOrderList';
  const params = {
    method: channel,
    id: genId(),
    params: {
      type,
      assetId
    }
  };
  const result = await listen<IPushOrderItem[]>({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
  if (result) {
    result.map(v => {
      v.baseAssetKey = v.baseAssetChainId + '-' + v.baseAssetId;
    });
  }
  return result;
}

// 当前账户挂单
export async function getPendingOrderList(address: string) {
  const channel = 'pendingOrderList';
  const params = {
    method: channel,
    id: genId(),
    params: { address }
  };
  const result = await listen<IMyOrderItem[]>({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'cmd:' + JSON.stringify(params)
    }
  });
  if (result) {
    result.map(v => {
      v.baseAssetKey = v.baseAssetChainId + '-' + v.baseAssetId;
    });
  }
  return result;
}
