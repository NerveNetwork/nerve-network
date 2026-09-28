<template>
  <div class="refund-page w1200 card-wrapper">
    <h2 class="mb-4 text-lg font-semibold md:text-xl">Nerve 归还工单查询</h2>
    <form class="toolbar" @submit.prevent="search">
      <label class="field">
        <span>Nerve 地址</span>
        <input v-model="qAddress" placeholder="锁箱转入发送方" autocomplete="off" />
      </label>
      <label class="field">
        <span>Nerve hash</span>
        <input v-model="qHash" placeholder="转入 hash 或关单 hash" autocomplete="off" />
      </label>
      <label class="field narrow">
        <span>状态</span>
        <select v-model="filterStatus">
          <option value="">全部</option>
          <option value="PENDING">待审</option>
          <option value="PROCESSING">处理中</option>
          <option value="PAID">已付</option>
          <option value="REJECTED">驳回</option>
        </select>
      </label>
      <div class="toolbar-actions">
        <button type="submit" class="btn" :disabled="loading">查询</button>
        <button type="button" class="btn secondary" :disabled="loading" @click="reset">重置</button>
      </div>
    </form>
    <p v-if="error" class="error mb-3">{{ error }}</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>状态</th>
            <th>资产</th>
            <th>目标网络</th>
            <th>金额</th>
            <th>发送方</th>
            <th>Nerve hash</th>
            <th>收款</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="empty">加载中...</td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="9" class="empty">无匹配工单</td>
          </tr>
          <template v-else>
            <tr v-for="t in rows" :key="t.id">
              <td>{{ t.id }}</td>
              <td><span class="status" :class="statusClass(t.status)">{{ t.status }}</span></td>
              <td>
                {{ t.symbol || '-' }}
                <div class="muted nowrap">{{ t.assetKey || t.assetChainId + '-' + t.assetId }}</div>
              </td>
              <td class="nowrap">{{ payoutChainLabel(t) }}</td>
              <td>{{ t.amountDisplay || t.amount }}</td>
              <td class="mono">{{ t.fromAddress }}</td>
              <td class="mono">{{ t.nerveTxHash }}</td>
              <td class="mono nowrap">{{ t.payoutAddress || '' }}</td>
              <td><button class="btn" @click="openDetail(t.id)">打开</button></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="current" class="modal-backdrop" @click.self="current = null">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>
            工单 #{{ current.id }}
            <span class="status" :class="statusClass(current.status)">{{ current.status }}</span>
          </h3>
          <button class="btn secondary" @click="current = null">关闭</button>
        </div>
        <dl class="kv">
          <div>
            <dt>Nerve hash</dt>
            <dd class="mono">{{ current.nerveTxHash }}</dd>
          </div>
          <div>
            <dt>Nerve 资产</dt>
            <dd class="inline-gap">
              <span>{{ current.symbol || '-' }}</span>
              <span class="mono">{{ current.assetKey }}</span>
              <span class="muted">{{ current.assetChainName }}</span>
              <span>金额 {{ current.amountDisplay || current.amount }}</span>
            </dd>
          </div>
          <div>
            <dt>手续费 / 实际回款</dt>
            <dd>
              手续费 {{ current.feeRatePercent || 0 }}%
              <span class="muted">扣除 {{ current.feeAmountDisplay || '0' }}</span>
              <br />
              实际应回款 {{ current.netAmountDisplay || current.amountDisplay || current.amount }}
            </dd>
          </div>
          <div>
            <dt>交易时间</dt>
            <dd>{{ formatDateTime(current.txTime) }}</dd>
          </div>
          <div>
            <dt>发送方</dt>
            <dd class="mono">{{ current.fromAddress }}</dd>
          </div>
          <div>
            <dt>目标网络</dt>
            <dd>{{ payoutChainLabel(current) }}</dd>
          </div>
          <div>
            <dt>回款 token</dt>
            <dd>
              {{ current.payoutTokenSymbol || current.symbol || '-' }}
              精度 {{ current.payoutTokenDecimals ?? current.decimals ?? '-' }}
              <br />
              <span class="mono">{{ current.payoutTokenAddress || '原生资产（无合约）' }}</span>
            </dd>
          </div>
          <div>
            <dt>收款</dt>
            <dd class="mono">{{ current.payoutAddress || '-' }}</dd>
          </div>
          <div v-if="current.payoutTxHash">
            <dt>归还交易 hash</dt>
            <dd class="mono">{{ current.payoutTxHash }}</dd>
          </div>
          <div v-if="current.busTxHash">
            <dt>Nerve 关单交易</dt>
            <dd class="mono">{{ current.busTxHash }}</dd>
          </div>
        </dl>
        <p v-if="current.noRoute" class="error mt-3">无映射，暂不能处理</p>
        <p v-if="current.rejectReason" class="mt-3">驳回原因：{{ current.rejectReason }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import {
  getRefundTicket,
  getRefundTickets,
  IRefundTicket
} from '@/service/api/refund';

const qAddress = ref('');
const qHash = ref('');
const filterStatus = ref('');
const tickets = ref<IRefundTicket[]>([]);
const current = ref<IRefundTicket | null>(null);
const loading = ref(false);
const error = ref('');

const rows = computed(() =>
  filterStatus.value
    ? tickets.value.filter(t => t.status === filterStatus.value)
    : tickets.value
);

onMounted(search);

async function search() {
  loading.value = true;
  error.value = '';
  try {
    tickets.value = await getRefundTickets(qAddress.value, qHash.value);
  } catch (e) {
    tickets.value = [];
    error.value = (e as Error).message || '查询失败';
  } finally {
    loading.value = false;
  }
}

function reset() {
  qAddress.value = '';
  qHash.value = '';
  filterStatus.value = '';
  search();
}

async function openDetail(id: number) {
  error.value = '';
  try {
    current.value = await getRefundTicket(id);
  } catch (e) {
    error.value = (e as Error).message || '查询失败';
  }
}

function statusClass(status: string) {
  return 'status-' + String(status || 'unknown').toLowerCase();
}

function payoutChainLabel(t: IRefundTicket) {
  if (t.payoutHtgChainLabel) return t.payoutHtgChainLabel;
  if (!t.payoutHtgChainId) return '-';
  return `${t.payoutHtgChainName || ''} (${t.payoutHtgChainId})`.trim();
}

function formatDateTime(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
    ' ' +
    [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':')
  );
}
</script>

<style lang="scss" scoped>
.refund-page {
  margin-top: 24px;
  margin-bottom: 24px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px 16px;
  margin-bottom: 16px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 220px;
  font-size: 12px;
  color: var(--colors-label);
  input,
  select {
    height: 36px;
    padding: 0 10px;
    border: 1px solid var(--colors-line);
    border-radius: 8px;
    background: var(--colors-input);
    color: var(--colors-text);
    font-size: 13px;
    outline: none;
    &:focus {
      border-color: var(--colors-primary);
    }
  }
  &.narrow {
    flex: 0 1 140px;
  }
}
.toolbar-actions {
  display: flex;
  gap: 8px;
}
.btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 8px;
  background: var(--colors-btn-primary);
  color: #fff;
  font-size: 13px;
  white-space: nowrap;
  &.secondary {
    background: var(--colors-card2);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  th,
  td {
    padding: 10px 8px;
    border-bottom: 1px solid var(--colors-line);
    text-align: left;
    vertical-align: middle;
  }
  th {
    color: var(--colors-label);
    font-weight: 600;
    white-space: nowrap;
  }
}
.empty {
  text-align: center !important;
  color: var(--colors-label);
  padding: 32px 0 !important;
}
.muted {
  color: var(--colors-label);
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  word-break: break-all;
}
.nowrap {
  white-space: nowrap;
  word-break: normal;
}
.inline-gap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
}
.error {
  color: var(--colors-error);
}
.status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid currentColor;
  font-size: 11px;
  font-weight: 700;
  &.status-pending {
    color: var(--colors-tip);
  }
  &.status-processing {
    color: var(--colors-primary);
  }
  &.status-paid {
    color: var(--colors-up);
  }
  &.status-rejected {
    color: var(--colors-down);
  }
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--colors-mask);
}
.modal {
  width: 720px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 12px;
  background: var(--colors-card);
  border: 1px solid var(--colors-line);
}
.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
  }
}
.kv {
  display: grid;
  gap: 12px;
  font-size: 13px;
  > div {
    display: grid;
    grid-template-columns: 130px 1fr;
    gap: 12px;
  }
  dt {
    color: var(--colors-label);
  }
}
@media screen and (max-width: 640px) {
  .kv > div {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
