import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/events";
import { patchStyle } from "./modules/style";

//针对属性的操作
export const patchProp = (element: HTMLElement, key: string, prevValue: any, nextValue: any) => {
    switch (key) {
        case 'class':
            patchClass(element, nextValue)
            break;
        case 'style':
            patchStyle(element, prevValue, nextValue)
            break;
        default:
            if (/^on[^a-z]/.test(key)) {
                patchEvent(element, key, nextValue) 
            } else {
                patchAttr(element, key, nextValue)
            }
            break;
    }
}