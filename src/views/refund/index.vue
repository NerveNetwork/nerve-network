<template>
  <div class="refund-page w1200 card-wrapper">
    <h2 class="mb-4 text-lg font-semibold md:text-xl">Nerve Refund Tickets</h2>
    <form class="toolbar" @submit.prevent="search">
      <label class="field">
        <span>Nerve Address</span>
        <input v-model="qAddress" placeholder="Sender address of the lockbox transfer" autocomplete="off" />
      </label>
      <label class="field">
        <span>Nerve Hash</span>
        <input v-model="qHash" placeholder="Transfer hash or closing hash" autocomplete="off" />
      </label>
      <label class="field narrow">
        <span>Status</span>
        <select v-model="filterStatus">
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="PAID">Paid</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </label>
      <div class="toolbar-actions">
        <button type="submit" class="btn" :disabled="loading">Search</button>
        <button type="button" class="btn secondary" :disabled="loading" @click="reset">Reset</button>
      </div>
    </form>
    <p v-if="error" class="error mb-3">{{ error }}</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Asset</th>
            <th>Target Network</th>
            <th>Amount</th>
            <th>Sender</th>
            <th>Nerve Hash</th>
            <th>Recipient</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="empty">Loading...</td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="9" class="empty">No matching tickets</td>
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
              <td><button class="btn" @click="openDetail(t.id)">View</button></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="current" class="modal-backdrop" @click.self="current = null">
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>
            Ticket #{{ current.id }}
            <span class="status" :class="statusClass(current.status)">{{ current.status }}</span>
          </h3>
          <button class="btn secondary" @click="current = null">Close</button>
        </div>
        <dl class="kv">
          <div>
            <dt>Nerve Hash</dt>
            <dd class="mono">{{ current.nerveTxHash }}</dd>
          </div>
          <div>
            <dt>Nerve Asset</dt>
            <dd class="inline-gap">
              <span>{{ current.symbol || '-' }}</span>
              <span class="mono">{{ current.assetKey }}</span>
              <span class="muted">{{ current.assetChainName }}</span>
              <span>Amount {{ current.amountDisplay || current.amount }}</span>
            </dd>
          </div>
          <div>
            <dt>Fee / Net Refund</dt>
            <dd>
              Fee {{ current.feeRatePercent || 0 }}%
              <span class="muted">Deducted {{ current.feeAmountDisplay || '0' }}</span>
              <br />
              Net refund {{ current.netAmountDisplay || current.amountDisplay || current.amount }}
            </dd>
          </div>
          <div>
            <dt>Transaction Time</dt>
            <dd>{{ formatDateTime(current.txTime) }}</dd>
          </div>
          <div>
            <dt>Sender</dt>
            <dd class="mono">{{ current.fromAddress }}</dd>
          </div>
          <div>
            <dt>Target Network</dt>
            <dd>{{ payoutChainLabel(current) }}</dd>
          </div>
          <div>
            <dt>Refund Token</dt>
            <dd>
              {{ current.payoutTokenSymbol || current.symbol || '-' }}
              Decimals {{ current.payoutTokenDecimals ?? current.decimals ?? '-' }}
              <br />
              <span class="mono">{{ current.payoutTokenAddress || 'Native asset (no contract)' }}</span>
            </dd>
          </div>
          <div>
            <dt>Recipient</dt>
            <dd class="mono">{{ current.payoutAddress || '-' }}</dd>
          </div>
          <div v-if="current.payoutTxHash">
            <dt>Refund Tx Hash</dt>
            <dd class="mono">{{ current.payoutTxHash }}</dd>
          </div>
          <div v-if="current.busTxHash">
            <dt>Nerve Closing Tx</dt>
            <dd class="mono">{{ current.busTxHash }}</dd>
          </div>
        </dl>
        <p v-if="current.noRoute" class="error mt-3">No asset route configured; this ticket cannot be processed yet</p>
        <p v-if="current.rejectReason" class="mt-3">Reject reason: {{ current.rejectReason }}</p>
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
    error.value = errorText(e);
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
    error.value = errorText(e);
  }
}

function errorText(e: unknown) {
  const message = (e as Error)?.message || '';
  // Refund desk errors are in Chinese; show a generic English message instead.
  return !message || /[^\x00-\x7F]/.test(message) ? 'Query failed, please try again later' : message;
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
  min-width: 1180px;
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
