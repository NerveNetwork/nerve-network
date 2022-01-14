//广播hex
import { createRPCParams } from '@/utils/util';
import { listen } from '@/service/socket/promiseSocket';
import config from '@/config';

const url = config.WS_URL;

// 我的质押信息/所有质押信息(不传地址)
export async function getStakingInfo(address?: string) {
  const channel = 'getStackingInfo';
  // const channel = "validateTx";
  const params = createRPCParams(channel);
  address && params.params.push(address);
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'psrpc:' + JSON.stringify(params)
    }
  });
}

// 我的质押奖励信息
export async function getStakingReward(address: string) {
  const channel = 'getAccount';
  // const channel = "validateTx";
  const params = createRPCParams(channel);
  params.params.push(address);
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'psrpc:' + JSON.stringify(params)
    }
  });
}

// 获取各种币种stacking收益率
export async function getStackingRate() {
  const channel = 'getStackingRate';
  // const channel = "validateTx";
  const params = createRPCParams(channel);
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'psrpc:' + JSON.stringify(params)
    }
  });
}

// 获取可参与stacking资产的列表
export async function getCanStackingAssetList() {
  const channel = 'getCanStackingAssetList';
  // const channel = "validateTx";
  const params = createRPCParams(channel);
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'psrpc:' + JSON.stringify(params)
    }
  });
}

// 根据地址获取质押列表
export async function getStakingListByAddress(
  pageNumber: number,
  pageSize: number,
  address: string
) {
  const channel = 'pageStackingListByAddress';
  // const channel = "validateTx";
  const params = createRPCParams(channel);
  params.params.push(...[pageNumber, pageSize, address]);
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'psrpc:' + JSON.stringify(params)
    }
  });
}

// 根据地址获取已到期质押记录
export async function getStakingRecordByAddress(
  pageNumber: number,
  pageSize: number,
  address: string
) {
  const channel = 'pageStackRecordByAddress';
  // const channel = "validateTx";
  const params = createRPCParams(channel);
  params.params.push(...[pageNumber, pageSize, address]);
  return await listen({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'psrpc:' + JSON.stringify(params)
    }
  });
}
