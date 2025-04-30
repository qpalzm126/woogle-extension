<template>
  <!-- <button class="icon-btn-component" :class="{ flip: props.icon === 'bad' }" :style="style">
    <Icon :size="iconSize" :icon="props.icon" />
  </button> -->
  <VBtn icon flat :size="props.size" color="transparent">
    <Icon class="icon" :size="iconSize" :icon="props.icon" />
    <slot></slot>
  </VBtn>
</template>
<script lang="ts" setup>
import { computed, PropType } from 'vue'
import Icon, { ICON } from './Icon.vue'

const props = defineProps({
  raw: String,
  icon: { type: String as PropType<ICON | undefined>, default: undefined },
  size: {
    type: [Number],
    default: 40,
  },
  iconSize: {
    type: [Number],
    default: undefined,
  },
})

const style = computed(() => {
  const size = Number(props.size)
  return {
    width: isNaN(size) ? props.size : `${size}px`,
    height: isNaN(size) ? props.size : `${size}px`,
  }
})

const iconSize = computed(() => Number(props.iconSize ?? Math.floor(props.size * 0.4)))
</script>
<style lang="scss" scoped>
// .icon-btn-component {
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   border-radius: 50%;
//   padding: 0;
//   border: none;
//   background-color: transparent;
//   cursor: pointer;
//   &:hover {
//     background-color: rgba(0, 0, 0, 0.1);
//   }
//   &:active {
//     background-color: rgba(0, 0, 0, 0.2);
//   }

//   // 垂直翻轉
//   &.flip {
//     transform: rotate(180deg);
//   }
// }

.icon {
  margin: -1px 0 0 -1px;
}
</style>
