<template>
  <nav
    class="nav-menu flex h-full w-[150px] flex-col bg-card pt-3 xl:w-full xl:flex-row xl:bg-transparent xl:pt-0"
    @click.stop="">
    <template v-for="item in menus" :key="item.key">
      <div
        :class="
          clsxm(
            'h-12 px-4 leading-[48px] text-text transition-colors duration-300 hover:text-primary xl:h-auto xl:leading-normal',
            activeMenu === item.key && 'text-primary'
          )
        "
        @click="emit('clickMenu')">
        <!-- <div v-if="item.url" class="flex items-center cursor-pointer gap-1.5">
          <span>More</span>
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1.5 2.75L4 5.25L6.5 2.75"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div> -->
        <router-link :to="'/' + item.key">
          {{ item.label }}
        </router-link>
      </div>
    </template>
    <div
      :class="
        clsxm(
          'block h-12 px-4 leading-[48px] text-text transition-colors duration-300 hover:text-primary xl:hidden'
        )
      ">
      <a href="https://swapbox.nabox.io/" target="_blank"> Bridge </a>
    </div>
    <div
      :class="
        clsxm(
          'block h-12 px-4 leading-[48px] text-text transition-colors duration-300 hover:text-primary xl:hidden'
        )
      ">
      <a href="https://scan.nerve.network" target="_blank"> Explorer </a>
    </div>
    <div class="hidden px-4 text-text xl:block">
      <More />
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import More from './MenuMore.vue'
import clsxm from '@/utils/clsxm'

const emit = defineEmits(['clickMenu'])

const { t } = useI18n()

const route = useRoute()

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/create-farm') {
    return 'farm'
  } else if (path === '/mint-deploy') {
    return 'mint'
  }
  return path.split('/')[1] || 'home'
})

const menus = computed(() => {
  return [
    // {
    //   label: t('header.header10'),
    //   key: 'assets',
    //   needAuth: true
    // },
    {
      label: t('header.header1'),
      key: 'swap'
    },
    {
      label: t('header.header11'),
      key: 'consensus'
    },
    {
      label: t('header.header8'),
      key: 'farm'
    },
    {
      label: t('header.header2'),
      key: 'liquidity'
    },
    {
      label: 'Mint',
      key: 'mint'
    },
    {
      label: t('header.header12'),
      key: 'info'
    }
  ]
})

/* const { lang, switchLang } = useLang();
function changeLang() {
  switchLang();
  emit('clickMenu');
} */
</script>
