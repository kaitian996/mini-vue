import { reactive } from './reactive'
export function ref<T>(target: T) {
    const wrapper = {
        value: target
    }
    Object.defineProperty(target, '__v_isRef', {
        value: true
    })
    return reactive(wrapper)
}
export function toRef(target: object, key: string) {
    const wrapper = {
        get value() {
            return (target as any)[key]
        },
        set value(value) {
            (target as any)[key] = value
        }
    }
    return wrapper
}
export function toRefs(target: object) {
    const result = {} as any
    for (const key in target) {
        result[key] = (target as any)[key]
    }
    return result
}