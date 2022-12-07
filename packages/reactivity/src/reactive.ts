import { trigger, track } from './effect'
export function reactive<T extends object>(target: T) {
    return new Proxy(target, {
        get(target, key, receiver) {
            track(target, key)
            return Reflect.get(target, key, receiver)
        },
        set(target, key, newVal, receiver) {
            Reflect.set(target, key, newVal, receiver)
            trigger(target, key)
            return true;
        },
        has(target, key) {
            track(target, key)
            return Reflect.has(target, key)
        }
    })
}