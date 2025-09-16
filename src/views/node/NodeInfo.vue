<template>
  <div class="card-wrapper mb-6">
    <div class="flex items-center justify-between border-b border-line pb-3">
      <div>
        <span class="uppercase text-lg">ID: {{ nodeInfo.agentId }}</span>
        <template v-if="props.address === nodeInfo.agentAddress">
          &nbsp;|&nbsp;
          <span class="cursor-pointer text-error" style="color: #f1313c" @click="stopNode">
            {{ $t('nodeDetail.nodeDetail1') }}
          </span>
        </template>
      </div>
      <div>
        <span class="cursor-pointer text-primary underline underline-offset-4" @click="openExplorer('consensus', '')">
          {{ $t('nodeDetail.nodeDetail2') }}
        </span>
        &nbsp;|&nbsp;
        <span :class="[nodeInfo.status === 1 ? 'text-[#4ade5f]' : 'text-[]']">
          {{
            nodeInfo.status === 1
              ? $t('nodeDetail.nodeDetail3')
              : $t('nodeDetail.nodeDetail4')
          }}
        </span>
      </div>
    </div>
    <div class="flex xl:gap-6 flex-wrap">
      <div class="w-full xl:flex-1">
        <div class="flex justify-between items-center py-2.5 px-3">
          <span class="text-label">{{ $t('createNode.createNode5') }}</span>
          <span>
            {{ nodeInfo.deposit }} NVT
          </span>
        </div>
        <div class="flex justify-between items-center py-2.5 bg-card2 px-3">
          <span class="text-label">{{ $t('nodeDetail.nodeDetail5') }}</span>
          <span>
            {{ nodeInfo.reward }} NVT
          </span>
        </div>
        <div class="flex justify-between items-center py-2.5 px-3">
          <span class="text-label">{{ $t('nodeDetail.nodeDetail6') }}</span>
          <span>
            {{ nodeInfo.interestRate }}%
          </span>
        </div>
        <div class="flex justify-between items-center py-2.5 bg-card2 px-3">
          <span class="text-label">{{ $t('nodeDetail.nodeDetail7') }}</span>
          <span>
            {{ nodeInfo.creditValue }}
          </span>
        </div>
        <div class="flex justify-between items-center py-2.5 px-3">
          <span class="text-label">{{ $t('nodeDetail.nodeDetail9') }}</span>
          <label class="cursor-pointer text-primary underline underline-offset-2">
            <span @click="openExplorer('consensusInfo', nodeInfo.txHash)">
              {{ nodeInfo.yellowCardCount }}
              {{ $t('nodeDetail.nodeDetail12') }}
            </span>
          </label>
        </div>
        <div class="flex justify-between items-center py-2.5 bg-card2 px-3">
          <span class="text-label">{{ $t('nodeDetail.nodeDetail11') }}</span>
          <span>
            {{ nodeInfo.agentAlias ? nodeInfo.agentAlias : '-' }}
          </span>
        </div>
      </div>
      <div class="w-full xl:flex-1">
        <div class="flex justify-between items-center py-2.5 px-3">
          <span class="text-label">{{ $t('createNode.createNode2') }}</span>
          <Link :label="superLong(nodeInfo.agentAddress)" @click="openExplorer('address', nodeInfo.agentAddress)" />
        </div>

        <div class="flex justify-between items-center py-2.5 bg-card2 px-3">
          <span class="text-label">{{ $t('createNode.createNode3') }}</span>
          <Link :label="superLong(nodeInfo.rewardAddress)" @click="openExplorer('address', nodeInfo.rewardAddress)" />
        </div>

        <div class="flex justify-between items-center py-2.5 px-3">
          <span class="text-label">{{ $t('createNode.createNode4') }}</span>
          <Link :label="superLong(nodeInfo.packingAddress)" @click="openExplorer('address', nodeInfo.packingAddress)" />
        </div>

        <div class="flex justify-between items-center py-2.5 bg-card2 px-3">
          <span class="text-label">{{ $t('nodeDetail.nodeDetail8') }}</span>
          <span>
            {{ judgeNodeType(nodeInfo.bankNode, nodeInfo.status) }}
          </span>
        </div>

        <div class="flex justify-between items-center py-2.5 px-3">
          <span class="text-label">{{ $t('nodeDetail.nodeDetail10') }}</span>
          <span>
            {{ nodeInfo.createTime }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Link from '@/components/Link.vue';
import { NodeInfo } from '@/views/node/types';
import { useI18n } from 'vue-i18n';
import { openExplorer, superLong } from '@/utils/util';

const props = defineProps<{
  address: string;
  nodeInfo: NodeInfo;
}>();
const emit = defineEmits(['stopNode']);

const { t } = useI18n();

//判断节点类型
function judgeNodeType(bankNode: boolean, isConsensus: number) {
  if (bankNode) {
    return t('nodeStatus.2');
  } else if (isConsensus) {
    return t('nodeStatus.1');
  } else {
    return t('nodeStatus.3');
  }
}

// 注销节点
function stopNode() {
  emit('stopNode');
}
</script>
