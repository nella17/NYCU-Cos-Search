import { Dep, DepPath, Course, CourseWrap } from '@/types'

export const useDataStore = defineStore('data', () => {
    let token = ''

    function checkToken() {
        if (!token) {
            chrome.storage.local.set({ visible: false })
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

    const courses = ref<CourseWrap[]>([])

    async function get_preregistcourse(dep_uid: string, dep_path: DepPath) {
        if (!dep_uid) return
        const data = (await fetchData('/preregistcourse', {
            dep_uid,
            type: dep_path[0]?.value ?? '*',
            dep_category: dep_path[1]?.value ?? '*',
            college_no: dep_path[2]?.value ?? '*',
            group: dep_path[3]?.value ?? '*',
            grade: dep_path[4]?.value ?? '*',
            class: dep_path[5]?.value ?? '*',
        })) as Course[]
        data.forEach((course) => {
            courses.value.push({
                course,
                dep_uid,
            })
        })
    }

    async function setup() {
        token = await chrome.runtime
            .sendMessage({ action: 'getToken' })
            .then((res) => res.token)
        await fetchDataNocache('/sysstatuslvl')
        await get_dep()
        const promises = []
        for (const [dep_uid, dep_path] of depMap.entries())
            promises.push(get_preregistcourse(dep_uid, dep_path))
        await Promise.allSettled(promises).then((res) => {
            res.filter((p) => p.status !== 'fulfilled').forEach((p) => {
                console.error('setup Promise.allSettled', p)
            })
        })
    }

    return {
        deps,
        depMap,
        courses,
        setup,
    }
})
