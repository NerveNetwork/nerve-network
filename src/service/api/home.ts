import { createRPCParams } from '@/utils/util';
import { listen } from '@/service/socket/promiseSocket';
import config from '@/config';

const url = config.WS_URL;

// 我的节点信息
export async function getOverviewData<T>() {
  const channel = 'assetGet';
  const params = createRPCParams(channel);
  params.params.push(2);
  return await listen<T>({
    url,
    channel,
    id: params.id,
    params: {
      cmd: true,
      channel: 'psrpc:' + JSON.stringify(params)
    }
  });
}
