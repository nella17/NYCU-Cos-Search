let token = null as string | null

chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { toggleVisible: true })
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
