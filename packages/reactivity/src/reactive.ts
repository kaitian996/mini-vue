import { trigger, track } from './effect'
export function reactive<T extends object>(target: T): any {
    return createReactive(target)
}
export function shallowReactive<T extends object>(target: T): any {
    return createReactive(target, true)
}
export function readonly<T extends object>(target: T): any {
    return createReactive(target, false, true)
}
function createReactive(target: object, isShallow: boolean = false, isReadonly: boolean = false) {
    return new Proxy(target, {
        get(target, key, receiver) {
            if (key === 'raw') {
                return target
            }
            track(target, key)
            //拿到结果
            const result = Reflect.get(target, key, receiver)
            if (isShallow) {
                return result
            }
            if (typeof result === 'object' && result !== null) {
                return reactive(result)
            }
            return result
        },
        set(target, key, newVal, receiver) {
            if (isReadonly) {
                console.warn(`${String(key)} is readonly`)
                return true
            }
            const oldVal = (target as any)[key]
            const result = Reflect.set(target, key, newVal, receiver)
            if (target === receiver.raw) {
                if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
                    trigger(target, key)
                }
            }
            return result
        },
        has(target, key) {
            track(target, key)
            return Reflect.has(target, key)
        }
    })
}