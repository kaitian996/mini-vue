import { isObject } from "@mini/shared";
import { createVNode, isVNode } from "./vnode";

export function h(type, propsOrChildren, children) {
    const l = arguments.length
    if (l === 2) { //类型+属性 类型+孩子 
        //如果第二个参数不是对象，那一定是孩子 儿子节点要么是字符串，要么是数组
        if (isObject(propsOrChildren)) {
            if (isVNode(propsOrChildren)) { //如果是Vonde
                return createVNode(type, null, [propsOrChildren])
            }
            return createVNode(type, propsOrChildren)
        } else {
            return createVNode(type, null, propsOrChildren)
        }
    } else {
        if (l > 3) {
            children = Array.prototype.slice.call(arguments, 2)
        } else if (l === 3 && isVNode(children)) {
            children = [children]
        }
        return createVNode(type, propsOrChildren, children)
    }
}