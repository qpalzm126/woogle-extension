<template>
  <div class="answer-swiper-component">
    <div v-if="activeItem" class="answer-item">
      <div class="confidence-panel">
        <ConfidenceBar :value="activeItem.result.confidence" :loading="props.loading" />
      </div>
      <div class="answer-content-wrapper">
        <Transition :name="state.slideName">
          <div v-if="props.loading" class="loading-panel">
            <div class="loading-info">
              <VProgressCircular size="30" color="primary" width="3" indeterminate />
              <div class="txt-loading">This may take some time. Please wait.</div>
            </div>
            <VSkeletonLoader type="list-item-three-line" color="transparent" />
          </div>

          <div v-else class="result-qa-panel" :key="activeItem.key">
            <h2 class="title-question">Question:</h2>
            <div class="txt-question" v-html="activeItem.htmlQuestion"></div>
            <div class="divider"></div>
            <h2 class="title-answer">Answer:</h2>
            <div class="txt-answer" v-html="activeItem.htmlAnswer"></div>
          </div>
        </Transition>
      </div>

      <div class="actions-panel">
        <IconBtn icon="copy" :size="30" :disabled="!activeItem.result.answer || props.loading" @click="onCopied">
          <VTooltip
            :model-value="activeItem.alertCopied"
            location="bottom"
            class="alert-copied"
            activator="parent"
            :open-on-focus="false"
            :open-on-hover="false"
          >
            Copied!
          </VTooltip>
        </IconBtn>
        <div class="divider"></div>
        <IconBtn
          v-if="activeItem.feedback.sent === 'good'"
          icon="good-blue"
          :size="30"
          :disabled="activeItem.loadings.feedbackBad || props.loading"
          :readonly="!!activeItem.feedback.sent"
        />
        <IconBtn
          v-else
          icon="good"
          :size="30"
          :disabled="activeItem.loadings.feedbackBad || !activeItem.result.answer || props.loading"
          :readonly="!!activeItem.feedback.sent"
          :loading="activeItem.loadings.feedbackGood"
          @click="onFeedbackGood"
        />
        <IconBtn
          v-if="activeItem.feedback.sent === 'bad' || activeItem.feedback.visible"
          icon="bad-blue"
          :size="30"
          :disabled="activeItem.loadings.feedbackBad || props.loading"
          :readonly="!!activeItem.feedback.sent"
          @click="toggleFeedbackBad(false)"
        />
        <IconBtn
          v-else
          icon="bad"
          :size="30"
          :disabled="activeItem.loadings.feedbackBad || !activeItem.result.answer || props.loading"
          @click="toggleFeedbackBad(true)"
        />
        <div class="spacer"></div>
        <VBtn icon="mdi-arrow-left" flat size="30" :disabled="state.index <= 0" @click="onAddIndex(-1)" />
        <span>{{ state.index + 1 }} of {{ props.answers.length }}</span>
        <VBtn
          icon="mdi-arrow-right"
          flat
          size="30"
          :disabled="state.index >= props.answers.length - 1"
          @click="onAddIndex(1)"
        />
        <VBtn icon flat size="30" :loading="props.loading" @click="emit('reload')">
          <VIcon icon="mdi-refresh" color="primary" />
        </VBtn>
      </div>
      <Transition name="scroll-y">
        <div v-if="activeItem.feedback.visible" class="feedback-panel">
          <div class="form-group">
            <div class="form-label">Help us improve! What’s wrong with this answer?</div>
            <textarea class="form-input" v-model="activeItem.feedback.input"></textarea>
          </div>
          <VBtn
            block
            flat
            color="primary"
            class="submit-btn"
            :disabled="!activeItem.feedback.input.trim()"
            :loading="activeItem.loadings.feedbackBad"
            height="28"
            @click="onSendFeedback"
          >
            Submit
          </VBtn>
        </div>
      </Transition>

      <Transition name="scroll-y">
        <div v-if="activeItem.alert !== null" class="alert-panel">
          <AlertMessage :type="activeItem.alert.type" :message="activeItem.alert.message" @click="closeAlert()" />
        </div>
      </Transition>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import AlertMessage from './AlertMessage.vue'
import { RagAPI } from '/src/api/rag-api'
import { AxiosError, formToJSON } from 'axios'
import { uniqueId } from 'lodash-es'
import IconBtn from './IconBtn.vue'
import ConfidenceBar from './ConfidenceBar.vue'
import { PropType } from 'vue'
import markdownIt from 'markdown-it'
const md = markdownIt()

type FeedbackType = 'good' | 'bad'
type AlertType = 'error' | 'success' | 'warning'

interface AnswerState {
  key: string
  feedback: {
    sent: null | FeedbackType
    input: string
    visible: boolean
  }
  loadings: {
    feedbackGood: boolean
    feedbackBad: boolean
  }
  alertCopied: boolean
  alert: {
    type: AlertType
    message: string
  } | null
  result: AnswerResult
  htmlAnswer: string
  htmlQuestion: string
}

export interface AnswerResult {
  question: string
  answer: string
  confidence: number
}
const PenalHeight = {
  feedback: 159,
  alert: 42,
}

const props = defineProps({
  answers: { type: Array as PropType<AnswerResult[]>, required: true },
  loading: Boolean,
})
const emit = defineEmits<{
  (event: 'height:add', height: number): void
  (event: 'reload'): void
}>()

const state = reactive({
  index: 0,
  slideName: 'slide-left',
})

const stateItems = ref<AnswerState[]>([])

const activeItem = computed(() => {
  return stateItems.value.length > state.index ? stateItems.value[state.index] : null
})

watch(
  () => props.answers,
  () => {
    state.index = 0
    stateItems.value = props.answers.map((result) => {
      return {
        key: uniqueId('answer-state-'),
        result,
        feedback: {
          sent: null,
          input: '',
          visible: false,
        },
        alertCopied: false,
        alert: null,
        loadings: {
          feedbackGood: false,
          feedbackBad: false,
        },
        htmlAnswer: md.render(result.answer),
        htmlQuestion: md.render(result.question),
      }
    })

    if (stateItems.value.length === 0) {
      stateItems.value = [
        {
          key: uniqueId('answer-state-'),
          result: {
            question: '',
            answer: '',
            confidence: 0,
          },
          feedback: {
            sent: null,
            input: '',
            visible: false,
          },
          alertCopied: false,
          alert: null,
          loadings: {
            feedbackGood: false,
            feedbackBad: false,
          },
          htmlAnswer: '',
          htmlQuestion: '',
        },
      ]
    }
  },
  { immediate: true }
)

function onAddIndex(value: number) {
  const total = stateItems.value.length
  const nextIndex = (state.index + value + total) % total

  const from = activeItem.value
  const to = stateItems.value[nextIndex]

  const fromHeight = (from?.alert ? PenalHeight.alert : 0) + (from?.feedback.visible ? PenalHeight.feedback : 0)
  const toHeight = (to?.alert ? PenalHeight.alert : 0) + (to?.feedback.visible ? PenalHeight.feedback : 0)

  if (from && to) {
    emit('height:add', toHeight - fromHeight)
    if (nextIndex > state.index) {
      state.slideName = 'slide-left'
    } else {
      state.slideName = 'slide-right'
    }
    nextTick(() => {
      state.index = nextIndex
    })

    state.index = (state.index + value + total) % total
  }
}

function onFeedbackGood() {
  const sitem = activeItem.value
  if (!sitem) {
    return
  }

  sitem.loadings.feedbackGood = true

  toggleFeedbackBad(false)

  new RagAPI()
    .feedbackWrite({
      data: {
        Question: sitem.result.question,
        Answer: sitem.result.answer,
        Content: '',
        Editor: '',
        FeedbackId: '',
        Score: 1,
      },
    })
    .then(() => {
      sitem.feedback.sent = 'good'
    })
    .catch((err: AxiosError) => showAlert('error', err.message))
    .finally(() => {
      sitem.loadings.feedbackGood = false
    })
}

function onCopied() {
  const sitem = activeItem.value
  if (sitem?.result.answer) {
    const $wrap = document.createElement('div')
    $wrap.innerHTML = sitem.htmlAnswer
    navigator.clipboard.writeText($wrap.textContent || '')
    sitem.alertCopied = true
    setTimeout(() => (sitem.alertCopied = false), 2000)
  }
}

function toggleFeedbackBad(visible: boolean) {
  const sitem = activeItem.value
  if (!sitem) {
    return
  }

  if (sitem.feedback.visible === visible) {
    return
  }
  if (sitem.feedback.sent) {
    return
  }

  if (visible) {
    sitem.feedback.visible = true
    emit('height:add', PenalHeight.feedback)
  } else {
    sitem.feedback.visible = false
    emit('height:add', -PenalHeight.feedback)
  }
}

function showAlert(type: AlertType, message: string) {
  const sitem = activeItem.value
  if (sitem) {
    if (!sitem.alert) {
      emit('height:add', PenalHeight.alert)
    }
    sitem.alert = {
      type,
      message,
    }
  }
}

function closeAlert() {
  const sitem = activeItem.value
  if (sitem && sitem.alert) {
    sitem.alert = null
    emit('height:add', -PenalHeight.alert)
  }
}

function onSendFeedback() {
  const sitem = activeItem.value
  if (!sitem) {
    return
  }
  sitem.loadings.feedbackBad = true
  new RagAPI()
    .feedbackWrite({
      data: {
        Content: sitem.feedback.input,
        Answer: sitem.result.answer,
        Question: sitem.result.question,
        Editor: '',
        FeedbackId: '',
        Score: 0,
      },
    })
    .then(() => {
      toggleFeedbackBad(false)
      showAlert('success', 'Thanks! Your feedback helps us improve.')
      sitem.feedback.sent = 'bad'
    })
    .catch((err: AxiosError) => showAlert('error', err.message))
    .finally(() => {
      sitem.loadings.feedbackBad = false
    })
}
</script>
<style lang="scss" scoped>
.answer-swiper-component {
  position: relative;
  height: 100%;

  .answer-item {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .answer-content-wrapper {
      flex: 1;
      height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .loading-panel {
        background-color: #f4f7fd;
        border-radius: 8px;
        padding: 16px;
        flex: 1;
        height: 0;
        .loading-info {
          display: flex;
          align-items: center;
          gap: 8px;
          .txt-loading {
            font-size: 12px;
            color: #666;
          }
        }
        .v-skeleton-loader {
          margin-top: 16px;
        }
      }
      .result-qa-panel {
        flex: 1;
        height: 0;
        background-color: #f4f7fd;
        border-radius: 8px;
        padding: 16px;
        overflow: auto;
        scrollbar-width: thin;

        h2.title-question,
        h2.title-answer {
          position: relative;
          margin: 0 0 8px 0;
          padding: 4px 0;
          &:after {
            position: absolute;
            content: '';
            display: block;
            width: 40px;
            border-bottom: 2px solid rgb(var(--v-theme-primary));
            top: 100%;
            left: 0px;
            opacity: 0.5;
          }
        }

        .divider {
          position: relative;
          content: '';
          border-top: 1px solid #ccc;
          margin: 16px 0;
        }
      }
    }

    .actions-panel {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: none;
      .divider {
        width: 1px;
        height: 20px;
        background-color: #e0e0e0;
      }
    }

    .feedback-panel {
      flex: none;
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        textarea {
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 10px;
          font-size: 14px;
          resize: none;
          min-height: 60px; /* Setting minimum height */
        }
      }

      .submit-btn {
        margin-top: 8px;
      }
    }
    .alert-panel {
      flex: none;
    }
  }
}

.slide-left {
  &-enter-active {
    transition: transform 200ms, opacity 500ms;
    transform: translateX(0%);
    opacity: 1;
  }
  &-enter-from {
    transform: translateX(20%);
    opacity: 0;
  }
}
.slide-right {
  &-enter-active {
    transition: transform 200ms, opacity 500ms;
    transform: translateX(0%);
    opacity: 1;
  }
  &-enter-from {
    transform: translateX(-20%);
    opacity: 0;
  }
}
.scroll-y {
  &-enter-active {
    transition: transform 200ms, opacity 300ms;
    transform: translateY(0%);
    opacity: 1;
  }
  &-enter-from {
    transform: translateY(-20%);
    opacity: 0;
  }
}
</style>
