
export const patchEvent = (element: HTMLElement & { _vei?: object }, key: string, value: any) => {
    //对事件缓存
    const invokers: any = element._vei || (element._vei = {})
    const exists = invokers[key] //如果不存在
    if (value && exists) { //需要绑定事件
        exists.value = value
    } else { //
        const eventName = key.slice(2).toLocaleLowerCase()
        if (value) { //绑定新事件
            const invoker = invokers[key] = createInvoker(value)
            element.addEventListener(eventName, invoker)
        } else { //以前绑了，但是需要删除
            element.removeEventListener(eventName, exists)
            invokers[key] = undefined
        }
    }
}
function createInvoker(value: any) {
    const invoker = (e: any) => {
        invoker.value(e)
    }
    invoker.value = value
    return invoker
}
//绑定事件