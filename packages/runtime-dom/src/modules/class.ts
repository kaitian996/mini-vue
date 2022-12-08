
export const patchClass = (element: HTMLElement, nextValue: any) => {
    if (nextValue === null) {
        nextValue = ''
    }
    element.className = nextValue
}