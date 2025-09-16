<template>
  <div class="w1200">
    <div class="liquidity card-wrapper max-w-[460px] mx-auto" v-loading="loading">
      <div class="overview" v-if="!addLiquidity">
        <div class="top-part">
          <div>
            <h3 class="text-xl mb-1.5">{{ $t('liquidity.liquidity1') }}</h3>
            <p>{{ $t('liquidity.liquidity2') }}</p>
          </div>
          <div class="py-7">
            <Button class="w-full" @click="addLiquidity = true">{{ $t('liquidity.liquidity3') }}</Button>
          </div>
        </div>
        <div class="your-liquidity" v-if="nerveAddress">
          <h3 class="text-xl mb-3">{{ $t('liquidity.liquidity4') }}</h3>
          <div class="liquidity-list">
            <div v-for="(item, index) in liquidityList" :key="index">
              <div
                :class="clsxm('py-4 h-[74px] flex items-center justify-between cursor-pointer border-b border-line', item.showDetail && 'border-transparent')"
                @click="toggleDetail(item)"
              >
                <div>
                  <LiquiditySymbols
                    :symbol1="item.token0.symbol"
                    :symbol2="item.token1.symbol"
                    :name="item.lpTokenAmount.token.symbol"
                  ></LiquiditySymbols>
                  <div class="mt-1">{{ item.amount }}</div>
                </div>
                <div :class="['duration-300 transition-transform', item.showDetail && 'rotate-180']"><i-custom-arrow-down /></div>
                <!-- <div class="view-detail">
                  <el-icon :class="{ expand: item.showDetail }">
                    <arrow-right />
                  </el-icon>
                </div> -->
              </div>
              <collapse-transition>
                <detail-bar
                  v-show="item.showDetail"
                  :nerveAddress="nerveAddress"
                  :info="item"
                  @loading="handleLoading"
                  @updateList="getData"
                ></detail-bar>
              </collapse-transition>
            </div>
            <div class="no-data" v-if="!liquidityList.length">
              {{ $t('public.public19') }}
            </div>
          </div>
          <div class="pt-6">
            <Pagination
              v-model:currentPage="pager.index"
              :pageSize="pager.size"
              :total="pager.total"
              @change="getUserLiquidity"
            />
          </div>
        </div>
      </div>
      <AddLiquidity
        v-else
        v-model:show="addLiquidity"
        :defaultAsset="defaultAsset"
        :assetsList="assetsList"
        :nerveAddress="nerveAddress"
        @updateList="getData"
      ></AddLiquidity>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from '@/components/Base/Button/index.vue'
import Pagination from '@/components/Base/Pagination/index.vue'
import AddLiquidity from './AddLiquidity.vue';
import CollapseTransition from '@/components/CollapseTransition.vue';
import DetailBar from './DetailBar.vue';
import LiquiditySymbols from '@/components/LiquiditySymbols.vue';
import clsxm from '@/utils/clsxm';
import { userLiquidityPage } from '@/service/api';
import { divisionAndFix } from '@/utils/util';
import { useWalletStore } from '@/store/wallet';
import useAsset from '@/views/swap/hooks/useAsset';

import { LiquidityItem } from './types';
import { NDecimals, NSymbol, replaceNULS } from '@/constants/constants';

const walletStore = useWalletStore()
const { nerveAddress } = storeToRefs(walletStore)

const { assetsList, defaultAsset, hasQuery: addLiquidity } = useAsset(true);
let timer: number;
onMounted(async () => {
  await getData();
  timer = window.setInterval(async () => {
    await getData();
  }, 5000);
});
async function getData() {
  await getUserLiquidity();
  // state.assetsList = await getAssetList(nerveAddress.value);
}
onBeforeUnmount(() => {
  clearInterval(timer);
});

const liquidityList = ref<LiquidityItem[]>([] as LiquidityItem[]);
const pager = reactive({
  index: 1,
  size: 5,
  total: 0
});
async function getUserLiquidity() {
  if (nerveAddress.value) {
    const res: any = await userLiquidityPage({
      userAddress: nerveAddress.value,
      pageIndex: pager.index,
      pageSize: pager.size
    });
    if (res) {
      pager.total = res.total || 0;
      res.list.map((v: LiquidityItem) => {
        const info = v.lpTokenAmount;
        if (v.token0.symbol === 'NULS') {
          v.token0.symbol = NSymbol;
          v.token0.decimals = NDecimals;
        }
        if (v.token1.symbol === 'NULS') {
          v.token1.symbol = NSymbol;
          v.token1.decimals = NDecimals;
        }
        v.lpTokenAmount.token.symbol = replaceNULS(
          v.lpTokenAmount.token.symbol
        );
        v.amountSlice = divisionAndFix(info.amount, info.token.decimals, 2);
        v.amount = divisionAndFix(
          info.amount,
          info.token.decimals,
          info.token.decimals
        );
        const exist = liquidityList.value.find(
          item => v.pairAddress === item.pairAddress
        );
        v.showDetail = exist ? exist.showDetail : false;
      });
      liquidityList.value = res.list.filter(
        (item: LiquidityItem) => item.amount !== '0'
      );
    }
  }
}

function toggleDetail(item: LiquidityItem) {
  for (let liquidityItem of liquidityList.value) {
    if (item.amount === liquidityItem.amount) {
      item.showDetail = !item.showDetail;
    } else {
      liquidityItem.showDetail = false;
    }
  }
}

const loading = ref(false);
function handleLoading(status: boolean) {
  loading.value = status;
}
</script>
