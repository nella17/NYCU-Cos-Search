interface Dep {
    label: string
    value: string
    children?: Dep[]
}

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

    function fetchDataNocache(path: string, body: Record<string, string> = {}) {
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

    async function fetchData(path: string, body: Record<string, string> = {}) {
        const key = `${path}?${new URLSearchParams(body).toString()}`
        const saved = await chrome.storage.session.get(key)
        if (saved[key]) return saved[key]
        const data = await fetchDataNocache(path, body)
        chrome.storage.session.set({ [key]: data })
        return data
    }

    async function setup() {
        token = await chrome.runtime
            .sendMessage({ action: 'getToken' })
            .then((res) => res.token)
        await fetchDataNocache('/sysstatuslvl')
        await Promise.allSettled([
            get_dep(),
        ])
    }
    setup()

    const deps = ref<Dep[]>([])
    const depMap = new Map<string, Dep[]>()

    async function get_dep() {
        const data = (await fetchData('/getdep')) as Dep[]
        deps.value = data
        depMap.clear()
        deps.value.forEach((dep) => parse_dep(dep))
    }

    function parse_dep({ value, label, children }: Dep, path: Dep[] = []) {
        path = [...path, { value, label }]
        if (isUUID(value)) {
            depMap.set(value, path)
        }
        if (children) {
            children.forEach((child) => {
                parse_dep(child, path)
            })
        }
    }

    return {
        deps,
        depMap,
    }
})
