import { Dep, DepPath, Course, CourseWrap, CourseMap } from '@/types'

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

    let deps = ref<Dep[]>([])
    let depPaths = ref<DepPath[]>([])

    async function get_dep() {
        const data = (await fetchDataNocache('/getdep')) as Dep[]
        deps.value = data
        depPaths.value = []
        data.forEach((dep) => parse_dep(dep))
    }

    function parse_dep({ value, label, children }: Dep, path: DepPath = []) {
        path = [...path, { value, label }]
        if (!children) {
            depPaths.value.push(path)
        } else {
            const all = children.filter((child) => child.value === '*')
            if (all.length) {
                parse_dep(all[0], path)
            } else {
                children.forEach((child) => parse_dep(child, path))
            }
        }
    }

    const courseMap = ref<CourseMap>(new Map())
    const courses = computed(() =>
        [...unref(courseMap).values()].map(({ course, paths }) => ({
            course,
            paths,
            pathstrs: Array.from(new Set(paths.flat().map(dep => dep.label)).keys()).join(),
        })),
    )

    async function get_preregistcourse(dep_path: DepPath) {
        const data = (await fetchData('/preregistcourse', {
            type: dep_path[0]?.value ?? '',
            dep_category: dep_path[1]?.value ?? '',
            college_no: dep_path[2]?.value ?? '',
            dep_uid: dep_path[3]?.value ?? '',
            group: dep_path[4]?.value ?? '',
            grade: dep_path[5]?.value ?? '',
            class: dep_path[6]?.value ?? '',
        })) as Course[]
        data.forEach((course) => {
            const { cos_id } = course
            if (!courseMap.value.has(cos_id)) {
                courseMap.value.set(cos_id, {
                    course,
                    paths: [],
                })
            }
            const item = courseMap.value.get(cos_id)!
            item.paths.push(dep_path)
        })
    }

    async function setup() {
        token = await chrome.runtime
            .sendMessage({ action: 'getToken' })
            .then((res) => res.token)
        await fetchDataNocache('/sysstatuslvl')
        await get_dep()
        courseMap.value.clear()
        await Promise.allSettled(
            depPaths.value.map((dep_path) => get_preregistcourse(dep_path)),
        ).then((res) => {
            res.filter((p) => p.status !== 'fulfilled').forEach((p) => {
                console.error('setup Promise.allSettled', p)
            })
        })
    }

    return {
        deps,
        depPaths,
        courseMap,
        courses,
        setup,
    }
})
