<template>
  <div class="w1200">
    <div
      class="contract-deploy card-wrapper mx-auto max-w-[470px]"
      v-loading="loading">
      <BackTitle title="Contract Deploy" />
      <el-form label-position="top" :model="model" :rules="rules" ref="form">
        <el-form-item label="Deploy Chain" prop="L1Chain">
          <Input class="bg-input" disabled v-model="model.L1Chain" />
        </el-form-item>

        <el-form-item label="Token" prop="token">
          <Select
            v-model="model.token"
            :options="tokenList"
            placeholder="Select a token asset" />
          <!-- <el-select
            v-model="model.token"
            filterable
            placeholder="Select a token asset"
            popper-class="asset-select"
          >
            <el-option
              :label="item.symbol + '(' + item.assetKey + ')'"
              :value="item.assetKey"
              v-for="item in tokenList"
              :key="item.assetKey"
            ></el-option>
          </el-select> -->
        </el-form-item>
        <el-form-item label="Token Name" prop="tokenName">
          <!-- <el-input v-model="model.tokenName"></el-input> -->
          <Input class="bg-input" v-model="model.tokenName" />
        </el-form-item>
        <el-form-item label="Token Symbol" prop="tokenSymbol">
          <!-- <el-input v-model="model.tokenSymbol"></el-input> -->
          <Input class="bg-input" v-model="model.tokenSymbol" />
        </el-form-item>
        <el-form-item label="Token Decimals" prop="tokenDecimals">
          <!-- <el-input v-model="model.tokenDecimals" disabled></el-input> -->
          <Input class="bg-input" disabled v-model="model.tokenDecimals" />
        </el-form-item>
        <el-form-item label="Minter" prop="minter">
          <!-- <el-input v-model="model.minter" disabled></el-input> -->
          <Input class="bg-input" disabled v-model="model.minter" />
        </el-form-item>
        <el-form-item>
          <div class="w-full pt-4">
            <Button
              class="w-full"
              @click="submitForm"
              v-if="nerveAddress">
              {{ $t('farm.farm19') }}
            </Button>
            <auth-button class="w-full" v-else></auth-button>
          </div>
          <!-- <el-button type="primary" @click="submitForm" v-if="nerveAddress">
            {{ $t('farm.farm19') }}
          </el-button>
          <auth-button v-else></auth-button> -->
        </el-form-item>
      </el-form>
      <div class="pt-5" v-if="tokenContract">
        <h3 class="text-base font-medium">Token Contract:</h3>
        <span class="cursor-pointer text-primary" @click="openUrl(tokenContract)">
          {{ tokenContract }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import AuthButton from '@/components/AuthButton.vue'
import Input from '@/components/Base/Input/index.vue'
import Select from '@/components/Base/Select/index.vue'
import Button from '@/components/Base/Button/index.vue'
import BackTitle from '@/components/BackTitle.vue';
import { useWalletStore } from '@/store/wallet'
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';
import useToast from '@/hooks/useToast';
import { ElForm } from 'element-plus';
import { getDeployMinter, registerCrossChainAsset } from '@/service/api';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import { ethers } from 'ethers';
import {
  CommonByteCode,
  ModeByteCode,
  BlastByteCode,
  abi
} from './deployConfig';
import { openL1Explorer } from '@/utils/util';

const walletStore = useWalletStore()
const { nerveAddress, assetsList: assetList, chain } = storeToRefs(walletStore)

const router = useRouter();
const { toastError, toastSuccess } = useToast();

const form = ref<InstanceType<typeof ElForm>>();
const loading = ref(false);
const model = reactive({
  L1Chain: '',
  token: '',
  tokenName: '',
  tokenSymbol: '',
  tokenDecimals: '',
  minter: ''
});

let L1ChainType = '';
let L1ChainId = 0;

const tokenContract = ref('');

const rules = reactive({
  L1Chain: [
    {
      required: true,
      message: 'Please switch to a valid EVM Chain'
    },
    { validator: validateL1Chain }
  ],
  token: [
    {
      required: true,
      message: 'Please select a token',
      trigger: 'change'
    }
  ],
  tokenName: [
    {
      required: true,
      message: 'Please enter the token name',
      trigger: 'change'
    },
    { validator: validateName }
  ],
  tokenSymbol: [
    {
      required: true,
      message: 'Please enter the token symbol',
      trigger: 'change'
    },
    { validator: validateSymbol }
  ],
  tokenDecimals: [
    {
      required: true,
      message: 'Invalid decimals'
    }
  ],
  minter: [
    {
      required: true,
      message: 'Invalid minter'
    }
  ]
});

function validateL1Chain(rule: any, value: any, callback: any) {
  if (L1ChainType !== 'EVM') {
    callback('Please switch to a valid EVM Chain');
  } else {
    callback();
  }
}

function validateName(rule: any, value: any, callback: any) {
  const reg = /^[a-zA-Z0-9_]{1,20}$/;
  if (!reg.test(value)) {
    callback('Invalid Token Name');
  } else {
    callback();
  }
}

function validateSymbol(rule: any, value: any, callback: any) {
  const reg = /^[a-zA-Z0-9_]{1,20}$/;
  if (!reg.test(value)) {
    callback('Invalid Token Symbol');
  } else {
    callback();
  }
}

watch(
  () => chain.value,
  val => {
    if (val) {
      const chainInfo = Object.values(_networkInfo).find(
        v => v.name === val
      );
      if (chainInfo) {
        L1ChainType = chainInfo.type;
        L1ChainId = chainInfo.chainId;
        getDeployMinter(L1ChainId).then(res => (model.minter = res));
      } else {
        L1ChainType = '';
        L1ChainId = 0;
      }
    }
    model.L1Chain = val;
  },
  { immediate: true }
);

const tokenList = computed(() => {
  const chainInfo = Object.values(_networkInfo).find(
    v => v.name === chain.value
  );
  const hId = chainInfo?.chainId;
  return assetList.value
    .filter(v => {
    // @ts-ignore
    return v.list && v.list.every(item => item.hId !== hId);
    }).map(k => ({
      ...k,
      label: k.symbol + '(' + k.assetKey + ')',
      value: k.assetKey
    }));
});

watch(
  () => model.token,
  val => {
    if (!val) {
      model.tokenName = '';
      model.tokenSymbol = '';
      model.tokenDecimals = '';
    } else {
      const tokenInfo = assetList.value.find(v => v.assetKey === val)!;
      console.log(tokenInfo, 234);
      model.tokenName = tokenInfo.symbol;
      model.tokenSymbol = tokenInfo?.symbol;
      model.tokenDecimals = tokenInfo?.decimals + '';
    }
  },
  { immediate: true }
);

const tokenInfo = computed(() => {
  if (!model.token) return {};
  return tokenList.value.find(v => v.assetKey === model.token);
});

function submitForm() {
  form.value?.validate((valid: any) => {
    if (valid) {
      handleDeploy();
    }
  });
}
const { getWalletInfo } = useBroadcastNerveHex();

async function handleDeploy() {
  loading.value = true;
  tokenContract.value = '';
  try {
    const { token, tokenName, tokenSymbol, tokenDecimals, minter } = model;
    const { provider, EVMAddress } = getWalletInfo();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    const byteCode =
      L1ChainId === 138
        ? ModeByteCode
        : L1ChainId === 139
        ? BlastByteCode
        : CommonByteCode;
    const factory = new ethers.ContractFactory(
      abi,
      byteCode,
      web3Provider.getSigner()
    );
    const contract = await factory.deploy(
      tokenName,
      tokenSymbol,
      tokenDecimals,
      minter
    );
    const contractAddress = contract.address;
    const txHash = contract.deployTransaction.hash;
    /* console.log(contract, '--contract--');
    const wait1 = await contract.deployTransaction.wait();
    console.log(wait1, '--wait1--');
    const wait2 = await contract.value();
    console.log(wait2, '--wait2--'); */
    await registerCrossChainAsset(
      contractAddress,
      EVMAddress,
      txHash,
      L1ChainId,
      token
    );
    tokenContract.value = contractAddress;
    toastSuccess('Success');
  } catch (e) {
    console.log(e, 'contract-deploy-error');
    toastError(e);
  }
  loading.value = false;
}

function openUrl(address: string) {
  openL1Explorer(chain.value, 'address', address);
}
</script>
