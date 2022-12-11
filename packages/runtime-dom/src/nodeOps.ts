export const nodeOps = {
    //createElement,不同平台创建元素不同
    //节点属性
    createElement: (tagName: string) => document.createElement(tagName),
    //删除
    remove: (child: Element) => {
        const parent = child.parentNode
        if (parent) {
            parent.removeChild(child)
        }
    },
    //增
    insert: (child: Element, parent: Element, anchor: Element | null = null) => {
        parent.insertBefore(child, anchor)
    },
    //查
    querySelector: (selector: string) => document.querySelector(selector),
    setElementText: (element: Element, text: string) => element.textContent = text,
    nextSibling: (node: Element) => node.nextSibling,
    //文本操作
    createText: (text: string) => document.createTextNode(text),
    setText: (node: Node, text: string) => node.nodeValue = text
}