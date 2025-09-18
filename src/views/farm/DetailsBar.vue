<template>
  <div>
    <div
      class="flex flex-col gap-4 rounded-b-xl bg-card2 py-3 pl-4 pr-10 md:py-4 lg:flex-row lg:items-center lg:gap-0 lg:pl-6">
      <div class="shrink-0 md:w-[280px] lg:w-[326px]">
        <Link
          class="whitespace-nowrap"
          @click="toAddLiquidity"
          :label="$t('farm.farm7') + ' ' + tokenInfo.stakeTokenSymbol" />
      </div>
      <div class="flex flex-1 flex-col gap-4 lg:flex-row xl:gap-10">
        <div
          class="flex items-center justify-between rounded-xl border border-[#363947] bg-card px-4 py-3 lg:w-[320px] xl:w-[350px]">
          <div class="max-w-40 lg:max-w-[200px]">
            <div class="text-sm text-label">
              {{ tokenInfo.syrupTokenSymbol }}{{ $t('farm.farm2') }}
            </div>
            <div class="flex overflow-hidden">
              <!--  添加key 解决必须鼠标移上去才会变更数值问题          -->
              <el-tooltip placement="top" :key="tokenInfo.pendingReward">
                <template #content>
                  {{ $thousands(tokenInfo.pendingReward) }}
                </template>
                <div class="truncate">
                  {{ $thousands(tokenInfo.pendingReward) }}
                </div>
              </el-tooltip>
            </div>

            <!--            <p class="truncate">{{ $thousands(tokenInfo.pendingReward) }}</p>-->
            <div class="text-sm text-label">
              ≈${{ $thousands(tokenInfo.pendingRewardUSD) }}
            </div>
          </div>
          <div>
            <Button
              class="h-8 rounded-md px-7"
              @click="gether"
              :disabled="!Number(tokenInfo.pendingReward) || !nerveAddress">
              {{ $t('farm.farm21') }}
            </Button>
          </div>
        </div>
        <div
          class="flex items-center justify-between rounded-xl border border-[#363947] bg-card px-4 py-3 lg:w-[320px] xl:w-[350px]">
          <div class="max-w-40 lg:max-w-[200px]">
            <div class="text-sm text-label">{{ $t('farm.farm9') }}</div>
            <div class="flex overflow-hidden">
              <el-tooltip placement="top" :key="tokenInfo.stakeAmount">
                <template #content>
                  {{ $thousands(tokenInfo.stakeAmount) }}
                </template>
                <div class="truncate">
                  {{ $thousands(tokenInfo.stakeAmount) }}
                </div>
              </el-tooltip>
            </div>
            <div class="text-sm text-label">
              ≈${{ $thousands(tokenInfo.stakeUSD) }}
            </div>
          </div>

          <div class="flex items-center gap-3">
            <template v-if="needAuth">
              <Button class="h-8 rounded-md px-7" @click="authToken">
                {{ $t('transfer.transfer13') }}
              </Button>
            </template>
            <template v-else>
              <Button
                class="h-8 w-8 rounded-md px-0 text-base"
                :disabled="
                  !Number(tokenInfo.stakeAmount) ||
                  !nerveAddress ||
                  (!tokenInfo.isLocked && isNerve)
                "
                @click="handleLP(LpDialogType.Minus)">
                -
              </Button>
              <Button
                class="h-8 w-8 rounded-md px-0 text-base"
                :disabled="
                  !!!Number(tokenInfo.rewardBalance) ||
                  !nerveAddress ||
                  isFinished
                "
                @click="handleLP(LpDialogType.Add)">
                +
              </Button>
            </template>
          </div>

          <div class="right" v-if="false">
            <template v-if="needAuth">
              <el-button
                class="btns auth-btn"
                type="primary"
                size="small"
                @click="authToken">
                {{ $t('transfer.transfer13') }}
              </el-button>
            </template>
            <template v-else>
              <el-button
                class="btns"
                type="primary"
                size="small"
                :disabled="
                  !Number(tokenInfo.stakeAmount) ||
                  !nerveAddress ||
                  (!tokenInfo.isLocked && isNerve)
                "
                @click="handleLP(LpDialogType.Minus)">
                <el-icon><minus /></el-icon>
              </el-button>
              <el-button
                class="btns"
                type="primary"
                size="small"
                :disabled="
                  !!!Number(tokenInfo.rewardBalance) ||
                  !nerveAddress ||
                  isFinished
                "
                @click="handleLP(LpDialogType.Add)">
                <el-icon><plus /></el-icon>
              </el-button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <lp-dialog
      v-model:show="dialogAddOrMinus"
      :loading="loading"
      :balance="balance"
      :addOrMinus="addOrMinus"
      :lpName="tokenInfo.stakeTokenSymbol"
      :decimal="tokenInfo.stakeTokenDecimals"
      @confirm="confirmAddOrMinus"></lp-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import Link from '@/components/Link.vue'
import Button from '@/components/Base/Button/index.vue'
import LpDialog from './LpDialog.vue'
import { txAbi } from '@/contractConfig/contractConfig'
import useContractAddress from '@/views/farm/hooks/useContractAddress'
import { useWalletStore } from '@/store/wallet'
import useToast from '@/hooks/useToast'
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex'
import { ethers } from 'ethers'
import { getAssetBalance } from '@/service/api'
import { ETransfer } from '@/utils/api'
import { timesDecimals, divisionDecimals, toThousands } from '@/utils/util'
import config from '@/config'
import nerveswap from 'nerveswap-sdk'

import { UniFarmItem, NerveFarmItem, LpOperate, LpDialogType } from './types'

const props = defineProps({
  tokenInfo: {
    type: Object as PropType<NerveFarmItem | UniFarmItem>,
    default: () => {}
  },
  showId: {
    type: Boolean,
    default: false
  },
  isNerve: Boolean,
  nerveAddress: String,
  isFinished: Boolean
})

const emit = defineEmits(['loading'])

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { toastSuccess, toastError } = useToast()
const dialogAddOrMinus = ref(false)
const addOrMinus = ref<LpDialogType>(LpDialogType.Add)
const loading = ref(false)
const needAuth = ref(true)
const refreshAuth = ref(false)
const walletStore = useWalletStore()
const { addressInfo: currentAccount } = storeToRefs(walletStore)
const balance = ref('0')
const contractAddress = useContractAddress().value

const { handleResult, getWalletInfo } = useBroadcastNerveHex()

onMounted(() => {
  // console.log(props.tokenInfo, 9696);
  getERC20Allowance()
})
async function getERC20Allowance() {
  if (props.isNerve) {
    needAuth.value = false
  } else {
    const transfer = new ETransfer()
    const tokenInfo = props.tokenInfo as UniFarmItem
    needAuth.value = await transfer.getERC20Allowance(
      tokenInfo.lpToken,
      contractAddress,
      currentAccount.value?.address?.EVM
    )
    if (!needAuth.value) {
      refreshAuth.value = false
    }
    if (refreshAuth.value) {
      setTimeout(() => {
        getERC20Allowance()
      }, 5000)
    }
  }
}

// 授权token
async function authToken() {
  emit('loading', true)
  try {
    const transfer = new ETransfer()
    const tokenInfo = props.tokenInfo as UniFarmItem
    const res = await transfer.approveERC20(
      tokenInfo.lpToken,
      contractAddress,
      currentAccount.value?.address?.EVM
    )
    if (res.hash) {
      toastSuccess(t('transfer.transfer14'))
      refreshAuth.value = true
      getERC20Allowance()
    } else {
      toastError(res)
    }
  } catch (e) {
    toastError(e)
  }
  emit('loading', false)
}

// claim
async function gether() {
  emit('loading', true)
  if (props.isNerve) {
    await farmStake('0')
  } else {
    await LPOperation(LpOperate.Claim, '0')
  }
  emit('loading', false)
}

// 收取收益(number = 0) / 增加LP
async function farmStake(number: string) {
  try {
    const { provider, pub, EVMAddress } = getWalletInfo()
    const tokenInfo = props.tokenInfo as NerveFarmItem
    const {
      stakeTokenChainId,
      stakeTokenAssetId,
      stakeTokenDecimals,
      stakeTokenSymbol
    } = tokenInfo
    const farmHash = props.tokenInfo.farmHash || route.params?.hash
    const amount = timesDecimals(number, stakeTokenDecimals)

    let result
    if (number !== '0') {
      result = await nerveswap.farm.stake({
        provider,
        from: currentAccount.value?.address?.NERVE,
        assetChainId: stakeTokenChainId,
        assetId: stakeTokenAssetId,
        amount,
        farmHash,
        remark: '',
        EVMAddress,
        pub
      })
    } else {
      result = await nerveswap.farm.claim({
        provider,
        from: currentAccount.value?.address?.NERVE,
        assetChainId: stakeTokenChainId,
        assetId: stakeTokenAssetId,
        farmHash,
        remark: '',
        EVMAddress,
        pub
      })
    }
    const _amount = number !== '0' ? number : tokenInfo.pendingReward
    const amountRemark = `${toThousands(_amount)} ${stakeTokenSymbol}`
    const type = number !== '0' ? 66 : 'Farm Claim'
    handleResult(type, result, amountRemark)
    if (result.hash) {
      dialogAddOrMinus.value = false
    }
  } catch (e) {
    // console.log(e, "gain-profit-error");
    toastError(e)
  }
}

// 添加/退出lp弹窗
async function handleLP(type: string) {
  console.log(type, 9966333, props.tokenInfo)
  if (type === LpDialogType.Add) {
    dialogAddOrMinus.value = true
    addOrMinus.value = LpDialogType.Add
    getBalance()
  } else {
    dialogAddOrMinus.value = true
    addOrMinus.value = LpDialogType.Minus
    balance.value = props.tokenInfo.stakeAmount
  }
}

async function getBalance() {
  balance.value = ''
  if (props.isNerve) {
    const tokenInfo = props.tokenInfo as NerveFarmItem
    const { stakeTokenChainId, stakeTokenAssetId, stakeTokenDecimals } =
      tokenInfo
    const res: any = await getAssetBalance(
      stakeTokenChainId,
      stakeTokenAssetId,
      currentAccount.value?.address?.NERVE
    )
    balance.value = divisionDecimals(res.balanceStr, stakeTokenDecimals)
  } else {
    const transfer = new ETransfer()
    const tokenInfo = props.tokenInfo as UniFarmItem
    const contractAddress = tokenInfo.lpToken
    const address = currentAccount.value?.address?.EVM
    if (contractAddress) {
      const decimal = tokenInfo.stakeTokenDecimals
      balance.value = await transfer.getERC20Balance(
        contractAddress,
        Number(decimal),
        address
      )
    } else {
      balance.value = await transfer.getEthBalance(address)
    }
  }
}

// 添加 / 退出farm
async function confirmAddOrMinus(amount: string) {
  if (addOrMinus.value === LpDialogType.Add) {
    loading.value = true
    if (props.isNerve) {
      await farmStake(amount)
    } else {
      await LPOperation(LpOperate.Add, amount)
    }
    loading.value = false
  } else {
    // farmWithdraw
    loading.value = true
    if (props.isNerve) {
      await farmWithdrawal(amount)
    } else {
      await LPOperation(LpOperate.Remove, amount)
    }
    loading.value = false
  }
}

// 退出质押
async function farmWithdrawal(number: string) {
  const { provider, pub, EVMAddress } = getWalletInfo()
  const tokenInfo = props.tokenInfo as NerveFarmItem
  try {
    const {
      stakeTokenChainId,
      stakeTokenAssetId,
      stakeTokenDecimals,
      stakeTokenSymbol,
      farmHash
    } = tokenInfo
    const amount = timesDecimals(number, stakeTokenDecimals)

    const result = await nerveswap.farm.withdrawal({
      provider,
      from: currentAccount.value?.address?.NERVE,
      assetChainId: stakeTokenChainId,
      assetId: stakeTokenAssetId,
      amount,
      farmHash,
      remark: '',
      EVMAddress,
      pub
    })
    const amountRemark = `${toThousands(number)} ${stakeTokenSymbol}`
    handleResult(67, result, amountRemark)
    if (result.hash) {
      dialogAddOrMinus.value = false
    }
  } catch (e) {
    // console.log(e, "gain-profit-error");
    toastError(e)
  }
}

// evm 添加 - Add、减少 - Remove lp, 领取收益 -Claim
async function LPOperation(type: LpOperate, value: string) {
  try {
    const transfer = new ETransfer()
    const { stakeTokenDecimals } = props.tokenInfo
    const wallet = transfer.provider.getSigner()
    const contracts = new ethers.Contract(contractAddress, txAbi, wallet)
    let res
    const amount = timesDecimals(value, stakeTokenDecimals)
    // console.log(amount, 9595);
    const pid = props.tokenInfo.farmHash
    if (type === LpOperate.Add) {
      // console.log(props.tokenInfo.farmHash, 999888)
      res = await contracts.deposit(pid, amount)
    } else if (type === LpOperate.Remove) {
      res = await contracts.withdraw(pid, amount)
    } else {
      res = await contracts.deposit(pid, amount)
    }
    if (res.hash) {
      toastSuccess(t('transfer.transfer14'))
      dialogAddOrMinus.value = false
    } else {
      toastError(res)
    }
  } catch (e) {
    // console.error(e, 6666)
    toastError(e)
  }
}

function toAddLiquidity() {
  const {
    stakeTokenChainId,
    stakeTokenAssetId,
    swapPairAddress,
    syrupTokenChainId,
    syrupTokenAssetId,
    lpPairAssetAChainId,
    lpPairAssetAAssetId,
    lpPairAssetBChainId,
    lpPairAssetBAssetId
  } = props.tokenInfo as NerveFarmItem
  let url
  if (swapPairAddress) {
    url = `/liquidity/${lpPairAssetAChainId}-${lpPairAssetAAssetId}/${lpPairAssetBChainId}-${lpPairAssetBAssetId}`
  } else {
    const { chainId, assetId, NULSConfig } = config
    if (stakeTokenChainId === chainId && stakeTokenAssetId === assetId) {
      // 兑换资产为NVT， 使用NULS兑换
      const NULSInfo = NULSConfig.chainId + '-' + NULSConfig.assetId
      url = `/swap/${NULSInfo}/${stakeTokenChainId}-${stakeTokenAssetId}`
    } else {
      const nvtInfo = chainId + '-' + assetId
      url = `/swap/${nvtInfo}/${stakeTokenChainId}-${stakeTokenAssetId}`
    }
  }
  router.push(url)
}
</script>
