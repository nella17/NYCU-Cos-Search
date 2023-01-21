import { createApp } from 'vue'
import Popup from './Popup.vue'

const el = document.createElement('div')
document.body.appendChild(el)
const vm = createApp(Popup).mount(el)
