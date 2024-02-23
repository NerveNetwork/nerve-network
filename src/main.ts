import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import usePlugins from '@/plugins';
import AddChain from '@/utils/AddChain';
import { getLogoConfig } from '@/utils/logoConfig';
import { getSystemConfig } from '@/utils/getSystemConfig';
import { testnet, mainnet } from 'nerveswap-sdk';
import config from './config';
if (config.isBeta) {
  testnet();
} else {
  mainnet();
}
// @ts-ignore
// import VConsole from 'vconsole'
// new VConsole()

if (process.env.NODE_ENV !== 'development') {
  window.console.log = () => {};
}

setTimeout(() => {
  // wait for btc init ecc
  AddChain();
}, 3000);
getLogoConfig();
getSystemConfig();

setTimeout(() => {
  // setTimeout to get ethereum.selectedAddress???
  const app = createApp(App);
  app.use(router).use(store).use(usePlugins).mount('#app');
}, 500);
