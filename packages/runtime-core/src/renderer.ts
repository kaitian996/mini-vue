import { effect } from '@mini/reactivity'
import { ShapeFlags } from '@mini/share'
import { createAppAPI } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'

export function createRenderer(rendererOptions: any) {
    const setupRenderEffect = (instance) => {
        // 创建一个effect，在effect中调用render，当render中访问了setupState,就重新执行
        effect(function componentEffect() { //每个组件都有一个effect，vue3是组件级更新，数据变化会重新执行对应的effect
            if (!instance.isMounted) { //没有挂载
                //初次渲染
                const proxyToUse = instance.proxy
                //需要渲染的子树
                const subTree = instance.subTree = instance.render.call(proxyToUse, proxyToUse)
                console.log('subTree: ', subTree);
                instance.isMounted = true
            } else { //已经挂载了
                //更新逻辑
                
            }
        })
    }
    //初始化
    const mountComponent = (initialVNode, container) => {
        //一定是STATEFUL_COMPONENT
        console.log('组件初始化挂载')
        //1、先有实例
        const instance = initialVNode.component = createComponentInstance(initialVNode)
        //2、将所需要的数据解析到实例身上，初始化实例
        setupComponent(instance)
        //3、创建effect，让render执行
        setupRenderEffect(instance)
    }
    const processComponent = (n1, n2, container) => {
        if (n1 === null) { //初始化
            mountComponent(n2, container)
        } else {

        }
    }
    const patch = (n1, n2, container) => {
        //针对不同元素做不同初始化操作
        const { shapeFlag } = n2
        if (shapeFlag & ShapeFlags.ELEMENT) {
            console.log('patch元素');
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
            console.log('patch组件');
            processComponent(n1, n2, container)
        }
    }
    const render = (vnode, container) => {
        //core核心，根据不同的虚拟节点，创建真实元素，
        patch(null, vnode, container)
    }
    return {
        createApp: createAppAPI(render)
    }
}
/**
 * createRender是总的方法，目的是创建一个渲染器,传入参数时不同平台的nodeOptions,包含了平台的增删改查等等方法
 * 返回一个对象 对象有一个createApp方法，这个方法接受两个参数，一个rootComponent，一个rootProps
 * 当用户传入两个参数时，返回一个app对象，这个对象里面保存了当前的app的属性 
 * 如rootComponent rootProps contanier 
 * 最重要的是mount方法，这个mount方法会调用
 * (1) createVNode,将传进来的rootComponent和rootProps转化为VNode
 * (2) 将这个VNode 和container传入render方法，进行渲染
 * (3) 判断render的VNode是什么类型：
 *  ---如果是组件，就走processComponent逻辑：
 *          ---如果是初次渲染，就走mountComponent逻辑：
 *              (1) 首先会生成组件实例
 *              (2) 配置好组件的实例，如组件实例的属性，并且给组件的render函数做代理，确保组件的render函数与reactivity系统挂钩
 *              (3) 和响应式系统挂钩之后，就可以用effect传入需要的逻辑，如果是挂载，就直接挂载，如果是更新，就执行更新逻辑
 */