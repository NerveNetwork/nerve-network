<template>
  <Modal
    :title="$t('trading.trading11')"
    container-class="w-[460px]"
    title-align="left"
    v-model="visible"
    @closed="emit('close')">
    <div>
      <div class="mb-4 text-label">{{ $t('trading.trading12') }}</div>
      <div class="flex gap-3">
        <template v-for="item in protectSets" :key="item">
          <button
            :class="
              clsxm(
                'flex flex-1 items-center justify-center rounded-xl border border-line',
                'transition-colors duration-300',
                slippageTolerance === item &&
                  'border-btn-primary bg-btn-primary'
              )
            "
            @click="chooseSlippageTolerance(item)">
            {{ item }}%
          </button>
        </template>
        <Input
          class="flex-1 bg-input"
          :value="customSlippageTolerance"
          @input="handleChange">
          <template #append>
            <div class="flex items-center gap-1.5">
              <div class="h-4 w-px bg-label"></div>
              <div>%</div>
            </div>
          </template>
        </Input>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import Modal from '@/components/Base/Modal/index.vue'
import Input from '@/components/Base/Input/index.vue'
import clsxm from '@/utils/clsxm'

const props = defineProps<{
  show: boolean
  slippageTolerance: string
}>()

const emit = defineEmits(['update:show', 'update:slippageTolerance', 'close'])

const visible = computed({
  get() {
    return props.show
  },
  set(val) {
    emit('update:show', val)
  }
})
const protectSets = ['0.5', '1', '3']
const customSlippageTolerance = ref('')

function chooseSlippageTolerance(val: string) {
  update(val)
  customSlippageTolerance.value = ''
}

function handleChange(val: string) {
  let decimals = 2
  const patrn = new RegExp(
    '^([1-9][\\d]{0,20}|0)(\\.[\\d]{0,' + decimals + '})?$'
  )
  if (patrn.exec(val) || val === '') {
    if (val === '') {
      customSlippageTolerance.value = ''
    } else if (Number(val) > 100) {
      customSlippageTolerance.value = '100'
    } else {
      customSlippageTolerance.value = val
    }
    update(customSlippageTolerance.value)
  }
}

function update(val: string) {
  // customSlippageTolerance.value = '';
  emit('update:slippageTolerance', val)
}
</script>
