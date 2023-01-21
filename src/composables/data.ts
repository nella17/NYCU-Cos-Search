export const useDataStore = defineStore('data', () => {
    let token = ''

    function checkToken() {
        if (!token) {
            if (confirm('Token not found, reload page?')) {
                location.reload()
            }
            throw new Error('No token')
        }
    }

    function getData(path: string, body: Record<string, string> = {}) {
        checkToken()
        return fetch(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                ...body,
                token,
            }),
        })
            .then((resp) => {
                if (resp.status === 200) {
                    return resp.json()
                }
                throw new Error(`${resp.status} (${resp.statusText})`)
            })
            .catch((err) => {
                console.error('getData', err)
                alert(`getData ${path}: ${err.message}`)
                throw err
            })
    }

    async function setup() {
        token = await chrome.runtime
            .sendMessage({ action: 'getToken' })
            .then((res) => res.token)
        console.log('token', token)
        const res = await getData('/sysstatuslvl')
        console.log('res', res)
    }
    setup()

    return {}
})
