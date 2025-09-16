<template>
  <div
    class="w1200"
    ref="linkRef">
    <div class="flex flex-col xl:flex-row gap-10 mb-10 xl:mb-20">
      <LinkCard
        :title="$t('header.header1')"
        :desc="$t('home.home3')"
        :btn-label="$t('home.home5')"
        link="/swap"
        :pic-src="swap" />
      <LinkCard
        title="Bridge"
        :desc="$t('home.home4')"
        :btn-label="$t('home.home6')"
        :link="config.bridgeUrl"
        :pic-src="bridge" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import LinkCard from './LinkCard.vue'
import swap from '@/assets/img/swap.png'
import bridge from '@/assets/img/bridge.png'
import config from '@/config'
import { useObserveAnimate } from '@/hooks/useObserveAnimate'

const linkRef = useObserveAnimate()
</script>
