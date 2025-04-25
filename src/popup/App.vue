<template>
  <div class="popup-component">
    <div class="container">
      <div id="loginForm">
        <h2>登入系統</h2>
        <div class="form-group">
          <label for="username">用戶名:</label>
          <input type="text" id="username" name="username" />
        </div>
        <div class="form-group">
          <label for="password">密碼：</label>
          <input type="password" id="password" name="password" />
        </div>
        <button id="loginBtn">登入</button>
        <p id="loginMessage"></p>
      </div>

      <div id="userPanel" style="display: none">
        <h2>歡迎使用文本查詢系统</h2>
        <p>您已登入成功！</p>
        <p>使用說明:</p>
        <ol>
          <li>在網頁中選擇任意文本</li>
          <li>點擊右键 menu 中的"透過 Woogle 查詢"</li>
          <li>结果將顯示在選定文本旁邊</li>
        </ol>
        <button id="logoutBtn">登出</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ChromeAPI } from './chrome-api'

const chromeApi = new ChromeAPI()

const input = reactive({
  username: 'vchen',
  password: 'Taiwan123.',
})

const state = reactive({ error: '', loading: false, testLoading: false })
const isLoggedIn = ref(false)

onMounted(() => {
  // chromeApi.getData('token').then((token) => {
  //   isLoggedIn.value = !!token
  // })
  chromeApi.isLoggedIn().then((res) => {
    isLoggedIn.value = res
    // return isLoggedIn.value ? chromeApi.notifyAllTabsToReEnable() : chromeApi.notifyAllTabsToDisable()
  })

  // chrome.storage.onChanged.addListener((changes, areaName) => {
  //   if (areaName === 'local' && changes.token) {
  //     console.log('token changed', changes.token.newValue)
  //     isLoggedIn.value = !!changes.token.newValue
  //   }

  //   return isLoggedIn.value
  //     ? chromeApi.notifyAllTabsToReEnable()
  //     : chromeApi.notifyAllTabsToDisable()
  // })
})

function onSubmit() {
  state.loading = true
  state.error = ''
  fetch('https://cmsv2.nailg.com/ashleyv3/login', {
    // fetch('https://adp.testing.masongeek.com/dev/allowed-login', {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization:
    //       'eyJraWQiOiJDaHJwRjh0SzgzWkhkd3cxc0tldm5jY2F4WXdXMU1IVXJPR1BFMjdIWEo4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlNDFmYmY5NS01MzY2LTQ5OTAtYjFhYy1lZDgzYmJlNjI1NWYiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9HdExVVVo4ZGUiLCJjbGllbnRfaWQiOiI1Ym5yNzdyODJzNHYxa2hsYm1wb3RtZmFqdCIsIm9yaWdpbl9qdGkiOiJlZDkwY2E1My0zNTgxLTQxMTgtOTZjZS0yN2Y0ZGRjNmEwZTEiLCJldmVudF9pZCI6IjRkNjlkNzM1LTMzMzItNDk1ZS05YTFjLWRmNzRmOTY0ZjkxYyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3NDE4MzI1MjgsImV4cCI6MTc0MTg1OTg2NCwiaWF0IjoxNzQxODU2MjY0LCJqdGkiOiJkMGZiYThkOC02Njg4LTQ5NWItYmEwNC1lMGZmM2I0Y2NkOTYiLCJ1c2VybmFtZSI6ImU0MWZiZjk1LTUzNjYtNDk5MC1iMWFjLWVkODNiYmU2MjU1ZiJ9.LpYDXF_bGTCEcPbYoU36RUdRfEhqnqSQWBvMyqYvfWPoJknxdm7b49njAbVXPDVd5hx_f4ul1ISiOIoGDJAqJDt7RGPHsm924DeFzCr0h9Zstse_CQPqr9ZB62-MANpy7Ipest_g07BMZaqwua6fhqS_VvRSLuiDxAz6QJxdWAKPMzC8oykR0IUVCaf6AqxlU2zKF5ZR3QS0aaYbg1SQTJJolFEkQHLRKhPM2ujiuB7LD5q_97avIBxPk5OIku6UXdQ4FcmmyC3gA1R83LkeIfeFFAHEHBq5Qb6Hb4yWpS3jydkKNyGJfxH0ayxBljidVmrRL7CkiZxZHs-0VpXApg',
    //   },
    // body: JSON.stringify({
    //   username: input.username,
    //   password: input.password,
    //   // check_robot: '',
    //   _token: 'Qc0cNfQUpUsUZ8OVruDn8aVNfhIFkHHdf1YsDbUz',
    // }),
  })
    .then((response) => {
      console.log('登入response:', response)
      return response.json()
    })
    .then((data) => {
      const mockToken = 'abcdefghijklmnopqrstuvwxyz'[Math.round(Math.random() * 10)]
      console.log('popup API 響應data:', data)
      if (data.id) {
        // 登入成功，儲存token或cookie
        chromeApi.storeData('token', data.id ?? '123').then(() => {
          console.log('Token已儲存')
          isLoggedIn.value = true
        })
        // chrome.storage.local.set({ token: mockToken }, function () {
        //   console.log('Token已儲存')
        // })
      } else {
        state.error = '登入失敗: ' + data.message
      }
    })
    .catch((error) => {
      console.error('登入錯誤:', error)
    })
    .finally(() => {
      state.loading = false
    })
}

function onUnauthorizedLogin() {
  state.testLoading = true
  fetch('https://adp.testing.masongeek.com/dev/allowed-login', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: '123',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.id) {
        chromeApi.storeData('token', data.id ?? '123').then(() => {
          isLoggedIn.value = true
        })
      } else {
        state.error = '登入失敗: ' + data.message
      }
    })
    .catch((error) => {
      console.error('登入錯誤:', error)
    })
    .finally(() => {
      state.testLoading = false
    })
}

function logout() {
  chromeApi.removeData('token')
}
</script>
<style lang="scss" scoped>
.popup-component {
  min-width: 200px;
  font-size: 16px;
  .txt-error {
    color: red;
  }
  .form {
    padding: 1rem;

    .form-group {
      + .form-group {
        margin-top: 1rem;
      }
      .form-label {
        margin-bottom: 0.5rem;
      }
      .form-input {
        input {
          font-size: 16px;
          flex: 1;
          padding: 0.25rem 0.5rem;
        }
      }
    }
    .submit {
      display: flex;
      gap: 10px;
      .btn-submit {
        margin: 1rem auto 0;
        cursor: pointer;
      }
    }
  }
  .btn-logout {
    margin: 1rem auto 0;
    cursor: pointer;
  }
  .btn-unauthorized {
    margin: 1rem auto 0;
    cursor: pointer;
  }
}
</style>
