<template>
  <div
    class="visa-q-assistant-component"
    :style="{ zIndex: state.zIndex }"
    @mousedown="onUpdateZIndexToTop"
  >
    <div class="rag-icon">
      <IconBtn
        icon="visa-rag"
        :color="state.visible ? '#999' : 'transparent'"
        @click="toggleVisible()"
      >
        <VTooltip activator="parent" location="bottom">
          <span>Eval Extensions.</span>
        </VTooltip>
      </IconBtn>
    </div>
    <VScrollXReverseTransition hide-on-leave>
      <ResizeBox
        v-if="state.visible"
        v-model:width="state.box.width"
        v-model:height="state.box.height"
        v-model:top="state.box.top"
        v-model:right="state.box.right"
        :move-target="$boxHeader"
        :min-width="360"
        :min-height="400"
        class="resize-box"
      >
        <div class="rag-box">
          <div ref="$boxHeader" class="box-header">
            <Icon icon="visa-rag" />
            <div class="title">Visa Q Assistant</div>
            <div class="spacer"></div>
            <div class="actions">
              <IconBtn icon="close" :size="30" @click.stop.prevent="toggleVisible(false)" />
            </div>
          </div>
          <div class="box-body">
            <div v-if="state.alert.message" class="error-panel">
              <VAlert :type="state.alert.type" density="compact" closable @click:close="closeAlert">
                {{ state.alert.message }}
              </VAlert>
            </div>
            <AnswerSwiper
              :answers="results"
              :loading="loading.fetchAnswer"
              @height:add="onAddBoxHeight"
              @reload="fetchAnswer"
            />
          </div>
        </div>
      </ResizeBox>
    </VScrollXReverseTransition>
  </div>
</template>
<script lang="ts">
const layerZIndex = ref(101)
</script>
<script lang="ts" setup>
import ResizeBox from './ResizeBox.vue'
import { computed, reactive, ref, watch } from 'vue'
import IconBtn from './IconBtn.vue'
import { RagAPI } from '/src/api/rag-api'
import { AxiosError } from 'axios'
import Icon from './Icon.vue'
import AnswerSwiper, { AnswerResult } from './AnswerSwiper.vue'

type VAlertType = 'error' | 'info' | 'warning' | 'success'

const props = defineProps({
  leadId: { type: Number, required: true },
  message: String,
})
const $boxHeader = ref<HTMLDivElement>()

const state = reactive({
  visible: false,
  zIndex: 100,
  box: {
    width: 360,
    height: 400,
    top: 0,
    right: 0,
  },
  alert: {
    type: 'info' as VAlertType,
    message: '',
  },
})

const results = ref<AnswerResult[]>([])

const loading = reactive({
  fetchAnswer: false,
})

watch(
  () => state.visible,
  () => {
    state.box.top = 0
    state.box.right = 0
    if (state.visible && !loading.fetchAnswer && !results.value.length) {
      fetchAnswer()
    }
  },
)

// zindex: 浮至頂層
function onUpdateZIndexToTop() {
  if (state.zIndex >= layerZIndex.value) {
    return
  }
  layerZIndex.value += 1
  state.zIndex = layerZIndex.value
}

function toggleVisible(visible?: boolean) {
  state.visible = visible ?? !state.visible
}

function onAddBoxHeight(value: number) {
  state.box.height += value
}

function showAlert(type: VAlertType, message: string) {
  state.alert.type = type
  state.alert.message = message
}

function closeAlert() {
  state.alert.message = ''
}

function fetchAnswer() {
  const $wrap = document.createElement('div')
  $wrap.innerHTML = props.message || ''

  Array.from($wrap.querySelectorAll<HTMLElement>('*'))
    .filter((el) => el.offsetParent === null)
    .forEach((el) => el.remove())

  // remove all display:none element element in $wrap
  $wrap.querySelectorAll('[style*="display:none"]').forEach((el) => el.remove())

  const message = ($wrap.textContent || '').trim()
  closeAlert()

  if (!message) {
    showAlert('warning', 'Message is empty')
    return
  }

  loading.fetchAnswer = true

  new RagAPI()
    .getAssistantProcessEmail({
      data: {
        LeadId: props.leadId.toString(),
        Content: message,
      },
    })
    .then((res) => {
      if (res.Results.length === 0) {
        showAlert('warning', 'No answer found')
        return
      }
      results.value = res.Results.map((r) => ({
        question: r.Question || '',
        answer: r.Answer || '',
        confidence: r.Confidence || 0,
      }))
    })
    .catch((err: AxiosError) => showAlert('error', err.message))
    .finally(() => {
      loading.fetchAnswer = false
    })
}
</script>
<style lang="scss" scoped>
.visa-q-assistant-component {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 100;
  & * {
    font-family: 'Roboto', sans-serif;
  }
}
.rag-icon {
  position: relative;
  top: 0;
  right: 0;
  z-index: 100;
}
.resize-box {
  z-index: 110;
}
.rag-box {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  border-radius: 12px;
  background-color: #fff;

  .box-header {
    background-color: #f4f7fd;
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
    flex: none;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    user-select: none;
    cursor: move;

    .icon {
      &:deep(svg) {
        width: 16px;
        height: 16px;
      }
    }
    .title {
      color: #333;
      font-size: 12px;
      font-weight: 500;
    }
    .spacer {
      flex: 1;
    }
  }

  .box-body {
    background-color: #fff;
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
    padding: 16px;

    flex: 1;
    height: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .v-alert {
      color: #fff;
    }
  }
  .box-actions {
    display: flex;
    align-items: center;
    gap: 5px;
    flex: none;
    padding: 16px;

    .divider {
      width: 1px;
      height: 20px;
      background-color: #e0e0e0;
    }
  }

  .box-feedback {
    flex: none;
    padding: 0 16px 16px;

    textarea {
      width: 100%;
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 10px;
      font-size: 14px;
      resize: none;
      min-height: 60px; /* Setting minimum height */
    }

    .submit-btn {
      width: 100%;
      border: none;
      border-radius: 6px;
      background-color: #0076ff;
      color: #fff;
      font-size: 12px;
      font-weight: 500;
      height: 24px;
      margin-top: 8px;
      cursor: pointer;
    }
  }
  .success-alert-panel {
    flex: none;
    padding: 0 16px 16px;
  }
}
</style>
