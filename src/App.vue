<template>
  <ElConfigProvider :locale="localeLang">
    <Header />
    <div id="inner_content" class="inner_content">
      <router-view></router-view>
    </div>
    <Footer />
  </ElConfigProvider>
</template>

<script lang="ts" setup>
import { watch, computed } from 'vue';
import { useStore } from 'vuex';
import { ElConfigProvider } from 'element-plus';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import useLang from '@/hooks/useLang';
import nerve from 'nerve-sdk-js';
import config from '@/config';
// 设置sdk网络
nerve.customnet(config.chainId, config.API_URL, config.timeout);

const store = useStore();
const { localeLang } = useLang();

let timer: number;
const nerveAddress = computed(() => store.getters.nerveAddress);
watch(nerveAddress, val => {
  if (val) {
    store.dispatch('getAssetList', val);
    if (timer) clearInterval(timer);
    timer = window.setInterval(() => {
      store.dispatch('getAssetList', val);
    }, 5000);
  } else {
    store.commit('setAssetList', []);
  }
});
</script>

<style lang="scss">
@import 'assets/css/base.scss';

#app {
  width: 100%;
  min-height: 100%;
  word-break: break-all;
}
.inner_content {
  padding-top: 80px;
  min-height: calc(100vh - 80px);
  padding-bottom: 30px;
  @media screen and (max-width: 1200px) {
    padding-top: 30px;
    min-height: calc(100vh - 30px);
  }
}

.Vue-Toastification__container.top-right {
  top: 80px !important;
  @media only screen and (max-width: 600px) {
    top: 60px !important;
    width: 96%;
    left: 2%;
    .Vue-Toastification__toast {
      padding: 0 24px;
      align-items: center;
      min-height: 54px;
      border-radius: 10px;
    }
  }
}
</style>
