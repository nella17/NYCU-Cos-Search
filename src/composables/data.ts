interface Dep {
    label: string
    value: string
    children?: Dep[]
}

type DepPath = Dep[]

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
                // TODO: show error message in popup
                // alert(`getData ${path}: ${err.message}`)
                throw err
            })
    }

    async function fetchData(path: string, body: Record<string, string> = {}) {
        const key = `${path}?${await digestMessage(body)}`
        const saved = await chrome.storage.local.get(key)
        if (saved[key]) {
            const { time, data } = saved[key]
            if (
                new Date().getTime() - new Date(time).getTime() <
                24 * 60 * 60 * 1000
            ) {
                return data
            }
        }
        const data = await fetchDataNocache(path, body)
        chrome.storage.local.set({
            [key]: { data, time: new Date().getTime() },
        })
        return data
    }

    const deps = ref<Dep[]>([])
    const depMap = new Map<string, DepPath>()

    async function get_dep() {
        const data = (await fetchData('/getdep')) as Dep[]
        deps.value = data
        depMap.clear()
        deps.value.forEach((dep) => parse_dep(dep))
    }

    function parse_dep({ value, label, children }: Dep, path: DepPath = []) {
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

    async function setup() {
        token = await chrome.runtime
            .sendMessage({ action: 'getToken' })
            .then((res) => res.token)
        await fetchDataNocache('/sysstatuslvl')
        await Promise.allSettled([get_dep()])
    }

    return {
        deps,
        depMap,
        setup,
    }
})
