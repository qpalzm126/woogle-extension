<template>
  <div ref="$el" class="resize-box-component" :style="style">
    <div class="resize-bottom" @mousedown="onResizeEvent($event, 'ns')"></div>
    <div class="resize-left" @mousedown="onResizeEvent($event, 'ew')"></div>
    <div class="resize-left-bottom" @mousedown="onResizeEvent($event, 'nesw')"></div>
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue'

const props = defineProps({
  width: { type: [Number], default: 200 },
  height: { type: [Number], default: 200 },
  top: { type: [Number], default: 0 },
  right: { type: [Number], default: 0 },
  moveTarget: { type: [Object] as PropType<HTMLElement | null>, default: null },
  minWidth: { type: [Number], default: 0 },
  minHeight: { type: [Number], default: 0 },
})
const emit = defineEmits<{
  (event: 'update:width', value: number | string): void
  (event: 'update:height', value: number | string): void
  (event: 'update:top', value: number | string): void
  (event: 'update:right', value: number | string): void
}>()
const $el = ref<HTMLDivElement>()

const style = computed(() => {
  return {
    width: `${props.width}px`,
    height: `${props.height}px`,
    top: `${props.top}px`,
    right: `${props.right}px`,
  }
})

const offMoveEvent = ref<() => void>()

watch(
  () => props.moveTarget,
  (target) => {
    if (target) {
      offMoveEvent.value?.()

      target.addEventListener('mousedown', onMoveEvent)
      offMoveEvent.value = () => {
        target.removeEventListener('mousedown', onMoveEvent)
      }
    }
  }
)

onBeforeUnmount(() => {
  offMoveEvent.value?.()
})

function onResizeEvent(evt: MouseEvent, type: 'ns' | 'ew' | 'nesw') {
  const resize = {
    x: evt.x,
    y: evt.y,
    width: props.width,
    height: props.height,
  }

  const mouseEnd = (evt: MouseEvent) => {
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('mouseup', mouseEnd)
  }

  const mouseMove = (evt: MouseEvent) => {
    if (type === 'ew' || type === 'nesw') {
      const offsetX = resize.x - evt.x
      const width = Math.max(resize.width + offsetX, props.minWidth)
      if (width !== props.width) {
        emit('update:width', width)
      }
    }

    if (type === 'ns' || type === 'nesw') {
      const offsetY = evt.y - resize.y
      const height = Math.max(resize.height + offsetY, props.minHeight)
      if (height !== props.height) {
        emit('update:height', height)
      }
    }
  }

  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('mouseup', mouseEnd)
}

function onMoveEvent(evt: MouseEvent) {
  const move = {
    x: evt.x,
    y: evt.y,
    top: props.top,
    right: props.right,
  }

  const mouseEnd = (evt: MouseEvent) => {
    window.removeEventListener('mousemove', mouseMove)
    window.removeEventListener('mouseup', mouseEnd)
  }

  const mouseMove = (evt: MouseEvent) => {
    const offsetX = evt.x - move.x
    const offsetY = evt.y - move.y

    const newTop = move.top + offsetY
    const newRight = move.right - offsetX

    emit('update:top', newTop)
    emit('update:right', newRight)
  }

  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('mouseup', mouseEnd)
}
</script>
<style lang="scss" scoped>
.resize-box-component {
  position: absolute;

  .resize-bottom {
    position: absolute;
    z-index: 1000;
    width: 100%;
    height: 3px;
    left: 0;
    bottom: 0;
    cursor: ns-resize;
    user-select: none;
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  .resize-left {
    position: absolute;
    z-index: 1000;
    width: 3px;
    height: 100%;
    cursor: ew-resize;
    top: 0;
    left: 0;
    user-select: none;
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
  .resize-left-bottom {
    position: absolute;
    z-index: 1000;
    width: 10px;
    height: 10px;
    cursor: nesw-resize;
    bottom: 0;
    left: 0;
    user-select: none;
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
