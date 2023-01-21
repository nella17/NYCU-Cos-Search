interface Dep {
    label: string
    value: string
    children?: Dep[]
}

type DepPath = Dep[]

interface Course {
    GroupName: string
    GroupName_E: string
    TURL: string
    URL: string
    acy: string
    blocked: string
    brief: string
    brief_E: string
    category_cname: any
    category_ename: any
    category_type: any
    cos_cname: string
    cos_credit: string
    cos_ename: string
    cos_hours: string
    cos_id: string
    cos_practice_hours: string
    cos_teaching_hours: string
    cos_time: string
    cos_type_code: string
    crsoutline: string
    degree: string
    dep_id: string
    fifth_wish_reserved_num: string
    first_wish_reserved_num: string
    fourth_wish_reserved_num: string
    lecturers: string
    lecturers_E: string
    master_dep_cname: string
    master_dep_ename: string
    memo: string
    num_limit: string
    priority: string
    registered_num: string
    reserved_num: string
    sFlag: any
    second_wish_reserved_num: string
    sem: string
    student_id: any
    student_wtype: any
    third_wish_reserved_num: string
    wType: string
    wType_cname: string
    wType_ename: string
}

interface CourseWrap {
    course: Course
    dep_uid: string
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
        const promises = [
            get_dep()
        ]
        for (const [dep_uid, dep_path] of depMap.entries())
            promises.push(get_preregistcourse(dep_uid, dep_path))
        await Promise.allSettled(promises)
    }

    return {
        deps,
        depMap,
        courses,
        setup,
    }
})
