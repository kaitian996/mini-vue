
export const patchStyle = (element: HTMLElement, prevValue: any, nextValue: any) => {
    const style: any = element.style //之前样式
    if (nextValue === null) {
        element.removeAttribute('style')
    } else {
        //老的有新的没有
        if (prevValue) { //需要删除
            for (const key in prevValue) {
                if (nextValue[key] === null) { //需要删除
                    style[key] = ''
                }
            }
        }
        //添加新的style
        for (const key in nextValue) {
            style[key] = nextValue[key]
        }
    }
}