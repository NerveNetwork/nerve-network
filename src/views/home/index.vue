<template>
  <div class="home w1200">
    <Description />
    <LinkWrapper />
    <DataInfo />
    <SupportChains />
    <!-- <Partner /> -->
  </div>
</template>

<script lang="ts" setup>
import Description from './Description.vue';
import LinkWrapper from './LinkWrapper.vue';
import DataInfo from './DataInfo.vue';
import SupportChains from './SupportChains.vue';
// import Partner from './Partner.vue';
</script>

<style lang="scss">
.home :is(.link-wrapper, .data-info, .support-chains, .partner) {
  opacity: 0;
  transform: translateY(100px) scale(0.98);
  // filter: blur(4px);
  transition: opacity 1s cubic-bezier(0.22, 1, 0.36, 1),
    transform 1s cubic-bezier(0.22, 1, 0.36, 1),
    filter 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.home .animate-in {
  opacity: 1;
  transform: translateY(0) scale(1);
  // filter: blur(0) !important;
}

.home {
  @media screen and (max-width: 1200px) {
    padding: 0 16px;
  }
}
</style>
