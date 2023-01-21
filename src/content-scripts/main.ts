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

function get(path: string, body: Record<string, string>) {
    return fetch(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body),
    })
}

chrome.runtime.sendMessage({ action: 'getToken' }).then(async ({ token }) => {
    get('/sysstatuslvl', { token })
        .then((resp) => resp.json())
        .then((resp) => console.log(resp))

    get('/getpreregist', { token })
        .then((resp) => resp.json())
        .then((resp) => console.log(resp))
})
