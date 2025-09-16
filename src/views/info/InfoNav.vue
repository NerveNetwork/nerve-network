<template>
  <div
    class="mb-6 flex flex-col flex-wrap items-start justify-between md:flex-row md:items-center">
    <Tabs class="mb-4 md:mb-0" :active-tab="activePath" :tabs="routeConfig" />
    <InfoSearch />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Tabs from '@/components/Base/Tabs/index.vue'
import InfoSearch from './InfoSearch.vue'

const { t } = useI18n()
const route = useRoute()

const routeConfig = computed(() => {
  return [
    { label: t('info.info1'), path: '/info', key: 'info' },
    { label: t('info.info2'), path: '/info/pools', key: 'pools' },
    { label: t('info.info3'), path: '/info/tokens', key: 'tokens' },
    {
      label: t('info.info35'),
      path: '/info/multi-routing',
      key: 'multiRouting'
    }
  ]
})

const activePath = computed(() => {
  return route.path
  // console.log(path);
  // const pathArr = path.split('/');
  // return pathArr[pathArr.length - 1];
})
</script>
