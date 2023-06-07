import { DepPath, CourseWrap } from '@/types'

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function waitNextFrame() {
    return new Promise((resolve) => requestAnimationFrame(resolve))
}

export function isUUID(str: string) {
    return /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/.test(
        str,
    )
}

// from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
export async function digestMessage(message: any) {
    const msgUint8 = new TextEncoder().encode(JSON.stringify(message)) // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('') // convert bytes to hex string
    return hashHex
}

export function coursewrap2title({
    course: { cos_id, cos_cname, cos_ename },
}: CourseWrap) {
    return `${cos_id} ${cos_cname} ${cos_ename}`
}

export function limitStr(str: string, limit_front: number, limit_back: number = 0) {
    if (str.length <= limit_front + limit_back) return str
    return str.slice(0, limit_front) + ' ... ' + str.slice(-limit_back)
}

export function path2str({ path }: { path: DepPath }) {
    return path.map((d) => d.label).join(' / ')
}

export async function goDep(path: DepPath) {
    const label = document.querySelector(
        '.ant-cascader-picker-label',
    ) as HTMLElement
    if (label.innerText === path2str({ path })) return false

    const picker = document.querySelector(
        '.ant-cascader-picker-label',
    ) as HTMLElement
    picker.click()
    await waitNextFrame()
    const menu = document.querySelector('.ant-cascader-menus') as HTMLElement
    const div = menu.children[0] as HTMLElement
    let r = 0
    for (const { value, label } of path) {
        const selector = value === '*' ? ':first-child' : `[title="${label}"]`
        while (true) {
            await waitNextFrame()
            const cur = div.children[r] as HTMLElement
            if (!cur) continue
            const el = cur.querySelector(selector) as HTMLElement
            if (!el) continue
            el.click()
            r += 1
            break
        }
    }
    return true
}

export async function waitDomChanged(
    target: Node,
    options: MutationObserverInit,
) {
    return new Promise((resolve) => {
        const observer = new MutationObserver((mutation) => {
            observer.disconnect()
            resolve(mutation)
        })
        observer.observe(target, options)
    })
}
