import { createApp } from 'vue'
import Main from './main.vue'
import { createPinia } from 'pinia'

const el = document.createElement('div')
document.body.appendChild(el)

const app = createApp(Main)

const pinia = createPinia()
app.use(pinia)

app.mount(el)
