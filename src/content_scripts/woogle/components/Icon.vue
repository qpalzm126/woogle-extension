<template>
  <span class="icon-component" :class="className" v-html="iconRaw" :style="style"></span>
</template>
<script lang="ts" setup>
import iconClose from '/src/assets/images/icon-x.svg?raw'
import iconCopy from '/src/assets/images/icon-copy.svg?raw'
import iconGood from '/src/assets/images/icon-good.svg?raw'
import iconGoodBlue from '/src/assets/images/icon-good-blue.svg?raw'
import iconVisaRag from '/src/assets/images/icon-visa-rag.svg?raw'
import iconDone from '/src/assets/images/icon-done.svg?raw'
import { computed, PropType } from 'vue'
export type ICON = 'close' | 'copy' | 'good' | 'good-blue' | 'bad' | 'bad-blue' | 'visa-rag' | 'done'
const props = defineProps({
  icon: { type: String as PropType<ICON>, default: 'close' },
  size: {
    type: [Number, String],
    default: 18,
  },
})
const iconRaw = computed(() => {
  const icons: Record<ICON, string> = {
    close: iconClose,
    copy: iconCopy,
    good: iconGood,
    'good-blue': iconGoodBlue,
    bad: iconGood,
    'bad-blue': iconGoodBlue,
    done: iconDone,
    'visa-rag': iconVisaRag,
  }
  return icons[props.icon]
})

const style = computed(() => {
  const size = Number(props.size)
  return {
    width: isNaN(size) ? props.size : `${size}px`,
    height: isNaN(size) ? props.size : `${size}px`,
  }
})

const className = computed(() => {
  const flipIcons: ICON[] = ['bad', 'bad-blue']
  return {
    flip: flipIcons.includes(props.icon),
  }
})
</script>
<style lang="scss" scoped>
.icon-component {
  display: inline-block;
  &:deep(svg) {
    width: 100% !important;
    height: 100% !important;
    vertical-align: super;
  }

  &.flip {
    transform: rotate(180deg);
  }
}
</style>
