<template>
  <el-dialog
    title="Connect to a wallet"
    custom-class="connect-dialog"
    :show-close="false"
    v-model="visible"
    :append-to-body="true"
    @closed="emit('changeShow', false)"
  >
    <div class="list">
      <div
        class="connect-btn"
        v-for="(item, index) in providerList"
        :key="index"
        @click="emit('connect', item.provider)"
      >
        {{ item.name }}
        <img class="fr" :src="item.src" alt="" />
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { providerList } from '@/hooks/useEthereum';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits(['update:show', 'changeShow', 'connect']);

const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('update:show', val);
  }
});
</script>

<style lang="scss"></style>
