<template>
  <el-table :data="props.data">
    <!--<el-table-column width="30">
    </el-table-column>-->
    <el-table-column
      prop="blockHeight"
      :label="$t('public.public20')"
      width="180"
    ></el-table-column>
    <el-table-column label="TXID" min-width="160">
      <template v-slot="scope">
        <Link @click="openExplorer('hash', scope.row.txHash)" :label="superLong(scope.row.txHash, 12)" />
      </template>
    </el-table-column>
    <el-table-column
      prop="amount"
      :label="$t('createNode.createNode5') + ' (NVT)'"
      width="180"
    >
    <template v-slot="scope">
      <span>{{ toThousands(scope.row.amount) }}</span>
    </template>
  </el-table-column>
    <el-table-column
      prop="createTime"
      :label="$t('public.public21')"
      width="200"
    ></el-table-column>
    <el-table-column :label="$t('public.public22')" width="160">
      <template v-slot="scope">
        <span>{{ $t('nodeType.' + scope.row.type) }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import Link from '@/components/Link.vue';
import { openExplorer, superLong, toThousands } from '@/utils/util';
import { RecordItem } from '@/views/node/types';

const props = defineProps<{
  data: RecordItem[];
}>();
</script>
