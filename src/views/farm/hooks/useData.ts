import { onMounted, onUnmounted, ref } from 'vue';
import * as subSocket from '@/service/socket/websocket';
import config from '@/config';
import { fixNumber, Minus, Times } from '@/utils/util';
import { getBlockInfo, getNerveFarm } from '@/service/api';
import useStoreState from '@/hooks/useStoreState';
import { useStore } from 'vuex';
import { NerveFarmItem, UserStakeFarm } from '../types';

const url = config.WS_URL;

export default function useData() {
  const store = useStore();
  const list = ref<NerveFarmItem[]>([]);
  let totalNerveList: NerveFarmItem[] = [];
  let filterType = '1'; // 排序类型 1.按照收益排名 2.按照流动性排名
  let onlySeeMortgage = false; // 只看已质押
  let farmStatusType = 'pending'; // farm状态 默认显示进行中的farm
  let heightTimer: number;

  onMounted(() => {
    getHeight();
  });

  async function getHeight() {
    const result = await getBlockInfo();
    let height = result?.blockHeight || null;
    store.commit('changeHeight', height);
    if (height) {
      heightTimer = window.setInterval(() => {
        height += 1;
        store.commit('changeHeight', height);
      }, 2000);
    } else {
      if (heightTimer) {
        clearInterval(heightTimer);
      }
      setTimeout(() => {
        getHeight();
      }, 5000);
    }
  }
  onUnmounted(() => {
    subSocket.unListen(url, 'farmListSub');
    clearInterval(heightTimer);
  });

  // 获取nerve farmList
  async function getFarmData(farmHash?: string) {
    const data = ((await getNerveFarm(farmHash)) || []) as NerveFarmItem[];
    const times = +new Date();
    data.map(v => {
      v.stakeAmount = '0';
      v.stakeUSD = 0;
      v.pendingRewardUSD = 0;
      v.pendingReward = '0';
      v.isLocked = Minus(Times(v.lockedTime, 1000), times).toNumber() < 0;
      v.syrupTokenBalance = fixNumber(v.syrupTokenBalance, 8);
      v.rewardBalance = fixNumber(v.rewardBalance, 8);
    });
    totalNerveList = [...data].sort((a, b) => a.orderNum - b.orderNum);
    list.value = await filter(totalNerveList, filterType, onlySeeMortgage);
  }

  const { currentAccount, height } = useStoreState();

  // 用户参与的farm
  function getUserFarm(farmHash?: string) {
    const address = currentAccount.value?.address?.NERVE;
    if (!address) return;
    const channel = 'farmListSub';
    subSocket.listen({
      url,
      channel,
      params: {
        cmd: false,
        channel: channel + ':' + address + (farmHash ? ',' + farmHash : '')
      },
      success(data: UserStakeFarm[]) {
        const totalList = [...totalNerveList];
        if (totalList.length) {
          data.map(item => {
            totalList.map(v => {
              if (v.farmHash === item.farmHash) {
                const length = item.stakedTokenAmount.toString().length;
                v.apr = item.apr;
                v.stakeAmount = fixNumber(item.stakedTokenAmount, length);
                v.stakeUSD = item.stakedTokenAmountUSD;
                v.tatalStakeTokenUSD = item.tatalStakeTokenUSD;
                v.pendingRewardUSD = item.pendingRewardUSD;
                v.pendingReward = fixNumber(item.pendingReward, 8);
              }
            });
          });
        }
        filter(
          totalList,
          filterType,
          onlySeeMortgage,
          false,
          farmStatusType
        ).then(res => list.value = res);
      }
    });
  }

  function filterList(type: string, mortgage: boolean, farmStatus?: string) {
    filterType = type;
    onlySeeMortgage = mortgage;
    farmStatusType = farmStatus || 'pending';
    if (totalNerveList.length) {
      filter(
        [...totalNerveList],
        type,
        mortgage,
        false,
        farmStatusType
      ).then(res => list.value = res);
    }
  }
  function sleep(delay: number) {
    return new Promise(resolve => setTimeout(resolve, delay))
    /* const start = new Date().getTime();
    while (new Date().getTime() - start < delay) {
      continue;
    } */
  }

  async function filter(
    list: any,
    type: string,
    mortgage: boolean,
    isUni?: boolean,
    farmStatus = 'pending'
  ): Promise<any> {
    let newList = [...list];
    if (!height.value) {
      // console.log(farmStatus, height.value, '333==333');
      await sleep(3000);
      return await filter(list, type, mortgage, isUni, farmStatus);
    } else {
      if (farmStatus === 'pending') {
        newList = [...newList].filter(
          v => !v.stopHeight || v.stopHeight > height.value
        );
      } else {
        newList = [...newList].filter(
          v => v.stopHeight && v.stopHeight < height.value
        );
      }
      // console.log(newList, 21336)

      if (mortgage) {
        newList = [...newList].filter(v => Number(v.stakeAmount));
      }
      const sortBy = type === '1' ? 'apr' : 'tatalStakeTokenUSD';
      return [...newList].sort((a, b) => {
        return b[sortBy] - a[sortBy];
      });
    }
  }

  return {
    nerveList: list,
    getFarmData,
    getUserFarm,
    filterList
  };
}
