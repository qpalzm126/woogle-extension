<template>
  <div class="circle-loading-component">
    <svg
      class="spinner"
      :width="svgSize.width"
      :height="svgSize.height"
      viewBox="0 0 66 66"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [Number, String],
    default: 40,
  },
})

const svgSize = computed(() => {
  const size = Number(props.size)
  return {
    width: isNaN(size) ? props.size : `${size}px`,
    height: isNaN(size) ? props.size : `${size}px`,
  }
})
</script>
<style lang="scss" scoped>
.circle-loading-component {
  .spinner {
    -webkit-animation: rotator 1.4s linear infinite;
    animation: rotator 1.4s linear infinite;
  }

  @-webkit-keyframes rotator {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(270deg);
      transform: rotate(270deg);
    }
  }

  @keyframes rotator {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(270deg);
      transform: rotate(270deg);
    }
  }
  .path {
    stroke-dasharray: 187;
    stroke-dashoffset: 0;
    -webkit-transform-origin: center;
    -ms-transform-origin: center;
    transform-origin: center;
    // -webkit-animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
    // animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
    stroke: red;

    -webkit-animation: dash 1.4s ease-in-out infinite;
    animation: dash 1.4s ease-in-out infinite;
  }

  @-webkit-keyframes colors {
    0% {
      stroke: red;
    }
    14.285714286% {
      stroke: orange;
    }
    28.571428572% {
      stroke: yellow;
    }
    42.857142858% {
      stroke: green;
    }
    57.142857144% {
      stroke: blue;
    }
    71.42857143% {
      stroke: indigo;
    }
    100% {
      stroke: violet;
    }
  }

  @keyframes colors {
    0% {
      stroke: red;
    }
    14.285714286% {
      stroke: orange;
    }
    28.571428572% {
      stroke: yellow;
    }
    42.857142858% {
      stroke: green;
    }
    57.142857144% {
      stroke: blue;
    }
    71.42857143% {
      stroke: indigo;
    }
    100% {
      stroke: violet;
    }
  }
  @-webkit-keyframes dash {
    0% {
      stroke-dashoffset: 187;
    }
    50% {
      stroke-dashoffset: 46.75;
      -webkit-transform: rotate(135deg);
      transform: rotate(135deg);
    }
    100% {
      stroke-dashoffset: 187;
      -webkit-transform: rotate(450deg);
      transform: rotate(450deg);
    }
  }
  @keyframes dash {
    0% {
      stroke-dashoffset: 187;
    }
    50% {
      stroke-dashoffset: 46.75;
      -webkit-transform: rotate(135deg);
      transform: rotate(135deg);
    }
    100% {
      stroke-dashoffset: 187;
      -webkit-transform: rotate(450deg);
      transform: rotate(450deg);
    }
  }
}
</style>
