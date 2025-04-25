function isChromeApiAvailable() {
  return typeof chrome !== 'undefined' && chrome.runtime
}

export class ChromeAPI {
  public sendMessage(message: ChromeAPIType.Message) {}
  public isLoggedIn() {
    return new Promise<boolean>((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['token'], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
            return
          }
          const isLoggedIn = !!result.token
          resolve(isLoggedIn)
        })
      } else {
        console.warn('無法訪問 Chrome 存儲 API')
        resolve(false)
      }
    })
  }

  public storeData(key: string, value: string) {
    return new Promise<void>((resolve, reject) => {
      if (!isChromeApiAvailable()) {
        console.warn('Chrome API unavailable')
        localStorage.setItem(key, JSON.stringify(value))
        resolve()
        return
      }

      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  }

  public getData(key: string) {
    return new Promise<string>((resolve, reject) => {
      if (!isChromeApiAvailable()) {
        console.warn('Chrome API unavailable')
      }
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        }
        resolve(result[key] as string)
      })
    })
  }

  public removeData(key: string) {
    return new Promise<void>((resolve, reject) => {
      if (!isChromeApiAvailable()) {
        console.warn('Chrome API unavailable')
      }
      chrome.storage.local.remove(key, () => {})
    })
  }

  public notifyAllTabs(message: ChromeAPIType.Message) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (!tab.id) {
          return
        }

        chrome.tabs.sendMessage(tab.id, message, (response) => {
          if (chrome.runtime.lastError) {
            // console.log(`標籤頁 ${tab.id} 無法接收消息:`, chrome.runtime.lastError.message)
            return
          } else if (response) {
            console.log(`標籤頁 ${tab.id} 回應:`, response)
          }
        })
      })
    })
  }

  public notifyAllTabsToReEnable() {
    console.log('notifyAllTabsToReEnable')
    this.notifyAllTabs({ action: 'reactivate-content-script' })
  }

  public notifyAllTabsToDisable() {
    console.log('notifyAllTabsToDisable')
    this.notifyAllTabs({ action: 'deactivate-content-script' })
  }

  public notifyAllTabsSessionExpired() {
    console.log('session-expired')
    this.notifyAllTabs({ action: 'session-expired' })
  }
}

export declare namespace ChromeAPIType {
  type Action = 'deactivate-content-script' | 'reactivate-content-script' | 'session-expired'
  interface Message {
    action: Action
    message?: string
  }
}
