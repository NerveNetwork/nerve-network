import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    name: 'home',
    // component: () => import("@/views/home/index.vue"),
    component: () => import('@/views/home/index.vue')
  },
  {
    path: '/assets',
    name: 'assets',
    component: () => import('@/views/assets/index.vue')
  },
  {
    path: '/consensus',
    name: 'consensus',
    component: () => import('@/views/consensus/index.vue')
  },
  {
    path: '/swap/:fromAsset?/:toAsset?',
    name: 'swap',
    component: () => import('@/views/swap/index.vue')
  },
  {
    path: '/liquidity/:fromAsset?/:toAsset?',
    name: 'liquidity',
    component: () => import('@/views/liquidity/index.vue')
  },
  {
    path: '/farm/:hash?',
    name: 'farm',
    component: () => import('@/views/farm/index.vue')
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
    component: () => import('@/views/node/index.vue')
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
