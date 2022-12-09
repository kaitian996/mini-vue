import { isFunction, isObject, ShapeFlags } from "@mini/share"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
//创建一个实例
export function createComponentInstance(vnode) {
    const instance = { //组件实例
        vnode, //初始的VNode
        type: vnode.type, //type 一定是一个组件对象
        props: {},
        attrs: {},
        slots: {},
        ctx: {},
        data: {},
        render: null,
        proxy: {},
        setupState: {}, //如果setup返回一个对象，这个对象会作为setupState
        isMounted: false, //表示组件是否挂载了
    }
    instance.ctx = { _: instance }
    return instance
}
//配置对应的实例属性
export function setupComponent(instance) {
    const { props, children } = instance.vnode
    const { data } = instance.type
    //将props解析出props 和attrs,放到instance上 
    instance.props = props  //initProps()
    instance.children = children // initSlot()
    //TODO：后续修改
    if (!isFunction(data) && data) {
        console.warn(`${data} must be call as a retrun of function`);
    } else if (data) {
        instance.data = data()
    }
    //这是一个带状态的组件
    //调用setup,用setup返回值填充setupState和对应的render方法
    setupStatefulComponent(instance) //执行setup函数

}
//解析状态,调用setup和render函数
function setupStatefulComponent(instance) {
    //代理,传递给render函数的参数
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)
    //获取组件类型 拿到组件的setup方法
    const Component = instance.type  //当有状态的组件 type为传入的对象
    const { setup } = Component
    //-------处理没有setup、render情况-----
    if (setup) {
        const setupContext = createSetupContext(instance)
        //调用setup,并接受返回值
        const setupResult = setup(instance.props, setupContext)
        //判断setup返回值
        handleSetupResult(instance, setupResult)
    } else {
        finisheComponentSetup(instance) //完成组件的启动
    }
}
function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) {
        instance.render = setupResult
    } else if (isObject(setupResult)) {
        instance.setupState = setupResult
        //再脱ref
    }
    //完成了组件的启动
    finisheComponentSetup(instance)
}
function finisheComponentSetup(instance) {
    const Component = instance.type
    //如果实例上没render，就在Component身上找render
    if (!instance.render) {
        if (!Component.render && Component.template) {
            console.log('编译模板')
            //将模板编译后的render赋值给Component
            Component.render = Component.template
        }
        //现在Component身上有render了，再赋值给实例
        instance.render = Component.render
    }
    console.log('完成结果后的', instance?.render?.toString())
    //对vue2.0API做兼容处理
    //applyOptions
}
function createSetupContext(instance) {
    return {
        attrs: instance.attrs,
        props: instance.props,
        slots: instance.slots,
        emit: () => { },
        expose: () => { }
    }
}

/**
 * 首先创建组件实例，实例包括且扩充了VNode的属性，随后初始化实例，将VNode的一下相关的东西初始化到实例身上，然后如果组件是有状态的
 * 将初始化状态
 * (1)调用setup函数
 * (2)调用组件的render函数
 * 
 */