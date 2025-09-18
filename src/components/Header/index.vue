<template>
  <div
    :class="['header', route.path === '/' ? 'home-header' : '']"
    @click="showMenu = false">
    <div class="mx-4 flex h-[60px] items-center justify-center xl:mx-5">
      <div class="flex flex-1 items-center">
        <router-link to="/" class="mr-2 w-[80px] sm:mr-20 sm:w-[100px]">
          <img src="../../assets/img/nervelogo.svg" alt="" />
        </router-link>
        <div class="hidden xl:block">
          <Menu />
        </div>
      </div>
      <template v-if="!address || !nerveAddress">
        <AuthButton class="h-8 rounded-2xl px-5 text-xs" />
      </template>
      <template v-else>
        <div class="flex">
          <div class="group relative">
            <router-link
              to="/asset-center"
              class="mr-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-card2 transition-all duration-300 hover:opacity-70">
              <img src="../../assets/img/assets-center.svg" alt="" />
            </router-link>
            <div
              class="absolute top-10 hidden h-8 items-center justify-center whitespace-nowrap rounded-[10px] bg-card px-2.5 text-xs group-hover:flex">
              Asset Center
            </div>
          </div>

          <div
            class="flex h-8 items-center justify-center rounded-2xl bg-card2 p-1 pr-0">
            <SwitchChain
              v-model="showSwitchChain"
              :currentChain="chain"
              :address="address">
              <div
                class="flex cursor-pointer items-center transition-all duration-300 hover:opacity-70"
                @click="showSwitchChain = true">
                <img
                  class="h-6 w-6 rounded-full"
                  :src="chainLogo"
                  alt=""
                  v-if="!wrongChain" />
                <img
                  class="h-6 w-6"
                  src="../../assets/img/net-error.svg"
                  alt=""
                  @click="showSwitchChain = true"
                  v-else />
                <div class="mx-1.5">
                  <svg
                    width="6"
                    height="4"
                    viewBox="0 0 6 4"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3.3751 3.70958L5.84419 1.08724C5.99647 0.925512 6.04167 0.684029 5.95962 0.472824C5.87757 0.261619 5.68357 0.125 5.46942 0.125H0.530532C0.316372 0.125 0.122377 0.262357 0.0403287 0.472824C0.0132111 0.54298 0 0.616089 0 0.68846C0 0.834679 0.0542352 0.979421 0.155752 1.08724L2.62485 3.70958C2.72497 3.81518 2.85917 3.875 3.00032 3.875C3.14078 3.875 3.27636 3.81518 3.3751 3.70958Z"
                      fill="#878DAB" />
                  </svg>
                </div>
              </div>
            </SwitchChain>
            <div class="mx-2 h-[14px] w-[1px] bg-[#44495A]"></div>
            <AccountInfo
              v-model="manageAccount"
              :nerveAddress="nerveAddress"
              :L1Chain="chain"
              :L1Address="address"
              @disconnect="disconnectProvider">
              <div
                class="flex cursor-pointer items-center transition-all duration-300 hover:opacity-70 pr-2.5">
                <img
                  class="mr-1.5 h-6 w-6"
                  src="../../assets/img/nerveIcon.png"
                  alt=""
                  @click="manageAccount = true" />
                <span class="text-xs" @click="manageAccount = true">
                  {{ superLong(nerveAddress, 5) }}
                </span>
              </div>
            </AccountInfo>
          </div>
        </div>
        <img
          class="ml-2.5 block cursor-pointer xl:hidden"
          src="../../assets/img/icon-menu.svg"
          alt=""
          @click.stop="toggleShowMenu" />
      </template>
    </div>

    <MobileMenu v-model:show="showMenu" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useWalletStore } from '@/store/wallet'
import Menu from '../Menu.vue'
import MobileMenu from '../MobileMenu.vue'
import SwitchChain from '@/components/SwitchChain.vue'
import AccountInfo from '../Account.vue'
import useEthereum from '@/hooks/useEthereum'
import AuthButton from '../AuthButton.vue'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import { getCurrentAccount, superLong } from '@/utils/util'

const walletStore = useWalletStore()
const { nerveAddress, wrongChain, chain } = storeToRefs(walletStore)
const route = useRoute()

const { address, initProvider, disconnect } = useEthereum()
initProvider()

const showSwitchChain = ref(false)

watch(
  () => address.value,
  val => {
    const currentAccount = getCurrentAccount(val)
    // store.commit('setCurrentAddress', currentAccount || {});
    walletStore.changeAccount(currentAccount || {})
  },
  {
    immediate: true
  }
)

const manageAccount = ref(false)

function disconnectProvider() {
  walletStore.changeAccount({} as any)
  walletStore.changeAddress('')
  disconnect()
  manageAccount.value = false
}

const activeIndex = ref('')
watch(
  () => route.path,
  val => {
    activeIndex.value = val?.split('/')[1]
  }
)

const chainLogo = computed(() => {
  return _networkInfo[chain.value]?.logo
})

const showMenu = ref(false)
function toggleShowMenu() {
  showSwitchChain.value = false
  showMenu.value = !showMenu.value
}
</script>
