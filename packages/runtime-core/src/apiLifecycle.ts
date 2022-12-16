import { currentInstance, setCurrentInstance } from './component'
export const enum LifecycleHooks {
    BEFORE_CREATE = 'bc',
    CREATED = 'c',
    BEFORE_MOUNT = 'bm',
    MOUNTED = 'm',
    BEFORE_UPDATE = 'bu',
    UPDATED = 'u',
    BEFORE_UNMOUNT = 'bum',
    UNMOUNTED = 'um',
    DEACTIVATED = 'da',
    ACTIVATED = 'a',
    RENDER_TRIGGERED = 'rtg',
    RENDER_TRACKED = 'rtc',
    ERROR_CAPTURED = 'ec',
    SERVER_PREFETCH = 'sp'
}
export function invokerArrayFns(fns: Function[]) {
    for (let i = 0; i < fns.length; i++) {
        fns[i]()
    }
}
function injectHook(type: LifecycleHooks, hook: Function, target: object | null) {
    if (!target) {
        return console.warn('injectHook APIs can only be used in setup()')
    } else {
        const hooks: Function[] = target[type] || (target[type] = [])
        //包装一下钩子
        const wrap = () => {
            setCurrentInstance(target)  //设置currentInstance为自己的 在执行钩子的时候
            hook.call(target)
            setCurrentInstance(null) //
        }
        hooks.push(wrap)
    }
}
function createHook(lifecycle: LifecycleHooks) {
    return (hook: Function, target: object | null = currentInstance) => { //target用来表示他是哪个实例的钩子
        injectHook(lifecycle, hook, target)
    }
}
export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMount = createHook(LifecycleHooks.MOUNTED)
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)
export const onUpdated = createHook(LifecycleHooks.UPDATED)