let token = null as string | null

chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })

chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { toggleVisible: true })
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
