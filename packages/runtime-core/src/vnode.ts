import { isArray, isObject, isString, ShapeFlags } from "@mini/share"

export function createVNode(type: any, props: any, children: any = null) {
    //根据type区分
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0
    //给虚拟节点加一个类型
    const vnode = {
        __v_isVnode: true,
        type, //类型  Component 或者string 如果是Component 则是一个对象，否则是一个string
        props,
        children, //
        component: null as any, //存放组件实例，经过createComponentInstance后的实例
        el: null as any,  //会将虚拟节点和真实节点对应起来
        key: props && props.key, //用来diff
        shapeFlag //类型
    }
    normalizeChildren(vnode, children)
    return vnode
}
function normalizeChildren(vnode, children) {
    let type = 0
    if (children === null) { //

    } else if (isArray(children)) {
        type = ShapeFlags.ARRAY_CHILDREN
    } else {
        type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type //判断出儿子类型和自己的类型
}
export function isVNode(vnode) {
    return vnode.__v_isVnode
}