import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'
import { createRenderer, h } from '@mini/runtime-core'
import { extend } from '@mini/share'

const rendererOptions = extend({ patchProp }, nodeOps)
//
export function createApp(rootComponent: any, rootProps: any = null) {
    const app: any = createRenderer(rendererOptions).createApp(rootComponent, rootProps)
    const { mount } = app
    app.mount = (containerOrSelector: string) => {
        //清空
        const container: Element | null = nodeOps.querySelector(containerOrSelector)
        container!.innerHTML = ''
        //将组件 渲染成dom
        mount(container)
    }
    return app
}
export {
    rendererOptions
}
export * from '@mini/runtime-core'