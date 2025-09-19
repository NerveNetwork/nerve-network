<template>
  <div class="search-wrap mb-4 flex flex-wrap items-center justify-between">
    <!-- <Input
        class="bg-card2 w-[340px]"
        input-class="h-9"
        v-model="inputVal"
        :placeholder="$t('assets.assets8')"
        @change="emitSearch">
        <template #prepend><i-custom-search /></template>
      </Input> -->
    <div class="flex items-center mb-4 md:mb-0">
      <div class="w-40 mr-4 ">
        <Select
          v-model="selectVal"
          :options="options"
          placeholder=""
          class="h-9"
          @change="emitSearch" />
      </div>

      <Input
        class="w-auto bg-card2 md:w-[340px]"
        input-class="h-9"
        v-model="inputVal"
        :placeholder="$t('assets.assets8')"
        @change="emitSearch">
        <template #prepend><i-custom-search /></template>
      </Input>
    </div>
    <!-- <div class="left">
      <el-input
        class="search-input"
        v-model="inputVal"
        :placeholder="$t('assets.assets8')"
        :suffix-icon="Search"
        @change="emitSearch" />
      <el-select
        v-model="selectVal"
        placeholder=""
        popper-class="select"
        @change="emitSearch">
        <el-option :label="$t('mint.mint48')" value="1"></el-option>
        <el-option :label="$t('mint.mint49')" value="2"></el-option>
        <el-option :label="$t('mint.mint50')" value="3"></el-option>
      </el-select>
    </div> -->

    <router-link :to="{ name: 'mintDeploy' }">
      <Button class="h-9 px-2">
        <span class="mr-1">{{ $t('mint.mint1') }}</span>
        <i-custom-add class="text-white" />
      </Button>
    </router-link>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from '@/components/Base/Select/index.vue'
import Input from '@/components/Base/Input/index.vue'
import Button from '@/components/Base/Button/index.vue'

const emits = defineEmits(['search'])

const { t } = useI18n()

const inputVal = ref('')
const selectVal = ref('1')
const options = [
  { label: t('mint.mint48'), value: '1' },
  { label: t('mint.mint49'), value: '2' },
  { label: t('mint.mint50'), value: '3' }
]

function emitSearch() {
  emits('search', inputVal.value, selectVal.value)
}
</script>
