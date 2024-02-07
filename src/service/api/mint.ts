import http from '@/service';
import { ISwapApi, IMintItem } from './types/mint';
import { ListRes } from './types/dataInfo';

export async function getMintList({
  minter = '',
  pageIndex = 1,
  pageSize = 10,
  assetKey = '',
  process = ''
}) {
  const result = await http.sPost<ISwapApi<ListRes<IMintItem>>>(
    '/swap/mintProjects',
    {
      minter,
      pageIndex,
      pageSize,
      assetKey,
      process
    }
  );

  return {
    list: result.data?.list || [],
    total: result.data?.total || 0
  };
}

export async function getMinterInfo(pid: number, minter: string) {
  const result = await http.sPost<ISwapApi<IMintItem>>('/swap/minterInfo', {
    pid,
    minter
  });
  return result.data || {};
}
export async function getMintBaseInfo() {
  const result = await http.sPost<ISwapApi<string>>('/swap/mintBaseInfo');
  return result.data;
}
