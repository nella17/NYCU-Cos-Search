import { createApp } from 'vue'
import Main from './main.vue'
import { createPinia } from 'pinia'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const pinia = createPinia()
const vuetify = createVuetify()

const el = document.createElement('div')
document.body.appendChild(el)

const app = createApp(Main)

app.use(pinia)
app.use(vuetify)

app.mount(el)
