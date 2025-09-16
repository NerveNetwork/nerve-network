<template>
  <div class="mb-3 flex flex-wrap items-center justify-end md:justify-between">
    <div class="flex w-full items-center md:w-auto">
      <Input
        v-model="inputVal"
        :placeholder="$t('assets.assets8')"
        input-class="h-9 leading-9"
        class="mr-6 w-48 bg-card2 md:w-auto">
        <template #prepend><i-custom-search /></template>
      </Input>
      <Checkbox v-model="checkboxVal" :text="$t('assets.assets12')" />
    </div>
    <button @click="emit('showDialog')" class="btn">
      <i-custom-add-asset />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import Input from '@/components/Base/Input/index.vue'
import Checkbox from '@/components/Base/Checkbox/index.vue'

const props = defineProps<{
  searchVal: string
  hideSmall: boolean
}>()

const emit = defineEmits(['update:searchVal', 'update:hideSmall', 'showDialog'])

const inputVal = computed({
  get() {
    return props.searchVal
  },
  set(val: string) {
    emit('update:searchVal', val)
  }
})
const checkboxVal = computed({
  get() {
    return props.hideSmall
  },
  set(val: boolean) {
    emit('update:hideSmall', val)
  }
})
</script>
