import http from '@/service';

// 我的节点信息
export async function getOverviewData() {
  const res = await http.rPost('assetGet');
  return res?.result;
}
