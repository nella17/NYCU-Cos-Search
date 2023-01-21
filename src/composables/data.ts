interface Dep {
    label: string
    value: string
    children: Dep[]
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

    function fetchData(path: string, body: Record<string, string> = {}) {
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
        await fetchData('/sysstatuslvl')
        await Promise.allSettled([
            getdep(),
        ])
    }
    setup()

    const deps = ref<Dep[]>([])
    const depMap = new Map<string, string[]>()

    async function getdep() {
        const data = await fetchData('/getdep') as Dep[]
        deps.value = data
        data.forEach((dep) => parseDep(dep))
    }

    function parseDep(dep: Dep, path: string[] = []) {
        path = [...path, dep.label]
        if (isUUID(dep.value)) {
            depMap.set(dep.value, path)
        }
        if (dep.children) {
            dep.children.forEach((child) => {
                parseDep(child, path)
            })
        }
    }

    return {
        deps,
        depMap,
    }
})
