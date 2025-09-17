<template>
  <Modal
    container-class="w-[500px]"
    :title="
      handleType === HandleType.ADDITION
        ? $t('nodeDetail.nodeDetail14')
        : $t('nodeDetail.nodeDetail13')
    "
    v-model="visible"
    @closed="resetForm"
  >
    <div v-loading="loading">
      <el-form
        :model="formData"
        :rules="rules"
        ref="formRef"
        label-position="top"
      >
        <el-form-item prop="amount">
          <template #label>
            <p class="flex items-center justify-between">
              <span>
                {{
                  handleType === HandleType.ADDITION
                    ? $t('nodeDetail.nodeDetail15')
                    : $t('nodeDetail.nodeDetail16') + ': '
                }}
              </span>
              <BalanceItem v-if="handleType === HandleType.ADDITION" :balance="balance" />
            </p>
          </template>
          <Input v-model="formData.amount" />
        </el-form-item>
        <!--      <el-form-item :label="$t('public.fee')+': '">
                <span class="fee">0.001 NVT</span>
              </el-form-item>-->
      </el-form>
      <div class="flex gap-3 pt-7">
        <Button class="flex-1" variant="outline" @click="visible = false">{{ $t('public.public8') }}</Button>
        <Button class="flex-1" @click="handleSubmit">{{ $t('public.public9') }}</Button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { ElForm } from 'element-plus';
import Modal from '@/components/Base/Modal/index.vue'
import Input from '@/components/Base/Input/index.vue'
import Button from '@/components/Base/Button/index.vue'
import BalanceItem from '@/components/BalanceItem.vue';

import { HandleType } from '@/views/node/types';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  show: boolean;
  loading: boolean;
  handleType: HandleType;
  balance: string;
  totalDeposit: string;
}>();

const emit = defineEmits(['update:show', 'submit']);

const { t } = useI18n();

const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('update:show', val);
  }
});

const formRef = ref<InstanceType<typeof ElForm>>();

const formData = reactive({
  amount: ''
});
const checkAmount = (rule: any, value: any, callback: any) => {
  const reg = new RegExp('^([1-9][0-9]*|0)?([.][0-9]{1,8})?$');
  const minAmount = 2000;
  if (props.handleType === HandleType.ADDITION) {
    if (!value) {
      return callback(new Error(t('nodeDetail.nodeDetail17')));
    } else if (!reg.exec(value)) {
      callback(new Error(t('nodeDetail.nodeDetail18')));
    } else if (value - minAmount < 0) {
      return callback(new Error(t('nodeDetail.nodeDetail19')));
    } else if (+props.balance - value < 0) {
      return callback(new Error(t('nodeDetail.nodeDetail20') + props.balance));
    } else {
      callback();
    }
  } else {
    const maxNumber = +props.totalDeposit - 200000;
    if (!value) {
      return callback(new Error(t('nodeDetail.nodeDetail21')));
    } else if (!reg.exec(value)) {
      return callback(new Error(t('nodeDetail.nodeDetail22')));
    } else if (value - minAmount < 0) {
      return callback(new Error(t('nodeDetail.nodeDetail23')));
    } else if (value - maxNumber > 0) {
      return callback(
        new Error(t('nodeDetail.nodeDetail24') + ' ' + maxNumber)
      );
    } else {
      callback();
    }
  }
};
const rules = {
  amount: [{ validator: checkAmount, trigger: ['blur', 'change'] }]
};

// const loading = ref(false);
function handleSubmit() {
  formRef.value?.validate(async valid => {
    if (valid) {
      emit('submit', formData.amount, props.handleType);
    }
  });
}

function resetForm() {
  formRef.value?.resetFields();
}
</script>
