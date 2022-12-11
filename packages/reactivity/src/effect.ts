type EffectOptions = {
    scheduler?: (...args: any[]) => any;
    lazy?: boolean;
}
export let activeEffect: any
let uid: number = 0
export function effect(fn: Function, options?: EffectOptions) {
    let parent
    const effectFn: any = () => {
        cleanup(effectFn)
        parent = activeEffect //指向parent
        activeEffect = effectFn
        const res = fn() //
        activeEffect = parent //执行函数结束后，将activeEffect还给parent
        return res
    }
    effectFn.deps = []
    effectFn.options = options
    effectFn.id = uid++ //保存一个id，为后续effectFn排序的时候比较大小使用
    if (!options?.lazy) {
        effectFn()
    }
    return effectFn
}
/**
 * 
 * @param target 收集的对象
 * @param key key
 */
type Dep = Set<Function>
type keyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<object, keyToDepMap>()
export function track(target: object, key: string | symbol) {
    /**
     * taget--key ----[effect1,effect2]
     */
    if (!activeEffect) return
    let depMap = targetMap.get(target)
    if (!depMap) {
        targetMap.set(target, (depMap = new Map()))
    }

    let deps = depMap.get(key)
    if (!deps) {
        depMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
    //将依赖添加到数组中
    activeEffect.deps.push(deps)
    console.log('触发track');

}

export function trigger(taget: object, key: string | symbol) {
    const depMap = targetMap.get(taget)
    if (!depMap) return
    const effects = depMap.get(key)
    const effectToRun = new Set<any>()
    effects && effects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
            effectToRun.add(effectFn)
        }
    })
    effectToRun.forEach(effectFn => {
        if (effectFn?.options?.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    })
    console.log('触发trigger');

}

function cleanup(effectFn: any) {
    for (let i = 0; i < effectFn.deps.length; i++) {
        const deps = effectFn.deps[i]
        deps.delete(effectFn)
    }
    effectFn.deps.length = 0
}