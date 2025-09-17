<template>
  <div>
    <div
      class="fixed inset-0 z-10 bg-mask opacity-45"
      v-show="showMask"
      @click.stop="changeShowMask(false)"></div>
    <div class="relative z-20" ref="wrapper">
      <Input
        class="w-[340px] bg-card2"
        input-class="h-9 leading-9"
        :placeholder="$t('info.info6')"
        @focus="changeShowMask(true)"
        v-model="searchVal">
        <template #prepend><i-custom-search /></template>
      </Input>

      <div
        class="absolute left-0 md:left-auto md:right-0 mt-3 w-[90vw] rounded-xl bg-card2 pt-4 pb-2 md:w-[460px]"
        v-show="showMask">
        <div class="assets">
          <!-- <div class="bg-card h-8 px-6 grid grid-cols-[1.5fr_1fr_0.8fr]"></div> -->
          <div
            class="grid h-8 grid-cols-[1.8fr_0.5fr]  sm:grid-cols-[1.8fr_1fr_1fr_0.5fr] bg-card px-6 leading-8">
            <div class="text-label">{{ $t('info.info3') }}</div>
            <div class="hidden text-label sm:block">{{ $t('info.info9') }}</div>
            <div class="hidden text-label sm:block">{{ $t('info.info4') }}</div>
          </div>
          <div class="max-h-[200px] overflow-auto px-4 py-2">
            <template v-if="!searchVal">
              <div class="text-center text-label">{{ $t('info.info33') }}</div>
            </template>
            <template v-else>
              <div
                class="btn grid items-center cursor-pointer grid-cols-[1.8fr_0.5fr]  sm:grid-cols-[1.8fr_1fr_1fr_0.5fr] py-2"
                v-for="item in assets"
                :key="item.assetKey"
                @click="toUrl('token', item.assetKey)">
                <SymbolInfo
                  class="!mr-2 !h-7 !w-7"
                  nameClass="!text-sm !mb-0 !leading-4"
                  keyClass="!leading-[14px]"
                  :name="item.symbol"
                  :asset-key="item.assetKey"
                  :chain="item.originChain" />
                <div class="hidden sm:block">${{ item.price }}</div>
                <div class="hidden sm:block">${{ $format(item.liq) }}</div>
                <CollectIcon
                  v-model="item.isWatch"
                  @change="changeCollect(item.assetKey, $event, 'token')" />
              </div>
              <div class="no-data" v-if="!assets.length">
                {{ $t('public.public19') }}
              </div>
            </template>
          </div>
        </div>
        <div class="pools">
          <div
            class="grid h-8 grid-cols-[1.8fr_0.5fr] sm:grid-cols-[2.8fr_0fr_1fr_0.5fr] bg-card px-6 leading-8">
            <div class="text-label">{{ $t('info.info2') }}</div>
            <div class="hidden sm:block"></div>
            <div class="hidden text-label sm:block">{{ $t('info.info4') }}</div>
          </div>
          <div class="max-h-[200px] overflow-auto px-4 py-2">
            <template v-if="!searchVal">
              <div class="text-center text-label">{{ $t('info.info33') }}</div>
            </template>
            <template v-else>
              <div
                class="btn grid items-center cursor-pointer grid-cols-[1.8fr_0.5fr] sm:grid-cols-[2.8fr_0fr_1fr_0.5fr] py-2"
                v-for="item in pools"
                :key="item.address"
                @click="toUrl('pool', item.address)">
                <div class="symbol-wrap">
                  <LiquiditySymbols
                    textClass="text-sm"
                    :symbol1="item.token0"
                    :symbol2="item.token1"
                    :asset-key1="item.token0Key"
                    :asset-key2="item.token1Key"></LiquiditySymbols>
                </div>
                <div class="hidden sm:block"></div>
                <div class="hidden sm:block">${{ $format(item.liq) }}</div>
                <CollectIcon
                  v-model="item.isWatch"
                  @change="changeCollect(item.address, $event, 'pool')" />
              </div>
              <div class="no-data" v-if="!pools.length">
                {{ $t('public.public19') }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Input from '@/components/Base/Input/index.vue'
import SymbolInfo from '@/components/SymbolInfo.vue'
import LiquiditySymbols from '@/components/LiquiditySymbols.vue'
import CollectIcon from '@/components/CollectIcon.vue'
import useClickOutside from '@/hooks/useClickOutside'
import useMask from '@/hooks/useMask'
import useCollect from './hooks/useCollect'
import { searchText } from '@/service/api'
import { debounce, divisionAndFix, getOriginChain } from '@/utils/util'
import storage from '@/utils/storage'
import { SearchToken, SearchPool } from './types'

const router = useRouter()
const { showMask, changeShowMask } = useMask()
const wrapper = ref<HTMLElement>()
const { isClickOutside } = useClickOutside(wrapper)
const { changeCollect } = useCollect()
watch(
  () => isClickOutside.value,
  val => {
    if (val) {
      changeShowMask(false)
    }
  }
)

const searchVal = ref('')
const assets = ref<SearchToken[]>([])
const pools = ref<SearchPool[]>([])
watch(
  () => searchVal.value,
  val => {
    assets.value = []
    pools.value = []
    if (val) {
      search(val)
    }
  }
)
const debounceSearch = debounce(doSearch, 1000)
const search = (key: string) => debounceSearch(key)

async function doSearch(key: string) {
  const res = await searchText(key)
  if (res && res.pool && res.token && searchVal.value) {
    const list1: SearchToken[] = []
    const list2: SearchPool[] = []
    const watchTokens = storage.get('watchTokens') || []
    const watchPools = storage.get('watchPools') || []
    res.token.sort((a, b) => {
      // @ts-ignore
      return a.reserveUsdtValue - b.reserveUsdtValue < 0 ? 1 : -1
    })
    res.pool.sort((a, b) => {
      // @ts-ignore
      return a.reserveUsdtValue - b.reserveUsdtValue < 0 ? 1 : -1
    })
    res.token.map(v => {
      const assetKey = v.assetChainId + '-' + v.assetId
      list1.push({
        originChain: getOriginChain(v.sourceChainid, v.assetChainId),
        assetKey,
        symbol: v.symbol,
        price: divisionAndFix(v.price, 18, 2),
        liq: divisionAndFix(v.reserveUsdtValue, 18, 2),
        txs: divisionAndFix(v.amountUsdtValue24H, 18, 2),
        isWatch: watchTokens.includes(assetKey)
      })
    })
    assets.value = list1
    res.pool.map(v => {
      // const assetLP = getAssetByKey(v.tokenLP);
      list2.push({
        address: v.address,
        liq: divisionAndFix(v.reserveUsdtValue, 18, 2),
        isWatch: watchPools.includes(v.address),
        token0: v.token0Symbol,
        token1: v.token1Symbol,
        lpName: v.token0Symbol + ' / ' + v.token1Symbol,
        token0Key: v.token0,
        token1Key: v.token1
      })
    })
    pools.value = list2
  }
}

function toUrl(type: string, query: string) {
  if (type === 'token') {
    router.push(`/info/tokens/${query}`)
  } else {
    router.push(`/info/pools/${query}`)
  }
}
</script>
