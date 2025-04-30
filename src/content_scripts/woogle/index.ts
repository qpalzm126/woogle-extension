import { computed, createApp } from 'vue'
// import VisaQAssistant from './components/VisaQAssistant.vue'
// import vuetify from '/src/plugins/vuetify'
// import '@mdi/font/css/materialdesignicons.css'
// import 'vuetify/dist/vuetify.css'
import '/src/content_scripts/woogle/index.scss'
// import { ChromeAPI } from '/src/popup/chrome-api'

// const chromeApi = new ChromeAPI()
let messageObserver: MutationObserver | null = null
const isDevelopment = import.meta.env.MODE === 'development'

// function renderRegIcon($td: HTMLTableCellElement, $msg: HTMLDivElement) {
//   if ($td.querySelector('.eval-reg-wrapper')) {
//     return
//   }
//   const $wrapper = document.createElement('div')
//   $td.style.position = 'relative'
//   $wrapper.className = 'eval-reg-wrapper'
//   $wrapper.style.position = 'static'
//   $td.appendChild($wrapper)
//   createApp(VisaQAssistant, {
//     message: $msg.innerHTML,
//     leadId: leadId.value,
//   })
//     // .use(vuetify)
//     .mount($wrapper)
// }

function removeRegIcons() {
  messageObserver?.disconnect()

  document.querySelectorAll('.eval-reg-wrapper').forEach((el) => el.remove())
}

const leadId = computed(() => {
  const uri = new URL(location.href)
  const lid = Number(uri.searchParams.get('lid'))

  if (isDevelopment) {
    return 123
  }

  return isNaN(lid) ? null : lid
})

function isMessagePage() {
  const uri = new URL(location.href)
  const type = uri.searchParams.get('type')
  return (type === 'mes' && !!leadId.value) || isDevelopment
}

// function findMessageBoxs() {
//   const waiting = Promise.withResolvers<HTMLDivElement[]>()
//   const stopAt = Date.now() + 5000
//   const timer = setInterval(() => {
//     const msgBoxs = document.querySelectorAll<HTMLDivElement>('#msgContainer .mes_text')
//     if (msgBoxs.length > 0 || Date.now() > stopAt) {
//       clearInterval(timer)
//       waiting.resolve(Array.from(msgBoxs))
//     }
//   }, 500)
//   return waiting.promise
// }

// function findMessageWrapper() {
//   const waiting = Promise.withResolvers<HTMLDivElement | null>()
//   const stopAt = Date.now() + 5000
//   const timer = setInterval(() => {
//     const msgWrapper = document.querySelector<HTMLDivElement>('#msgContainer')
//     if (msgWrapper || Date.now() > stopAt) {
//       clearInterval(timer)
//       waiting.resolve(msgWrapper)
//     }
//   }, 500)
//   return waiting.promise
// }

// function renderMessages($wrapper: HTMLDivElement) {
//   const $msgs = $wrapper.querySelectorAll<HTMLDivElement>('.mes_text')
//   $msgs.forEach(($msg) => {
//     const $td: HTMLTableCellElement | null = $msg.closest('td')
//     const bgcolor = $td?.style.backgroundColor
//     const [r, g, b] = bgcolor?.match(/\d+/g) || []

//     /** rgb(192, 255, 255) 只處理(亮藍色) customer 的訊息 */
//     const isCustomerMessage = r === '192' && g === '255' && b === '255'
//     if ($td && isCustomerMessage) {
//       renderRegIcon($td, $msg)
//     }
//   })
// }

// function enableContentScriptFunctionality() {
//   findMessageWrapper().then(($wrapper: HTMLDivElement) => {
//     if (!$wrapper) {
//       console.log('messageWrapper not found')
//       return
//     }

//     messageObserver?.disconnect()
//     messageObserver = new MutationObserver((mutations) => {
//       console.log('messageObserver', mutations)
//       renderMessages($wrapper)
//     })

//     renderMessages($wrapper)

//     messageObserver.observe($wrapper, {
//       childList: true,
//       subtree: true,
//     })
//   })
// }

function showNotification(message: string, type: 'success' | 'error') {
  document.querySelectorAll('.extension-notification').forEach((el) => el.remove())
  const notification = document.createElement('div')
  notification.className = 'extension-notification'
  notification.textContent = message
  notification.style.cssText =
    type === 'success'
      ? 'position: fixed; top: 10px; right: 10px; background: #4CAF50; color: white; padding: 10px; border-radius: 4px; z-index: 10000;'
      : 'position: fixed; top: 10px; right: 10px; background: #f44336; color: white; padding: 10px; border-radius: 4px; z-index: 10000;'

  document.body.appendChild(notification)

  setTimeout(() => notification.remove(), 3000)
}

if (typeof chrome !== 'undefined' && chrome.runtime) {
  console.log('message detect on')
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('收到訊息:', message)
    if (message.action === 'deactivate-content-script') {
      console.log('收到未授權通知，停用內容腳本功能')

      removeRegIcons()

      showNotification('You have been logged out. Please log in again.', 'error')

      sendResponse({ status: 'content-script-function-disabled' })
    } else if (message.action === 'reactivate-content-script') {
      console.log('收到重新啟用通知，恢復內容腳本功能')

      // enableContentScriptFunctionality()

      showNotification('You are logged in.', 'success')

      sendResponse({ status: 'content-script-reactivated' })
    } else if (message.action === 'session-expired') {
      console.log('收到session-expired，停用內容腳本功能')

      // removeRegIcons()

      // chromeApi.removeData('token')

      showNotification('Your session has expired. Please log in again.', 'error')

      sendResponse({ status: 'content-script-function-disabled' })
    }

    return true
  })
} else {
  console.error('Chrome runtime API is not available in this context')
}

//initial render
// ;(() => {
//   if (!isMessagePage()) {
//     return
//   }

//   chromeApi
//     .isLoggedIn()
//     .then((isLoggedIn) => {
//       console.log(isLoggedIn ? '使用者已登入' : '使用者未登入')
//       if (!isLoggedIn) {
//         console.log('使用者未登入，不執行功能')
//         return Promise.reject('未登入')
//       }
//     })
//     .then(() => {
//       enableContentScriptFunctionality()
//     })
// })()
