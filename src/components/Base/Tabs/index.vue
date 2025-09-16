<template>
  <div :class="clsxm('mb-4 flex', props.class)">
    <template v-for="item in tabs" :key="item.label">
      <template v-if="item.path">
        <router-link
          :to="item.path"
          :class="
            clsxm(
              'mr-4 border-b-[2px] pb-2 text-base font-semibold md:mr-6 md:text-lg',
              item.path === props.activeTab
                ? 'border-primary text-text'
                : 'border-transparent text-label'
            )
          ">
          {{ item.label }}
        </router-link>
      </template>
      <template v-else>
        <div
          :class="
            clsxm(
              'mr-4 cursor-pointer border-b-[2px] pb-2 text-base font-semibold md:mr-6 md:text-lg',
              item.value === props.activeTab
                ? 'border-primary text-text'
                : 'border-transparent text-label'
            )
          "
          @click="emit('change', item.value!)">
          {{ item.label }}
        </div>
      </template>
    </template>
  </div>
</template>
<script setup lang="ts">
import clsxm from '@/utils/clsxm'
interface Props {
  activeTab: string
  tabs: { label: string; value?: string; path?: string }[]
  class?: string
  router?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'change', value: string): void
}>()
</script>
