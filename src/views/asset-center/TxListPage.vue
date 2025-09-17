<template>
  <div class="min-h-[70vh]">
    <div class="hidden lg:block">
      <el-table :data="accountTxs" class="show_table">
        <el-table-column label="Hash">
          <template v-slot="scope">
            <div
              class="flex cursor-pointer items-center gap-1.5 text-primary"
              @click="openUrl(scope.row)">
              <span>{{ superLong(scope.row.hash, 8) }}</span>
              <i-custom-open />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Time">
          <template v-slot="scope">
            {{ dayjs(scope.row.time).format('MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="Type">
          <template v-slot="scope">
            {{
              scope.row.type
                ? $t('transferType.' + scope.row.type)
                : scope.row.L1Chain + ' ' + scope.row.L1Type
            }}
          </template>
        </el-table-column>
        <el-table-column label="Amount">
          <template v-slot="scope">
            {{ scope.row.amountRemark ? scope.row.amountRemark : '--' }}
          </template>
        </el-table-column>
        <el-table-column label="Status" width="200px">
          <template v-slot="scope">
            <div class="flex items-center gap-1.5">
              <template v-if="scope.row.status === 1">
                <i-custom-success class="h-4 w-4" />
                <span>Success</span>
              </template>
              <template
                v-else-if="scope.row.type === 43 && scope.row.hId !== 204">
                <i-custom-loading class="h-4 w-4 animate-spin text-label" />
                <span
                  @click="handleShowAddFee(scope.row)"
                  class="cursor-pointer text-primary"
                  >Additional fee</span
                >
              </template>
              <template v-else>
                <i-custom-loading class="h-4 w-4 animate-spin text-label" />
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="lg:hidden">
      <el-empty
        :description="$t('public.public19')"
        v-if="!accountTxs.length" />
      <div v-for="(item, index) in accountTxs" v-else :key="index">
        <div class="border-b border-line p-3">
          <div class="grid grid-flow-row-dense grid-cols-3 md:grid-cols-4">
            <div
              class="flex cursor-pointer items-center gap-1.5 text-primary"
              @click="openUrl(item)">
              <span>{{ superLong(item.hash, 4) }}</span>
              <i-custom-open />
            </div>
            <div class="hidden md:block">
              {{
                item.type
                  ? $t('transferType.' + item.type)
                  : item.L1Chain + ' ' + item.L1Type
              }}
            </div>
            <div class="text-center">
              {{ item.amountRemark ? item.amountRemark : '--' }}
            </div>
            <div class="flex items-center justify-end gap-1.5">
              <template v-if="item.status === 1">
                <i-custom-success />
              </template>
              <template v-else-if="item.type === 43 && item.hId !== 204">
                <span></span>
                <i-custom-loading class="h-3 w-3 animate-spin text-label" />
              </template>
              <template v-else>
                <i-custom-loading class="h-3 w-3 animate-spin text-label" />
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Modal
    container-class="w-[480px]"
    title="Re-record Transaction Hash"
    v-model="showAddCrossTxID"
    @closed="onNewTxHashModalClosed">
    <Input
      placeholder="Pls enter the Cross Out TXID"
      input-class="bg-[#08090B]"
      v-model="newTxHash" />
    <div class="mt-7 flex gap-4">
      <Button class="flex-1" variant="outline" @click="closeNewTxHashModal">
        Cancel
      </Button>
      <Button class="flex-1" @click="handleAddTx" :loading="newTxLoading">
        Add
      </Button>
    </div>
  </Modal>
  <AddFeeModal v-model="showAddFeeModal" :tx="addFeeTx" @confirm="onAddFee" />
</template>

<script lang="ts" setup>
import { onMounted, ref, onUnmounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import nerveswap from 'nerveswap-sdk'
// @ts-ignore
import CollapseTransition from '@/components/CollapseTransition.vue'
import Modal from '@/components/Base/Modal/index.vue'
import Input from '@/components/Base/Input/index.vue'
import Button from '@/components/Base/Button/index.vue'
import AddFeeModal from './AddFeeModal.vue'
import { ETransfer } from '@/utils/api'
import {
  superLong,
  getCurrentAccount,
  isBeta,
  openExplorer,
  openL1Explorer
} from '@/utils/util'
import { useWalletStore } from '@/store/wallet'
import useToast from '@/hooks/useToast'
import { Account, TxInfo } from '@/store/types'
import { getTronTx, getTx, getFCHTx } from '@/service/api'
import storage from '@/utils/storage'

const walletStore = useWalletStore()
const {
  nerveAddress,
  currentAddress: address,
  showAddCrossTxID,
  addressInfo
} = storeToRefs(walletStore)

const { toastSuccess, toastError } = useToast()

const showAddFeeModal = ref(false)
const addFeeTx = ref<TxInfo>({} as TxInfo)

let isQuery = false,
  timer: number
onMounted(() => {
  timer = window.setInterval(() => {
    checkTxStatus()
  }, 5000)
  checkTxStatus()
})

onUnmounted(() => {
  clearInterval(timer)
})

const accountTxs = computed(() => {
  if (!addressInfo.value?.pub) return []
  const txs = addressInfo.value.txs || []
  return txs.sort((a, b) => (a.time > b.time ? -1 : 1))
})

const newTxHash = ref('')
const newTxLoading = ref(false)

async function checkTxStatus() {
  if (!address.value || !nerveAddress.value) return
  const account = getCurrentAccount(address.value)
  const txs: TxInfo[] = account?.txs
  if (accountTxs.value.length && !isQuery) {
    isQuery = true
    try {
      const pendingTx = txs.filter((v: TxInfo) => !v.status)
      if (pendingTx.length) {
        const newTxs = await pollingTx(pendingTx)
        newTxs.map(v => {
          if (!v.result) {
            txs.map(tx => {
              if (tx.hash === v.hash) {
                const retryCount = tx.retryCount || 0
                tx.retryCount = retryCount + 1
              }
            })
          } else {
            txs.map(tx => {
              if (tx.hash === v.hash) {
                tx.retryCount = 0
                tx.status = v.result.status
              }
            })
          }
        })
        /* const deleteItemIndex = txs.findIndex(v => v.retryCount === 20);
        if (deleteItemIndex !== -1) {
          txs.splice(deleteItemIndex, 1);
        } */
        const accountList: Account[] = storage.get('accountList') || []
        accountList.map(v => {
          const sameAddress = Object.values(v.address)
            .flat()
            .map((v: any) => v.toLowerCase())
            .includes(address.value?.toLowerCase())
          if (sameAddress) {
            v.txs = txs
          }
        })
        storage.set('accountList', accountList)

        const account = getCurrentAccount(address.value)
        walletStore.changeAccount(account)
      }
    } catch (e) {
      //
    }
    isQuery = false
  }
}

function openUrl(item: TxInfo) {
  if (item.L1Chain) {
    openL1Explorer(item.L1Chain, 'hash', item.hash)
  } else {
    openExplorer('hash', item.hash)
  }
}

async function pollingTx(txs: TxInfo[]) {
  const txsQuery = txs.map(v => {
    if (!v.L1Chain) {
      if (v.type === 43) {
        // 提现，目标链未确认前显示追加手续费按钮
        return handleWithdrawalTx(v)
      } else {
        return handleTx(v)
      }
    } else if (v.L1Chain === 'TRON') {
      return handleTronTx(v)
    } else if (v.L1Chain === 'BTC') {
      return handleBTCTx(v)
    } else if (v.L1Chain === 'FCH') {
      return handleFCHTx(v)
    } else if (v.L1Chain === 'BCH') {
      return handleBCHTx(v)
    } else if (v.L1Chain === 'TBC') {
      return handleTBCTx(v)
    } else {
      return handleEVMTx(v)
    }
  })
  const res = await Promise.all(txsQuery)
  return res
}

async function handleTx(tx: TxInfo) {
  const txState = { hash: tx.hash, result: null }
  const res = await getTx(tx.hash)
  if (res) {
    return { hash: tx.hash, result: res }
  }
  return txState
}

async function handleWithdrawalTx(tx: TxInfo) {
  const txState = { hash: tx.hash, result: null }
  const res = await getTx(tx.hash)
  if (res) {
    let status = 0
    if (res.txData?.state !== 'Unconfirmed') {
      status = 1
    }
    return { hash: tx.hash, result: { ...res, status } }
  } else {
    return txState
  }
}

async function handleTronTx(tx: TxInfo) {
  return {
    hash: tx.hash,
    result: await getTronTx(tx.hash)
  }
}

async function handleBTCTx(tx: TxInfo) {
  const isConfirmed = await nerveswap.btc.checkTxConfirmed(tx.hash, !isBeta)
  return {
    hash: tx.hash,
    result: {
      status: isConfirmed ? 1 : 0
    }
  }
}

async function handleFCHTx(tx: TxInfo) {
  const result = await getFCHTx(tx.hash)
  return {
    hash: tx.hash,
    result: {
      status: result?.[tx.hash]?.height > 0 ? 1 : 0
    }
  }
}

async function handleBCHTx(tx: TxInfo) {
  const result = await nerveswap.bch.getTx(tx.hash)
  return {
    hash: tx.hash,
    result: {
      status: result?.state === 'success' ? 1 : 0
    }
  }
}
async function handleTBCTx(tx: TxInfo) {
  const result = await nerveswap.tbc.getTx(tx.hash)
  // console.log(result, '0-0-0-0-');
  return {
    hash: tx.hash,
    result: {
      status: result.blockhash ? 1 : 0
    }
  }
}

async function handleEVMTx(tx: TxInfo) {
  const transfer = new ETransfer(tx.L1Chain)
  return {
    hash: tx.hash,
    result: await transfer.provider.getTransactionReceipt(tx.hash)
  }
}

const handleAddTx = async () => {
  const exist = accountTxs.value.find(v => v.hash === newTxHash.value)
  if (exist) {
    toastError('Transaction Hash exist')
    newTxHash.value = ''
    return
  }
  newTxLoading.value = true
  const tx = await getTx(newTxHash.value)
  if (tx && tx.type === 43 && tx.txData?.address === nerveAddress.value) {
    addNewHash({
      hash: tx.hash,
      time: tx.createTime * 1000,
      status: tx.status === 1 && tx.txData.state !== 'Unconfirmed' ? 1 : 0,
      type: 43,
      hId: tx.txData.heterogeneousChainId,
      amountRemark: ''
    })
    toastSuccess('Success')
    closeNewTxHashModal()
  } else {
    toastError('Invalid Withdrawal Hash')
  }
  newTxLoading.value = false
}

async function addNewHash(tx: TxInfo) {
  const account = getCurrentAccount(address.value)
  const txs = (account?.txs || []).concat(tx)

  const accountList: Account[] = storage.get('accountList') || []
  accountList.map(v => {
    const sameAddress = Object.values(v.address)
      .flat()
      .map((v: any) => v.toLowerCase())
      .includes(address.value?.toLowerCase())
    if (sameAddress) {
      v.txs = txs
    }
  })
  storage.set('accountList', accountList)

  updateAccountInfo()
}

const closeNewTxHashModal = () => {
  showAddCrossTxID.value = false
}

const onNewTxHashModalClosed = () => {
  newTxHash.value = ''
  newTxLoading.value = false
}

const handleShowAddFee = (tx: TxInfo) => {
  showAddFeeModal.value = true
  addFeeTx.value = tx
}

const onAddFee= () => {
  showAddFeeModal.value = false
  addFeeTx.value = {} as TxInfo
  updateAccountInfo()
}
const updateAccountInfo = () => {
  const account = getCurrentAccount(address.value)
  walletStore.changeAccount(account)
}
</script>
