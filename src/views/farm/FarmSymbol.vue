<template>
  <div class="flex md:w-[304px] lg:w-[350px] items-center">
    <div class="mult-img-wrap relative mr-3 h-10 w-10" v-if="props.logo2">
      <div class="absolute left-0 top-0 rounded-full overflow-hidden">
        <symbol-icon class="!h-6 !w-6" :icon="props.logo2"></symbol-icon>
      </div>

      <div class="absolute bottom-0 right-0 bg-card rounded-full overflow-hidden">
        <symbol-icon
          class="!h-[30px] !w-[30px]"
          :icon="props.logo1"></symbol-icon>
      </div>
    </div>
    <!-- <div class="img-wrap" v-else>
      <symbol-icon :icon="props.logo1"></symbol-icon>
    </div> -->
    <div class="font-base">{{ props.name }}</div>
  </div>
</template>

<script lang="ts" setup>
import SymbolIcon from '@/components/SymbolIcon.vue'

const props = defineProps({
  logo1: String,
  logo2: String,
  name: String
})
</script>
