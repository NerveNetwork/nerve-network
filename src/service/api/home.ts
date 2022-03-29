import http from '@/service';
import { genId } from '@/utils/util';
import { listen } from '@/service/socket/promiseSocket';
import config from '@/config';

const url = config.WS_URL;

// 我的节点信息
export async function getOverviewData() {
  const res = await http.rPost('assetGet');
  return res?.result;
}

// 获取汇总信息
export async function getSummaryData() {
  const channel = 'db_summary_info';
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
