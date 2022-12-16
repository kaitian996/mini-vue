import { hasOwn } from "@mini/shared"

export const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        if (key[0] === '$') return //不能访问$开头的变量
        //取值时，要访问 setups
        const { setupState, props, data } = instance
        if (hasOwn(setupState, key)) { //当访问这个数据时，会触发依赖收集
            return setupState[key]
        } else if (hasOwn(props, key)) {
            return props[key]
        } else if (hasOwn(data, key)) {
            return data[key]
        } else {
            return undefined
        }
    },
    set({ _: instance }, key, value) {
        //取值时，要访问 setups
        const { setupState, props, data } = instance
        if (hasOwn(setupState, key)) {
            setupState[key] = value
            return true
        } else if (hasOwn(props, key)) {
            props[key] = value
            return true
        } else if (hasOwn(data, key)) {
            data[key] = value
            return true
        } else {
            return false
        }
    }
} 