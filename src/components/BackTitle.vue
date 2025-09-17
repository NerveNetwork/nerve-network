<template>
  <div :class="clsxm('relative mb-6 text-center', props.class)">
    <router-link
      v-if="backPath"
      :to="backPath"
      class="absolute -left-1.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors duration-300 hover:bg-card2"
      ><i-custom-back
    /></router-link>
    <button
      v-else
      class="absolute left-0 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors duration-300 hover:bg-card2"
      @click="router.go(-1)">
      <i-custom-back class="h-5 w-5" />
    </button>
    <span class="text-lg">{{ title }}</span>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import clsxm from '@/utils/clsxm'
const props = defineProps<{
  title: string
  backPath?: string
  class?: string
}>()

const router = useRouter()
</script>
