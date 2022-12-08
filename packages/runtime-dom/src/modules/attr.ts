
export const patchAttr = (element: HTMLElement, key: string, value: any) => {
    if (value === null) {
        element.removeAttribute(key);
    } else {
        element.setAttribute(key, value);
    }
}