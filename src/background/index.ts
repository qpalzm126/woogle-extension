// 初始化扩展
chrome.runtime.onInstalled.addListener(() => {
  // 检查是否已登录
  chrome.storage.local.get(['isLoggedIn'], function (result) {
    if (result.isLoggedIn) {
      createContextMenu()
    }
  })
})

// 创建上下文菜单
function createContextMenu() {
  chrome.contextMenus.create({
    id: 'queryText',
    title: '透過 Woogle 查询',
    contexts: ['selection'],
  })
}

// 当用户点击上下文菜单项时
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'queryText' && info.selectionText) {
    // 发送消息到content脚本进行查询
    chrome.tabs.sendMessage(tab?.id ?? 0, {
      action: 'queryText',
      text: info.selectionText,
    })
  }
})

// 监听来自popup或content脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'enableContextMenu') {
    // 清除所有现有菜单项然后创建新的
    chrome.contextMenus.removeAll(() => {
      createContextMenu()
    })
  } else if (message.action === 'disableContextMenu') {
    // 清除所有上下文菜单项
    chrome.contextMenus.removeAll()
  }
})
