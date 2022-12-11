import { effect } from '@mini/reactivity'
import { ShapeFlags } from '@mini/share'
import { createAppAPI } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'
import { queueJob } from './scheduler'
import { isSameVNodeType, normalizeVNode, TEXT } from './vnode'

export function createRenderer(rendererOptions: any) {
    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        setText: hostSetText,
        nextSibling: hostNextSibling,
        setElementText: hostSetElementText,
    } = rendererOptions

    const setupRenderEffect = (instance, container) => {
        // 创建一个effect，在effect中调用render，当render中访问了setupState,就重新执行
        instance.update = effect(function componentEffect() { //每个组件都有一个effect，vue3是组件级更新，数据变化会重新执行对应的effect
            if (!instance.isMounted) { //没有挂载
                //初次渲染
                const proxyToUse = instance.proxy
                //需要渲染的子树
                const subTree = instance.subTree = instance.render.call(proxyToUse, proxyToUse)
                console.log('subTree', subTree);
                patch(null, subTree, container)
                instance.isMounted = true
            } else { //已经挂载了
                //更新逻辑
                console.log('更新了')
                //之前保存的树
                const prevTree = instance.subTree
                const proxyToUse = instance.proxy
                const nextTree = instance.render.call(proxyToUse, proxyToUse)
                console.log('oldtree and newtree', prevTree, nextTree)
                patch(prevTree, nextTree, container)
                //打完补丁之后,应该会将新的nextTree赋给instance.subTree
                // instance.subTree =nextTree
            }
        }, {
            scheduler: queueJob
        })
    }
    //----------处理组件-----------------------------------
    //初始化
    const mountComponent = (initialVNode, container) => {
        //一定是STATEFUL_COMPONENT
        console.log('组件初始化挂载')
        //1、先有实例
        const instance = initialVNode.component = createComponentInstance(initialVNode)
        //2、将所需要的数据解析到实例身上，初始化实例
        setupComponent(instance)
        //3、创建effect，让render执行
        setupRenderEffect(instance, container)
    }
    const processComponent = (n1, n2, container) => {
        if (n1 === null) { //初始化
            mountComponent(n2, container)
        } else {

        }
    }

    //--------------处理元素--------------------------------
    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            const child = normalizeVNode(children[i])
            patch(null, child, container)
        }
    }
    const mountElement = (vnode, container, anchor = null) => {
        //递归渲染
        const { props, shapeFlag, type, children } = vnode
        const el = vnode.el = hostCreateElement(type)
        if (props) {
            for (const key in props) {
                hostPatchProp(el, key, null, props[key])
            }
        }
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, children) //直接创建文本
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { //是数组
            mountChildren(children, el)
        }
        hostInsert(el, container, anchor)
    }
    //更新属性
    const patchProps = (oldProps, newProps, el) => {
        if (oldProps !== newProps) {
            //新增或者修改
            for (const key in newProps) {
                const prev = oldProps[key]
                const next = newProps[key]
                if (prev !== next) {
                    hostPatchProp(el, key, prev, next)
                }
            }
            //删除
            for (const key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, oldProps[key], null)
                }
            }
        }
    }
    //卸载元素
    const unmount = (oldVNode) => {
        hostRemove(oldVNode.el)
    }
    const unmountChildren = (children) => {
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            unmount(child)
        }
    }
    //diff算法
    const patchKeyedChildren = (n1, n2, container) => {

    }
    //更新儿子
    const patchChildren = (n1, n2, container) => {
        const c1 = n1.children //老儿子
        const c2 = n2.children //新儿子
        //老的有儿子 新的没儿子 新的有儿子，老的没儿子 新老都是文本
        const prevShapeFlag = n1.shapeFlag //表示儿子状态
        const shapeFlag = n2.shapeFlag
        //新的有三种情况 文本 、数组 、空
        //老的有三种情况 文本、数组、空
        if (shapeFlag & ShapeFlags.NULL_CHILDREN) { //新的为空
            if (prevShapeFlag & ShapeFlags.NULL_CHILDREN) { //老的为空
                //啥也不做
                console.log('新的为空，老的为空,啥也不做', c1, c2)
            } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) { //老的为数组
                unmountChildren(c1) //卸载老的数组
                console.log('新的为空，老的为数组,卸载老的数组', c1, c2)
            } else { //老的为文本
                hostSetElementText(container, '')
                console.log('新的为空，老的为文本,清空文本', c1, c2)
            }
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { //新的为数组
            if (prevShapeFlag & ShapeFlags.NULL_CHILDREN) { //老的为空
                mountChildren(c2, container)
                console.log('新的为数组，老的为空,挂载新的', c1, c2)
            } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) { //老的为数组
                // TODO:diff算法
                patchKeyedChildren(c1, c2, container)
                console.log('新的为数组，老的为数组,diff算法', c1, c2)
            } else { //老的为文本
                hostSetElementText(container, '')
                mountChildren(c2, container)
                console.log('新的为数组，老的为文本,清空文本，再挂载新的数组', c1, c2)
            }
        } else { //新的为文本
            if (prevShapeFlag & ShapeFlags.NULL_CHILDREN) { //老的为空
                hostSetElementText(container, c2)
                console.log('新的为文本，老的为空,设置文本', c1, c2)
            } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) { //老的为数组
                unmountChildren(c1) //卸载老的
                hostSetElementText(container, c2)
                console.log('新的为文本，老的为数组，卸载数组', c1, c2)
            } else { //老的为文本
                hostSetElementText(container, c2)
                console.log('新的为文本，老的为文本,设置文本', c1, c2)
            }
        }
    }
    //diff元素
    const patchElement = (n1, n2, container) => {
        //元素是相同节点
        const el = n2.el = n1.el //dom值给n2
        //更新属性
        const oldProps = n1.props || {}
        const newProps = n2.props || {}
        patchProps(oldProps, newProps, el)
        //更新儿子
        patchChildren(n1, n2, el)
    }
    //元素过程
    const processElement = (n1, n2, container, anchor) => {
        if (n1 === null) { //元素挂载
            mountElement(n2, container, anchor)
        } else { //元素更新
            patchElement(n1, n2, container)
        }
    }
    //--------------处理文本--------------------------------
    const processText = (n1, n2, container) => {
        if (n1 === null) { //创建文本，挂载
            hostInsert(n2.el = hostCreateText(n2.children), container)
        }
    }
    /**
     * 
     * @param n1 old VNode
     * @param n2 new VNode
     * @param container 挂载容器
     * @param anchor 挂载元素时的参考位置
     */
    //---------------patch方法，根据不同情况，path组件或者元素------
    const patch = (n1, n2, container, anchor = null) => {
        //针对不同元素做不同初始化操作
        const { shapeFlag, type } = n2
        if (n1 && !isSameVNodeType(n1, n2)) {
            //把n1删除
            anchor = hostNextSibling(n1.el)
            unmount(n1)
            n1 = null
        }
        switch (type) {
            case TEXT:
                processText(n1, n2, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    console.log('patch元素', n2);
                    processElement(n1, n2, container, anchor)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    console.log('patch组件');
                    processComponent(n1, n2, container)
                }
                break;
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
 * (2) 将这个VNode 和container传入render方法，render调用patch(null,vnode,container)进行渲染
 */


/**
 * patch 中转函数 通过传入的参数不同，派发不同的更新,
 * 参数n1、n2、container
 * n1:oldVnode n2:newVnode container:需要挂载的容器
 * ==>patch 逻辑<==
 * 提取新的n2的shapeFlag和type
 * 
 * (1)如果type是TEXT,则进入processText流程
 * 否则，则判断shapeflag是什么类型
 * 
 * (2)命中component，则进入processComponent
 *  --如果n1是null，则说明是新挂载节点，进入mountComponent
 *      --先根据Vnode创建一个instance实例，然后再设置实例的属性，然后setupComponent，在这里面先初始化各种props等等，再执行setup函数，将执行结果保存进实例的setupState，
 *        并且会将render函数挂载到实例身上，最终一个完整的实例属性会被创建出来，最终，会创建一个setupRenderEffect,这个effect就是一个组件的依赖(vue3的依赖是组件级的依赖)，
 *  ==> effect的中函数，根据组件的isMounted属性来判断是否已经被挂载
 *          --如果没有被挂载，则会执行组件的render函数，生成一颗subTree,然后再调用patch(null,subTree,container)
 *          --如果已经被挂载，则会重新通过render函数生成新的subTree,然后进行patch(prevTree, nextTree, container),patch完成后，更新实例的subTree
 *  --如果不是则需要patch
 * 
 * (3)命中element，则进入processElement
 * --如果n1是null，则说明是新挂载节点,进入mountElement
 *      --根据其中的type,创建对应的dom元素，并挂载到这个vnode身上，然后patchProps,判断children,
 *        如果是单纯的文本，就创建文本，就设置文本，
 *        如果不是文本，是数组，就调用mountChildren
 *        --循环数组，如果是文本就创建文本VNode，然后调用pach(null, child, container),就进行了深度递归，最终构建出一颗完整的dom树，根节点的VNode保存了完整的一个VNode的树，就完成了Vnode到dom树映射
 * --如果n1不为null,则需要进行patchElement
 *      --n1为旧的树，n2为新树，并且两者的type一定相同，因为如果不同，在patch的时候就会卸载掉n1,然后将n1置为null,进入新的mount流程
 *        先patchProps，将属性更新
 *        再patchChildren，更新儿子
 *        --patchChildren进行比较,旧的有三种情况的儿子：null,text,array,新的有三种情况的儿子：null,text,array
 *         ① 新的为null:
 *          --旧的为null:啥也不做
 *          --旧的为text:设置文本即可
 *          --旧的为array:卸载掉数组中的元素
 *         ② 新的为文本：
 *          --旧的为null：设置文本
 *          --旧的为文本:更新文本
 *          --旧的为array：卸载旧的数组元素，然后设置文本
 *         ③ 新的为array:
 *          --旧的为null:调用mountChildren，将新的数组中的所有VNode转化为真实dom
 *          --旧的为text:置空文本，mountChildren
 *          --旧的为array:diff算法
 *  
 */