import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const Home = () => import('@/views/home/index.vue');
const Assets = () => import('@/views/assets/index.vue');
const Consensus = () => import('@/views/consensus/index.vue');
const Swap = () => import('@/views/swap/index.vue');
const Liquidity = () => import('@/views/liquidity/index.vue');
const Farm = () => import('@/views/farm/index.vue');
const Node = () => import('@/views/node/index.vue');
const Info = () => import('@/views/info/index.vue');
const InfoOverview = () => import('@/views/info/Overview/index.vue');
const InfoPools = () => import('@/views/info/Pools/index.vue');
const InfoTokens = () => import('@/views/info/Tokens/index.vue');
const PoolDetail = () => import('@/views/info/PoolDetail/index.vue');
const TokenDetail = () => import('@/views/info/TokenDetail/index.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    name: 'home',
    // component: () => import("@/views/home/index.vue"),
    component: Home
  },
  {
    path: '/assets',
    name: 'assets',
    component: Assets
  },
  {
    path: '/consensus',
    name: 'consensus',
    component: Consensus
  },
  {
    path: '/swap/:fromAsset?/:toAsset?',
    name: 'swap',
    component: Swap
  },
  {
    path: '/liquidity/:fromAsset?/:toAsset?',
    name: 'liquidity',
    component: Liquidity
  },
  {
    path: '/farm/:hash?',
    name: 'farm',
    component: Farm
  },
  /*{
    path: '/pool/:hash?',
    name: 'pool',
    component: () => import('@/views/pool/index.vue'),
    // component: Pool
  },*/
  {
    path: '/node',
    name: 'node',
    component: Node
  },
  {
    path: '/info/:type?',
    name: 'info',
    component: Info,
    children: [
      { path: '', component: InfoOverview },
      { path: 'pools', component: InfoPools },
      { path: 'tokens', component: InfoTokens }
    ]
  },
  {
    path: '/info/pools/:id',
    name: 'poolDetail',
    component: PoolDetail
  },
  {
    path: '/info/tokens/:id',
    name: 'tokenDetail',
    component: TokenDetail
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
