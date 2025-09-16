/// <reference types="vite/client" />

interface Window {
  ethereum: any; //ethers.providers.Web3Provider,
  NaboxWallet: any; //ethers.providers.Web3Provider
  nabox: any;
  tronLink: any;
  tronWeb: any;
  unisat: any;
}

declare module "nerve-sdk-js"
declare module "nerveswap-sdk"
declare module "@/sdk"
