<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0">
    <div
      v-if="visible"
      :class="[
        'flex items-center justify-center',
        fullscreen ? 'fixed inset-0 z-[9999]' : 'absolute inset-0 z-50'
      ]"
      @wheel.prevent
      @touchmove.prevent>
      <div
        :class="[
          'absolute inset-0 backdrop-blur-sm',
          fullscreen ? 'bg-[rgba(10,11,14,.8)]' : 'bg-[rgba(10,11,14,.4)]'
        ]"
        @wheel.prevent
        @touchmove.prevent></div>
      <div class="relative flex flex-col items-center">
        <!-- Loading -->
        <div
          :class="[
            'relative',
            size === 'sm'
              ? 'w-20 h-20'
              : size === 'lg'
                ? 'w-40 h-40'
                : 'w-32 h-32'
          ]">
          <!--  -->
          <div
            class="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-[pulse_2s_ease-in-out_infinite]"></div>

          <!--  -->
          <div class="absolute inset-0">
            <div
              :class="[
                'absolute border-r-primary border-t-primary/50 border-l-primary/30 border-b-primary/10 rounded-full animate-[spin_2.5s_linear_infinite_reverse]',
                size === 'sm'
                  ? 'inset-2 border-[4px]'
                  : size === 'lg'
                    ? 'inset-6 border-[8px]'
                    : 'inset-4 border-[6px]'
              ]"></div>
            <div
              :class="[
                'absolute border-b-primary border-r-primary/50 border-t-primary/30 border-l-primary/10 rounded-full animate-[spin_2s_linear_infinite]',
                size === 'sm'
                  ? 'inset-4 border-[4px]'
                  : size === 'lg'
                    ? 'inset-12 border-[8px]'
                    : 'inset-8 border-[6px]'
              ]"></div>
            <div
              :class="[
                'absolute border-l-primary border-b-primary/50 border-r-primary/30 border-t-primary/10 rounded-full animate-[spin_1.5s_linear_infinite_reverse]',
                size === 'sm'
                  ? 'inset-6 border-[4px]'
                  : size === 'lg'
                    ? 'inset-[18px] border-[8px]'
                    : 'inset-12 border-[6px]'
              ]"></div>
          </div>

          <div class="absolute inset-0 flex items-center justify-center">
            <div
              :class="[
                'relative',
                size === 'sm'
                  ? 'w-4 h-4'
                  : size === 'lg'
                    ? 'w-8 h-8'
                    : 'w-6 h-6'
              ]">
              <div
                class="absolute inset-0 bg-primary rounded-full animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div
                class="absolute inset-0 bg-primary/30 rounded-full animate-[pulse_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <div
                class="relative w-full h-full bg-primary rounded-full animate-[pulse_1s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>

        <div
          :class="[
            'mt-8 relative',
            size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-3xl'
          ]">
          <div
            class="font-medium bg-text-linear bg-clip-text text-transparent animate-[pulse_2s_ease-in-out_infinite]">
            {{ text }}
          </div>

          <div class="absolute -bottom-3 left-0 right-0 h-[2px]">
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent animate-[pulse_2s_ease-in-out_infinite]"></div>
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-[pulse_2s_ease-in-out_infinite_reverse]"></div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  text?: string
  fullscreen?: boolean
  size?: 'sm' | 'md' | 'lg'
}
withDefaults(defineProps<Props>(), {
  text: '',
  size: 'md'
})
</script>
