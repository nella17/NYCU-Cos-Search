const HOSTNAME = 'cos.nycu.edu.tw'

let token = null as string | null
let currentTabId = null as number | null

chrome.storage.session.setAccessLevel({
    accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
})

chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
        const info = await chrome.tabs.get(tab.id)
        if (info.url) {
            const url = new URL(info.url)
            if (url.hostname !== HOSTNAME) return
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    toggleVisibility: true,
                })
            } catch (e) {
                await chrome.tabs.reload(tab.id)
            }
        }
    }
})

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.visible) {
        chrome.action.setBadgeText({
            text: changes.visible.newValue ? 'ON' : '',
        })
    }
})

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        if (details.tabId !== currentTabId) return
        if (token) return
        const data = details.requestBody?.formData
        if (data && data.token && data.token[0]) {
            token = data.token[0]
        }
    },
    { urls: [`https://${HOSTNAME}/*`] },
    ['requestBody'],
)

const WebNavigationEventFilter = {
    url: [{ hostEquals: HOSTNAME }],
}

chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId === 0) {
        currentTabId = -1
        chrome.tabs.sendMessage(details.tabId, { token })
        token = null
    }
}, WebNavigationEventFilter)

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0) {
        currentTabId = details.tabId
    }
}, WebNavigationEventFilter)
