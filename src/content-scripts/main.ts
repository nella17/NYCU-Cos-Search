import { createApp } from 'vue'
import Main from './main.vue'

const el = document.createElement('div')
document.body.appendChild(el)
const vm = createApp(Main).mount(el)
