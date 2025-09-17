<template>
  <div class="relative" ref="wrapper">
    <slot />
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div class="absolute right-0 top-[40px] z-[111]" v-if="show">
        <div
          class="min-w-[320px] rounded-[10px] border border-line bg-card p-4">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center mr-2">
              <img class="h-6 w-6" :src="providerLogo" alt="" />
              <span class="ml-1.5">{{ superLong(address, 8) }}</span>
            </div>

            <div class="flex gap-1">
              <button
                @click="$copy(address)"
                class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2C303E] hover:opacity-70">
                <i-custom-copy />
              </button>
              <button
                @click="openExplorer('address', address)"
                class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2C303E] hover:opacity-70"
                href="">
                <i-custom-open class="text-white" />
              </button>
              <router-link
                to="/asset-center/tx"
                @click="show = false"
                class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2C303E] hover:opacity-70"
                href="">
                <i-custom-list />
              </router-link>
            </div>
          </div>
          <div class="flex items-center justify-center">
            <button
              @click="emit('disconnect')"
              class="h-7 rounded-lg bg-[#202B39] px-3 text-primary hover:opacity-70">
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import useClickOutside from '@/hooks/useClickOutside'
import { superLong, openExplorer } from '@/utils/util'
import { getProviderName, ALL_Provider } from '@/utils/providerUtil'

const props = defineProps<{
  modelValue: boolean
  address: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'disconnect'): void
}>()

const show = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const providerName = getProviderName()
const providerLogo = ALL_Provider.find(v => v.name === providerName)!.src

const wrapper = ref<HTMLElement>()
const { isClickOutside } = useClickOutside(wrapper)
watch(
  () => isClickOutside.value,
  val => {
    if (val) {
      show.value = false
    }
  }
)
</script>
