console.info('popup script loaded')

import { createApp } from 'vue'
import App from './App.vue'
// import { createVuetify } from 'vuetify/lib/framework.mjs'
// import * as components from 'vuetify/components'
// import * as directives from 'vuetify/directives'

// import vuetify from '/src/plugins/vuetify'
// const vuetify = createVuetify({
//   components,
//   directives,
// })

const app = createApp(App)
app.mount('#app')
