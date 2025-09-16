<template>
  <ElConfigProvider :locale="elLang">
    <Header />
    <div id="inner_content" class="inner_content">
      <router-view></router-view>
    </div>
    <Footer />
    <ConnectWallet />
  </ElConfigProvider>
</template>

<script lang="ts" setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { ElConfigProvider } from 'element-plus'
import Header from '@/components/Header/index.vue'
import Footer from '@/components/Footer.vue'
import ConnectWallet from '@/components/ConnectWallet.vue'
import useLang from '@/hooks/useLang'
import nerve from 'nerve-sdk-js'
import config from '@/config'

import { useWalletStore } from './store/wallet'

nerve.customnet(config.chainId, config.API_URL, config.timeout)

const walletStore = useWalletStore()

const { elLang } = useLang()

let timer: number
let timer2: number
watch(
  () => walletStore.nerveAddress,
  val => {
    if (val) {
      walletStore.getAssetList(val)
      if (timer) clearInterval(timer)
      timer = window.setInterval(() => {
        walletStore.getAssetList(val)
      }, 10000)
    } else {
      walletStore.getAssetList(undefined)
    }
  }
)
onMounted(() => {
  walletStore.getNVTPrice()
  timer2 = window.setInterval(() => {
    walletStore.getNVTPrice()
  }, 10000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (timer2) clearInterval(timer2)
})
</script>

<style lang="scss">
@use 'assets/css/base.scss';

#app {
  width: 100%;
  min-height: 100%;
  //word-break: break-all;
}

.inner_content {
  padding-top: 40px;
  min-height: calc(100vh - 40px);
  padding-bottom: 60px;
  @media screen and (max-width: 1280px) {
    padding-top: 30px;
    min-height: calc(100vh - 30px);
  }
}

.Vue-Toastification__container.top-right {
  top: 80px !important;
  .Vue-Toastification__toast {
    padding: 20px 16px;
    min-height: 60px;
  }
  @media only screen and (max-width: 600px) {
    top: 60px !important;
    width: 96%;
    left: 2%;
    .Vue-Toastification__toast {
      padding: 0 16px;
      align-items: center;
      min-height: 54px;
      border-radius: 10px;
    }
  }
}
</style>
