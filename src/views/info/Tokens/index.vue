<template>
  <div class="info-assets">
    <!--  关注的资产  -->
    <AssetsTable
      class="mb-6"
      :title="$t('info.info15')"
      :loading="loading"
      :data="focusTokens"
      :total="focusTokens.length"
      :page-size="focusTokens.length"
    />
    <!-- 全部资产   -->
    <AssetsTable
      :title="$t('info.info32')"
      :loading="tokenLoading"
      :data="tokens"
      :total="tokenTotal"
      @pageChange="getAssetsList"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useFocusTokens } from '../hooks/useFocusTokensAndPools';
import useTokensAndPools from '../hooks/useTokensAndPools';
import AssetsTable from '../Overview/AssetsTable.vue';

const { loading, focusTokens } = useFocusTokens();
const { tokenLoading, tokens, tokenTotal, getAssetsList } = useTokensAndPools();

onMounted(() => {
  getAssetsList();
});
</script>

<style></style>
