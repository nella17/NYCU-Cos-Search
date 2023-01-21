import { createApp } from 'vue'
import Popup from './Popup.vue'

const el = document.createElement('div')
document.body.appendChild(el)

const vm = createApp(Popup, { visible: true }).mount(el)

chrome.runtime.onMessage.addListener((message) => {
    if (message.toggleVisible) {
        ;(vm.$props as any).visible = !(vm.$props as any).visible
    }
})
