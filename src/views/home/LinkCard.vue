<template>
  <div
    class="bg-card xl:h-[298px] flex-1 flex flex-col xl:flex-row xl:gap-14 items-center p-6 xl:p-10 rounded-[20px]">
    <img class="h-[150px] mb-6 xl:mb-0" :src="props.picSrc" alt="" />
    <div class="flex flex-col items-center xl:items-start">
      <div class="text-3xl font-bold mb-4">{{ props.title }}</div>
      <div class="text-base mb-6 xl:mb-10">{{ props.desc }}</div>
      <router-link :to="props.link" v-if="props.link.startsWith('/')">
        <Button variant="gradient" class="h-10 px-6 rounded-[20px]">
          {{ props.btnLabel }}
        </Button>
      </router-link>
      <a :href="props.link" target="_blank" v-else>
        <Button variant="gradient" class="h-10 px-6 rounded-[20px]">
          {{ props.btnLabel }}
        </Button>
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Button from '@/components/Base/Button/index.vue'
const props = defineProps<{
  title: string
  desc: string
  picSrc: string
  link: string
  btnLabel: string
}>()
</script>
