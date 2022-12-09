import { createVNode } from "./vnode"

export function createAppAPI(render: Function) {
    return function createApp(rootComponent: any, rootProps: any) {
        const app = {
            _props: rootProps,
            _component: rootComponent,
            _container: null as any,
            mount(container: any) {
                // const vnode = {}
                //1、根据组件创建虚拟节点
                //创建虚拟节点
                const vnode = createVNode(rootComponent, rootProps)

                //调用render
                render(vnode, container)

                app._container = container
            }
        }
        return app
    }
}