<template>
  <div class="farm-details">
    <div class="pc-cont">
      <div class="getLp">
        <p
          class="link"
          @click="toAddLiquidity"
          v-if="isNerve && tokenInfo.stakeTokenSymbol"
        >
          {{ $t('farm.farm7') + ' ' + tokenInfo.stakeTokenSymbol }}
          <i class=""></i>
        </p>
        <!--        <p class="click">
          {{ $t("farm.farm8") }}
          <i class=""></i>
        </p>-->
      </div>
      <div class="biaoge">
        <div class="gain">
          <div class="left">
            <div class="info-title">
              {{ tokenInfo.syrupTokenSymbol }}{{ $t('farm.farm2') }}
            </div>
            <!--  添加key 解决必须鼠标移上去才会变更数值问题          -->
            <el-tooltip placement="top" :key="tokenInfo.pendingReward">
              <template #content>
                {{ $thousands(tokenInfo.pendingReward) }}
              </template>
              <p class="ellipsis">{{ $thousands(tokenInfo.pendingReward) }}</p>
            </el-tooltip>
            <!--            <p class="ellipsis">{{ $thousands(tokenInfo.pendingReward) }}</p>-->
            <span>≈${{ $thousands(tokenInfo.pendingRewardUSD) }}</span>
          </div>
          <div class="right">
            <el-button
              class="btns"
              type="primary"
              size="small"
              @click="gether"
              :disabled="!Number(tokenInfo.pendingReward) || !nerveAddress"
            >
              {{ $t('farm.farm21') }}
            </el-button>
          </div>
        </div>
        <div class="alter">
          <div class="left">
            <div class="info-title">{{ $t('farm.farm9') }}</div>
            <el-tooltip placement="top" :key="tokenInfo.stakeAmount">
              <template #content>
                {{ $thousands(tokenInfo.stakeAmount) }}
              </template>
              <p class="ellipsis">{{ $thousands(tokenInfo.stakeAmount) }}</p>
            </el-tooltip>
            <!--            <p class="ellipsis">{{ $thousands(tokenInfo.stakeAmount) }}</p>-->
            <span>≈${{ $thousands(tokenInfo.stakeUSD) }}</span>
          </div>
          <div class="right">
            <template v-if="needAuth">
              <el-button
                class="btns auth-btn"
                type="primary"
                size="small"
                @click="authToken"
              >
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
                @click="handleLP(LpDialogType.Minus)"
              >
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
                @click="handleLP(LpDialogType.Add)"
              >
                <el-icon><plus /></el-icon>
              </el-button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="mobile-cont">
      <div class="option-cont">
        <div class="text-90">
          {{ tokenInfo.syrupTokenSymbol }}{{ $t('farm.farm2') }}
        </div>
        <div class="d-flex align-items-center space-between">
          <div class="count-cont">
            {{ $thousands(tokenInfo.pendingReward) }}
            <br />
            <span>≈${{ $thousands(tokenInfo.pendingRewardUSD) }}</span>
          </div>
          <div
            class="btn"
            @click="gether"
            :class="{
              btn_disabled: !!!Number(tokenInfo.pendingReward) || !nerveAddress
            }"
          >
            {{ $t('farm.farm21') }}
          </div>
        </div>
      </div>
      <div class="option-cont mt-15">
        <div class="text-90">{{ $t('farm.farm9') }}</div>
        <div class="d-flex align-items-center space-between mt-15">
          <div class="count-cont">{{ $thousands(tokenInfo.stakeAmount) }}</div>
          <div class="btn-group">
            <template v-if="needAuth">
              <el-button
                class="btns auth-btn"
                type="primary"
                size="small"
                @click="authToken"
              >
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
                @click="handleLP(LpDialogType.Minus)"
              >
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
                @click="handleLP(LpDialogType.Add)"
              >
                <el-icon><plus /></el-icon>
              </el-button>
            </template>
          </div>
        </div>
      </div>
      <div class="d-flex align-items-center space-between mt-8 size-14">
        <span>{{ $t('farm.farm4') }}</span>
        <span>
          {{
            Number(tokenInfo.tatalStakeTokenUSD)
              ? '$' + $thousands(tokenInfo.tatalStakeTokenUSD)
              : '--'
          }}
        </span>
      </div>
      <!--      <div class="d-flex align-items-center space-between mt-8 size-14">
        <span>{{ $t('farm.farm5') }}</span>
        <span>
          {{ $thousands(tokenInfo.rewardBalance) }}
          {{ tokenInfo.syrupTokenSymbol }}
        </span>
      </div>-->
      <div
        class="link mt-8"
        @click="toAddLiquidity"
        v-if="isNerve && tokenInfo.stakeTokenSymbol"
      >
        {{ $t('farm.farm7') + ' ' + tokenInfo.stakeTokenSymbol }}
      </div>
    </div>
    <lp-dialog
      v-model:show="dialogAddOrMinus"
      :loading="loading"
      :balance="balance"
      :addOrMinus="addOrMinus"
      :lpName="tokenInfo.stakeTokenSymbol"
      :decimal="tokenInfo.stakeTokenDecimals"
      @confirm="confirmAddOrMinus"
    ></lp-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import LpDialog from './LpDialog.vue';
import { txAbi } from '@/contractConfig/contractConfig';
import useContractAddress from '@/views/farm/hooks/useContractAddress';
import useStoreState from '@/hooks/useStoreState';
import useToast from '@/hooks/useToast';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';
import { ethers } from 'ethers';
import { getAssetBalance } from '@/service/api';
import nerve from 'nerve-sdk-js';
import { ETransfer } from '@/utils/api';
import { timesDecimals, divisionDecimals } from '@/utils/util';
import config from '@/config';
import nerveswap from 'nerveswap-sdk';

import { UniFarmItem, NerveFarmItem, LpOperate, LpDialogType } from './types';

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
});

const emit = defineEmits(['loading']);

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { toastSuccess, toastError } = useToast();
const dialogAddOrMinus = ref(false);
const addOrMinus = ref<LpDialogType>(LpDialogType.Add);
const loading = ref(false);
const needAuth = ref(true);
const refreshAuth = ref(false);
const { currentAccount } = useStoreState();
const balance = ref('0');
const contractAddress = useContractAddress().value;

const { handleResult, getWalletInfo } = useBroadcastNerveHex();

onMounted(() => {
  // console.log(props.tokenInfo, 9696);
  getERC20Allowance();
});
async function getERC20Allowance() {
  if (props.isNerve) {
    needAuth.value = false;
  } else {
    const transfer = new ETransfer();
    const tokenInfo = props.tokenInfo as UniFarmItem;
    needAuth.value = await transfer.getERC20Allowance(
      tokenInfo.lpToken,
      contractAddress,
      currentAccount.value?.address?.EVM
    );
    if (!needAuth.value) {
      refreshAuth.value = false;
    }
    if (refreshAuth.value) {
      setTimeout(() => {
        getERC20Allowance();
      }, 5000);
    }
  }
}

// 授权token
async function authToken() {
  emit('loading', true);
  try {
    const transfer = new ETransfer();
    const tokenInfo = props.tokenInfo as UniFarmItem;
    const res = await transfer.approveERC20(
      tokenInfo.lpToken,
      contractAddress,
      currentAccount.value?.address?.EVM
    );
    if (res.hash) {
      toastSuccess(t('transfer.transfer14'));
      refreshAuth.value = true;
      getERC20Allowance();
    } else {
      toastError(res);
    }
  } catch (e) {
    toastError(e);
  }
  emit('loading', false);
}

// claim
async function gether() {
  emit('loading', true);
  if (props.isNerve) {
    await farmStake('0');
  } else {
    await LPOperation(LpOperate.Claim, '0');
  }
  emit('loading', false);
}

// 收取收益(number = 0) / 增加LP
async function farmStake(number: string) {
  try {
    const { provider, pub, EVMAddress } = getWalletInfo();
    const tokenInfo = props.tokenInfo as NerveFarmItem;
    const { stakeTokenChainId, stakeTokenAssetId, stakeTokenDecimals } =
      tokenInfo;
    const farmHash = props.tokenInfo.farmHash || route.params?.hash;
    const amount = timesDecimals(number, stakeTokenDecimals);
    // const tx = await nerve.swap.farmStake(
    //   currentAccount.value?.address?.NERVE,
    //   nerve.swap.token(stakeTokenChainId, stakeTokenAssetId),
    //   config.chainId,
    //   config.prefix,
    //   amount,
    //   farmHash,
    //   ''
    // );
    // await handleHex(tx.hex, 66);
    let result;
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
      });
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
      });
    }
    handleResult(66, result);
    if (result.hash) {
      dialogAddOrMinus.value = false;
    }
  } catch (e) {
    // console.log(e, "gain-profit-error");
    toastError(e);
  }
}

// 添加/退出lp弹窗
async function handleLP(type: string) {
  console.log(type, 9966333, props.tokenInfo);
  if (type === LpDialogType.Add) {
    dialogAddOrMinus.value = true;
    addOrMinus.value = LpDialogType.Add;
    getBalance();
  } else {
    dialogAddOrMinus.value = true;
    addOrMinus.value = LpDialogType.Minus;
    balance.value = props.tokenInfo.stakeAmount;
  }
}

async function getBalance() {
  balance.value = '';
  if (props.isNerve) {
    const tokenInfo = props.tokenInfo as NerveFarmItem;
    const { stakeTokenChainId, stakeTokenAssetId, stakeTokenDecimals } =
      tokenInfo;
    const res: any = await getAssetBalance(
      stakeTokenChainId,
      stakeTokenAssetId,
      currentAccount.value?.address?.NERVE
    );
    balance.value = divisionDecimals(res.balanceStr, stakeTokenDecimals);
  } else {
    const transfer = new ETransfer();
    const tokenInfo = props.tokenInfo as UniFarmItem;
    const contractAddress = tokenInfo.lpToken;
    const address = currentAccount.value?.address?.EVM;
    if (contractAddress) {
      const decimal = tokenInfo.stakeTokenDecimals;
      balance.value = await transfer.getERC20Balance(
        contractAddress,
        Number(decimal),
        address
      );
    } else {
      balance.value = await transfer.getEthBalance(address);
    }
  }
}

// 添加 / 退出farm
async function confirmAddOrMinus(amount: string) {
  if (addOrMinus.value === LpDialogType.Add) {
    loading.value = true;
    if (props.isNerve) {
      await farmStake(amount);
    } else {
      await LPOperation(LpOperate.Add, amount);
    }
    loading.value = false;
  } else {
    // farmWithdraw
    loading.value = true;
    if (props.isNerve) {
      await farmWithdrawal(amount);
    } else {
      await LPOperation(LpOperate.Remove, amount);
    }
    loading.value = false;
  }
}

// 退出质押
async function farmWithdrawal(number: string) {
  const { provider, pub, EVMAddress } = getWalletInfo();
  const tokenInfo = props.tokenInfo as NerveFarmItem;
  try {
    const {
      stakeTokenChainId,
      stakeTokenAssetId,
      stakeTokenDecimals,
      farmHash
    } = tokenInfo;
    const amount = timesDecimals(number, stakeTokenDecimals);
    /* const tx = await nerve.swap.farmWithdraw(
      currentAccount.value?.address?.NERVE,
      nerve.swap.token(stakeTokenChainId, stakeTokenAssetId),
      // config.chainId,
      // config.prefix,
      amount,
      farmHash,
      ''
    );
    await handleHex(tx.hex, 67); */
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
    });
    handleResult(67, result);
    if (result.hash) {
      dialogAddOrMinus.value = false;
    }
  } catch (e) {
    // console.log(e, "gain-profit-error");
    toastError(e);
  }
}

// evm 添加 - Add、减少 - Remove lp, 领取收益 -Claim
async function LPOperation(type: LpOperate, value: string) {
  try {
    const transfer = new ETransfer();
    const { stakeTokenDecimals } = props.tokenInfo;
    const wallet = transfer.provider.getSigner();
    const contracts = new ethers.Contract(contractAddress, txAbi, wallet);
    let res;
    const amount = timesDecimals(value, stakeTokenDecimals);
    // console.log(amount, 9595);
    const pid = props.tokenInfo.farmHash;
    if (type === LpOperate.Add) {
      // console.log(props.tokenInfo.farmHash, 999888)
      res = await contracts.deposit(pid, amount);
    } else if (type === LpOperate.Remove) {
      res = await contracts.withdraw(pid, amount);
    } else {
      res = await contracts.deposit(pid, amount);
    }
    if (res.hash) {
      toastSuccess(t('transfer.transfer14'));
      dialogAddOrMinus.value = false;
    } else {
      toastError(res);
    }
  } catch (e) {
    // console.error(e, 6666)
    toastError(e);
  }
}

// nerve 签名hash&广播hex
/* async function handleHex(hex: string, type: number) {
  const result: any = await handleNerveHex(hex, type);
  if (result && result.hash) {
    dialogAddOrMinus.value = false;
  }
} */

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
  } = props.tokenInfo as NerveFarmItem;
  let url;
  if (swapPairAddress) {
    url = `/liquidity/${lpPairAssetAChainId}-${lpPairAssetAAssetId}/${lpPairAssetBChainId}-${lpPairAssetBAssetId}`;
  } else {
    const { chainId, assetId, NULSConfig } = config;
    if (stakeTokenChainId === chainId && stakeTokenAssetId === assetId) {
      // 兑换资产为NVT， 使用NULS兑换
      const NULSInfo = NULSConfig.chainId + '-' + NULSConfig.assetId;
      url = `/swap/${NULSInfo}/${stakeTokenChainId}-${stakeTokenAssetId}`;
    } else {
      const nvtInfo = chainId + '-' + assetId;
      url = `/swap/${nvtInfo}/${stakeTokenChainId}-${stakeTokenAssetId}`;
    }
  }
  router.push(url);
}
</script>

<style lang="scss">
@import '../../assets/css/style.scss';
.mobile-cont {
  display: none;
  width: 100%;
  .option-cont {
    padding: 20px 20px 18px 18px;
    //border: 1px solid #aab2c9;
    border-radius: 10px;
    background-color: #fff;
    border: 1px solid #e4efff;
    .count-cont {
      //font-weight: bold;
      font-size: 20px;
      width: 160px;
      word-break: break-all;
      span {
        font-size: 14px;
        //font-weight: bold;
        color: #858fb1;
      }
    }
    .btn {
      height: 36px;
      width: 80px;
      background-color: $btnColor;
      line-height: 36px;
      text-align: center;
      font-size: 15px;
      border-radius: 10px;
      color: #fff;
    }
    .btn-group {
      white-space: nowrap;
    }
    .el-button.el-button--primary {
      min-height: 36px;
      padding: 8px 18px;
    }
  }
  .mt-8 {
    margin-top: 8px;
  }
}
.farm-details {
  /* height: 148px; */
  background-color: #fafcff;
  border-bottom: 1px solid #e4e9f4;
  .pc-cont {
    padding: 20px 40px 20px 30px;
    //border-bottom: 1px solid #e4efff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .getLp {
      width: 200px;
      p {
        line-height: 24px;
        margin-top: 8px;
        //cursor: not-allowed;
        &:first-child {
          margin: 0;
        }
      }
    }
    .biaoge {
      flex: 1;
      display: flex;
      .gain,
      .alter {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-left: 60px;
        height: 108px;
        padding: 20px;
        background: #fff;
        border: 1px solid #e4efff;
        border-radius: 10px;
        .left {
          max-width: 200px;
          .info-title {
            font-size: 14px;
            margin-bottom: 5px;
            color: $labelColor;
          }
          p {
            font-size: 20px;
            //font-weight: bold;
          }
          span {
            font-size: 14px;
            //font-weight: bold;
            color: #858fb1;
          }
        }
        .btns {
          width: 90px;
          height: 38px;
          //background: #4a5ef2;
          border-radius: 6px;
        }
      }
      .alter {
        .right {
          min-width: 145px;
        }
        .btns {
          width: 65px;
          margin-left: 15px;
          &:first-child {
            margin-left: 0;
          }
          &.auth-btn {
            width: 100px;
          }
          i {
            font-size: 20px;
          }
        }
      }
    }
  }
  .el-overlay {
    z-index: 1888 !important;
  }
}
.btn_disabled {
  background-color: #a0cfff !important;
  cursor: not-allowed;
}

@media screen and (max-width: 1200px) {
  .farm-details {
    padding: 20px 15px;
  }
  .gain {
    margin-left: 0;
    margin-top: 20px;
    width: 264px;
  }
  .alter {
    margin-left: 0;
    margin-top: 20px;
    width: 264px;
  }
  .info-title {
    width: 120px;
  }
}
@media screen and (max-width: 1100px) {
  .farm-details .pc-cont .biaoge .gain .left,
  .farm-details .pc-cont .biaoge .alter .left {
    max-width: 170px;
  }
}
@media screen and (max-width: 850px) {
  .farm-details {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-between;
    .biaoge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: column;
      .gain {
        margin-left: 0;
        margin-top: 20px;
        width: 280px;
      }
      .alter {
        margin-left: 0;
        margin-top: 20px;
        width: 280px;
        //.right {
        //  width: 180px !important;
        //}
        .btns {
          margin-bottom: 10px;
        }
      }
    }
  }
  .farm-item .more {
    margin-top: 15px;
  }
}
@media screen and (max-width: 1024px) {
  .pc-cont {
    display: none !important;
  }
  .mobile-cont {
    display: block;
  }
}
.text-90 {
  color: $labelColor;
  font-size: 14px;
}
</style>
