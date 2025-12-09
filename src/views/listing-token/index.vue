<template>
  <div class="w1200">
    <div class="card-wrapper mx-auto max-w-[470px]" v-loading="loading">
      <BackTitle title="Listing Token" />
      <el-form label-position="top" :model="model" :rules="rules" ref="form">
        <el-form-item label="Native Chain" prop="L1Chain">
          <Select
            v-model="model.L1Chain"
            :options="chains"
            filterable
            placeholder="Select a Native Chain" />
        </el-form-item>
        <el-form-item label="Token Contract" prop="tokenContract">
          <Input class="bg-input" v-model="model.tokenContract" />
        </el-form-item>
        <el-form-item label="Token Name" prop="tokenName">
          <Input class="bg-input" disabled v-model="model.tokenSymbol" />
        </el-form-item>
        <el-form-item label="Token Symbol" prop="tokenSymbol">
          <Input class="bg-input" disabled v-model="model.tokenSymbol" />
        </el-form-item>
        <el-form-item label="Token Decimals" prop="tokenDecimals">
          <Input class="bg-input" disabled v-model="model.tokenDecimals" />
        </el-form-item>
        <el-form-item>
          <div class="w-full pt-6">
            <AuthButton class="w-full" v-if="!nerveAddress" />
            <Button class="w-full" @click="submitForm" v-else-if="!listSuccess">
              {{ $t('farm.farm19') }}
            </Button>
            <SubmitSuccess v-else />
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AuthButton from '@/components/AuthButton.vue'
import Input from '@/components/Base/Input/index.vue'
import Select from '@/components/Base/Select/index.vue'
import Button from '@/components/Base/Button/index.vue'
import BackTitle from '@/components/BackTitle.vue'
import SubmitSuccess from './SubmitSuccess.vue'
import { useWalletStore } from '@/store/wallet'
import useToast from '@/hooks/useToast'
import { ElForm } from 'element-plus'
import { doListingToken } from '@/service/api'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import TronLinkApi from '@/utils/tronLink'
import { ETransfer } from '@/utils/api'

const walletStore = useWalletStore()
const { nerveAddress, chain } = storeToRefs(walletStore)

const { toastError, toastSuccess } = useToast()

const form = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)
const model = reactive({
  L1Chain: '',
  tokenContract: '',
  tokenName: '',
  tokenSymbol: '',
  tokenDecimals: ''
})
const listSuccess = ref(false)
let provider: any

const chains = computed(() => {
  return Object.values(_networkInfo)
    .filter(v => v.type === 'EVM' || v.type === 'TRON')
    .map(k => ({
      label: k.label!,
      value: k.chainId + ''
    }))
})

const rules = reactive({
  tokenContract: [
    {
      required: true,
      message: 'Please enter token contract',
      trigger: 'change'
    },
    { validator: validateContarct, trigger: 'change' }
  ]
})

async function validateContarct(rule: any, value: any, callback: any) {
  if (!value || value.length < 30) {
    callback('Contract invalid')
    return
  }
  try {
    const valid = provider.validateAddress(value)
    // console.log(valid, 234)
    if (valid) {
      getTokenInfo()
      callback()
    } else {
      callback('Contract invalid')
    }
  } catch (e) {
    callback('Contract invalid')
  }
}

watch(
  () => model.tokenContract,
  () => {
    listSuccess.value = false
  }
)

watch(
  () => model.L1Chain,
  val => {
    model.tokenContract = ''
    model.tokenName = ''
    model.tokenSymbol = ''
    model.tokenDecimals = ''
    if (val) {
      const chain = Object.values(_networkInfo).find(
        v => Number(model.L1Chain) === v.chainId
      )
      if (chain?.type === 'EVM') {
        provider = new ETransfer(chain.name)
      } else {
        provider = new TronLinkApi()
      }
    }
  },
  {
    immediate: true
  }
)

let timer: number
const getTokenInfo = async () => {
  clearTimeout(timer)
  timer = window.setTimeout(async () => {
    model.tokenName = ''
    model.tokenSymbol = ''
    model.tokenDecimals = ''
    const res = await provider.getTokenInfo(model.tokenContract)
    if (res) {
      const [tokenName, tokenSymbol, tokenDecimals] = res
      model.tokenName = tokenName
      model.tokenSymbol = tokenSymbol
      model.tokenDecimals = tokenDecimals
    }
  }, 500)
}

onMounted(() => {
  const chainInfo = Object.values(_networkInfo).find(
    v => v.name === chain.value
  )
  if (chainInfo && (chainInfo.type === 'EVM' || chainInfo.type === 'TRON')) {
    model.L1Chain = chainInfo.chainId + ''
  } else {
    model.L1Chain = chains.value[0].value + ''
  }
})

function submitForm() {
  form.value?.validate((valid: any) => {
    if (valid) {
      handleConfirm()
    }
  })
}

async function handleConfirm() {
  loading.value = true
  try {
    const { L1Chain, tokenContract } = model
    await doListingToken(L1Chain, tokenContract)
    listSuccess.value = true
    toastSuccess('Success')
  } catch (e) {
    toastError(e)
  }
  loading.value = false
}
</script>
