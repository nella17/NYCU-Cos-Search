let token = null as string | null

chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })

chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
        const info = await chrome.tabs.get(tab.id)
        if (info.url) {
            const url = new URL(info.url)
            if (url.hostname !== 'cos.nycu.edu.tw')
                return
            try {
                await chrome.tabs.sendMessage(tab.id, { toggleVisible: true })
            } catch (e) {
                await chrome.tabs.reload(tab.id)
            }
        }
    }
})

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.visible) {
        chrome.action.setBadgeText({ text: changes.visible.newValue ? 'ON' : '' })
    }
})

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        if (token) return
        const data = details.requestBody?.formData
        if (data && data.token && data.token[0]) {
            token = data.token[0]
        }
    },
    {
        urls: ['https://cos.nycu.edu.tw/*'],
    },
    ['requestBody'],
)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getToken') {
        sendResponse({ token })
        token = null
    }
})
