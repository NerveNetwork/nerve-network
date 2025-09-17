<template>
  <Modal
    container-class="w-[470px]"
    :title="
      addOrMinus === LpDialogType.Add
        ? $t('farm.farm20') + 'LP'
        : $t('farm.farm10') + 'LP'
    "
    v-model="visible"
    :close-on-backdrop-click="false"
    :show-close="false"
    @closed="close"
  >
    <div v-loading="loading">
      <!-- form -->
      <div class="flex items-center justify-between text-label mb-2">
        <span v-if="lpName">{{ lpName }}</span>
        <BalanceItem :balance="balance" />
      </div>
      <Input v-model="numberValue" class="bg-input" placeholder="0.0">
        <template #append>
          <div class="flex items-center gap-4">
            <div class="w-px h-4 bg-label"></div>
            <div class="btn text-primary cursor-pointer"
              @click="clickMax">
              Max
            </div>
          </div>
        </template>
      </Input>
      <div class="text-error" v-if="amountErrorTip">
        {{ amountErrorTip }}
      </div>
    <!-- footer -->
      <div class="w-full flex gap-4 pt-6">
        <Button class="flex-1" variant="outline" @click="closeAddOrMinus">
          {{ $t('public.public8') }}
        </Button>
        <Button class="flex-1" :disabled="disableTx" @click="confirmAddOrMinus">
          {{ $t('public.public9') }}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import Modal from '@/components/Base/Modal/index.vue'
import Input from '@/components/Base/Input/index.vue'
import Button from '@/components/Base/Button/index.vue'
import BalanceItem from '@/components/BalanceItem.vue';
import { Minus } from '@/utils/util';
import { useI18n } from 'vue-i18n';
import { LpDialogType } from './types';

const props = defineProps<{
  show: boolean;
  balance: string;
  loading: boolean;
  addOrMinus: LpDialogType;
  lpName: string;
  decimal: number;
}>();

const emit = defineEmits(['update:show', 'confirm']);

const { t } = useI18n();
const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('update:show', val);
  }
});

const numberValue = ref('');
const amountErrorTip = ref('');
const disableTx = computed(() => {
  return !!(!Number(numberValue.value) || amountErrorTip.value);
});
watch(
  () => numberValue.value,
  val => {
    if (val) {
      let decimals = props.decimal || 0;
      let patrn: RegExp;
      if (!decimals) {
        patrn = new RegExp('^([1-9][\\d]*|0)(\\.[\\d]*)?$|(^\\.[\\d]*$)');
      } else {
        patrn = new RegExp(
          '^([1-9][\\d]*|0)(\\.[\\d]{0,' +
            decimals +
            '})?$|(^\\.[\\d]{0,' +
            decimals +
            '}$)'
        );
      }
      if (!patrn.exec(val)) {
        amountErrorTip.value = t('transfer.transfer17') + decimals;
      } else if (
        !Number(props.balance) ||
        Minus(props.balance, val).toNumber() < 0
      ) {
        amountErrorTip.value = t('transfer.transfer15');
      } else {
        amountErrorTip.value = '';
      }
    }
  }
);

function clickMax() {
  if (!Number(props.balance)) return;
  numberValue.value = props.balance;
}

function closeAddOrMinus() {
  emit('update:show', false);
  numberValue.value = '';
}
function confirmAddOrMinus() {
  emit('confirm', numberValue.value);
  numberValue.value = '';
}
function close() {
  amountErrorTip.value = '';
  numberValue.value = '';
}
</script>
