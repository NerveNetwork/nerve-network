import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import router from './router';
import store from './store';
import usePlugins from '@/plugins';
import AddChain from '@/utils/AddChain';
import { getLogoConfig } from '@/utils/logoConfig';
import { getSystemConfig } from '@/utils/getSystemConfig';
import { testnet, mainnet } from 'nerveswap-sdk';
import config from './config';
import './style.css'
import '@/assets/css/font.css'

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

const app = createApp(App)
const pinia = createPinia()

setTimeout(() => {
  // setTimeout to get ethereum.selectedAddress???
  app.use(pinia)
  app.use(store)
  app.use(router)
  app.use(usePlugins)
  app.mount('#app')
}, 500);
