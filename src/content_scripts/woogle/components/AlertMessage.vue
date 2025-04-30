<template>
  <div class="alert-message-component">
    <Icon v-if="type === 'success'" icon="done" :size="16" />
    <VIcon v-else-if="type === 'error'" icon="mdi-close-circle-outline" color="error" :size="16" />
    <VIcon v-else-if="type === 'warning'" icon="mdi-alert-circle-outline" color="warning" :size="16" />
    <div class="message" :class="textClassName">{{ message }}</div>
    <IconBtn icon="close" :size="24" @click="emit('click:close')" />
  </div>
</template>
<script lang="ts" setup>
import { computed, PropType } from 'vue'
import Icon from './Icon.vue'
import IconBtn from './IconBtn.vue'

export type AlertType = 'error' | 'success' | 'warning'
const props = defineProps({
  type: { type: String as PropType<AlertType>, default: 'success' },
  message: String,
})
const emit = defineEmits<{
  (event: 'click:close'): void
}>()

const textClassName = computed(() => {
  return {
    'text-error': props.type === 'error',
    'text-warning': props.type === 'warning',
  }
})
</script>
<style lang="scss" scoped>
.alert-message-component {
  border: 1px solid #d1ddf4;
  border-radius: 8px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  .message {
    color: #333;
    font-size: 12px;
    flex: 1;
  }
}
</style>
