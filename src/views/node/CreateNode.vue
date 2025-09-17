<template>
  <div class="card-wrapper mx-auto max-w-[470px]" v-loading="loading">
    <BackTitle :title="$t('createNode.createNode1')" />
    <el-form
      :model="formData"
      :rules="rules"
      ref="formRef"
      label-position="top"
    >
      <el-form-item :label="$t('createNode.createNode2')">
        <Input class="bg-input" disabled :model-value="address" />
      </el-form-item>
      <el-form-item
        :label="$t('createNode.createNode3')"
        prop="rewardAddress"
      >
        <Input
          class="bg-input"
          v-model.trim="formData.rewardAddress"
          maxlength="50"
        ></Input>
      </el-form-item>
      <el-form-item :label="$t('createNode.createNode4')" prop="blockAddress">
        <Input
          class="bg-input"
          v-model.trim="formData.blockAddress"
          maxlength="50"
        ></Input>
      </el-form-item>
      <el-form-item
        :label="$t('createNode.createNode5') + '(NVT)'"
        prop="amount"
      >
        <template #label>
          <p class="flex items-center justify-between">
            <span>
              {{ $t('createNode.createNode5') + '(NVT)' }}
            </span>
            <BalanceItem :balance="nvtBalance" />
          </p>
        </template>
        <!-- <el-input v-model.trim="formData.amount"></el-input> -->
        <Input class="bg-input" v-model="formData.amount" />
      </el-form-item>
      <el-form-item>
        <div class="w-full pt-7">
          <Button
            class="w-full"
            @click="createForm"
            v-if="address"
            :disabled="isRed">
            {{ $t('public.public9') }}
          </Button>
          <auth-button class="w-full" v-else></auth-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue';
import { ElForm } from 'element-plus';
import Input from '@/components/Base/Input/index.vue'
import Button from '@/components/Base/Button/index.vue'
import AuthButton from '@/components/AuthButton.vue';
import BackTitle from '@/components/BackTitle.vue';
import BalanceItem from '@/components/BalanceItem.vue';
import { useI18n } from 'vue-i18n';
import useToast from '@/hooks/useToast';
import { timesDecimals, isValidNerveAddress } from '@/utils/util';
import { getPunishList } from '@/service/api';
import config from '@/config';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';
import nerveswap from 'nerveswap-sdk';

const props = defineProps<{
  address: string;
  nvtBalance: string;
}>();
const emit = defineEmits(['refresh']);

const { t } = useI18n();
const { toast, toastError} = useToast();
const { getWalletInfo, handleResult } = useBroadcastNerveHex();

const formRef = ref<InstanceType<typeof ElForm>>();
const formData = reactive({
  rewardAddress: '',
  blockAddress: '',
  amount: ''
});
const checkRewardAddress = (rule: any, value: any, callback: any) => {
  const isValidAddress = isValidNerveAddress(value);
  if (!value) {
    return callback(new Error(t('createNode.createNode6')));
  } else if (!isValidAddress) {
    return callback(new Error(t('createNode.createNode10')));
  } else {
    formData.blockAddress &&
      formRef.value?.validateField('blockAddress', () => {});
    callback();
  }
};
const checkBlockAddress = (rule: any, value: any, callback: any) => {
  const isValidAddress = isValidNerveAddress(value);
  if (!value) {
    return callback(new Error(t('createNode.createNode7')));
  } else if (value === props.address) {
    return callback(new Error(t('createNode.createNode8')));
  } else if (value === formData.rewardAddress) {
    return callback(new Error(t('createNode.createNode11')));
  } else if (!isValidAddress) {
    return callback(new Error(t('createNode.createNode12')));
  } else {
    callback();
  }
};
const checkAmount = (rule: any, value: any, callback: any) => {
  const reg = new RegExp('^([1-9][0-9]*|0)?([.][0-9]{1,8})?$');
  if (!value) {
    return callback(new Error(t('createNode.createNode9')));
  } else if (!reg.exec(value)) {
    callback(new Error(t('createNode.createNode13')));
  } else if (+props.nvtBalance - value < 0) {
    callback(new Error(t('createNode.createNode14')));
  } else if (value < 200000 || value > 10000000000000000) {
    callback(new Error(t('createNode.createNode15')));
  } else {
    callback();
  }
};
const rules = {
  rewardAddress: [
    { validator: checkRewardAddress, trigger: ['blur', 'change'] }
  ],
  blockAddress: [{ validator: checkBlockAddress, trigger: ['blur', 'change'] }],
  amount: [{ validator: checkAmount, trigger: ['blur', 'change'] }]
};

onMounted(() => {
  checkValidAddress();
});

const isRed = ref(false);
async function checkValidAddress() {
  if (!props.address) return;
  const result: any = await getPunishList(props.address);
  isRed.value = result.list.length !== 0;
  if (result.list.length) {
    isRed.value = true;
    toast.warning(t('createNode.createNode16'));
  }
}

const loading = ref(false);
function createForm() {
  formRef.value?.validate(async valid => {
    if (valid) {
      try {
        loading.value = true;
        const { provider, EVMAddress, pub } = getWalletInfo();
        const { blockAddress, rewardAddress, amount } = formData;
        const transferInfo = {
          from: props.address,
          assetsChainId: config.chainId,
          assetsId: config.assetId,
          amount: timesDecimals(amount, 8),
          fee: 0
        };
        const txData = {
          agentAddress: props.address,
          packingAddress: blockAddress,
          rewardAddress: rewardAddress,
          deposit: timesDecimals(amount, 8)
        };
        const result = await nerveswap.node.createNode({
          provider,
          from: props.address!,
          amount: timesDecimals(amount, 8),
          packingAddress: blockAddress,
          rewardAddress,
          EVMAddress,
          pub
        });
        handleResult(4, result, '');
        // const result: any = await handleTxInfo(transferInfo, 4, txData);
        // if (result && result.hash) {
        //   emit('refresh');
        // }
      } catch (e) {
        console.log(e, 'create-node-error');
        toastError(e);
      }
      loading.value = false;
    }
  });
}
</script>
