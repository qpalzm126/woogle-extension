<template>
  <div class="confidence-bar-component">
    <div class="txt">Confidence</div>
    <div class="bar">
      <!-- <div class="line" :style="{ width: props.value + '%' }"></div> -->
      <VProgressLinear height="5" color="info" rounded v-model="confidenceValue" :indeterminate="props.loading" />
    </div>
    <div class="ratio">{{ confidenceValue }}%</div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  loading: Boolean,
})

const confidenceValue = computed(() => Math.ceil(props.value * 100))
</script>
<style lang="scss" scoped>
.confidence-bar-component {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: none;
  width: 100%;
  .bar {
    height: 5px;
    flex: 1;
    background: #d1ddf4;
    border-radius: 5px;
    content: '';
    .line {
      height: 5px;
      position: relative;
      background: #0076ff;
      border-radius: 5px;
    }
  }
}
</style>
