export const isObject = (value: any): boolean => typeof value === 'object' && value !== null
export const isArray = Array.isArray
export const extend = Object.assign
export const isFunction = (value: any): boolean => typeof value === 'function'
export const isNumber = (value: any): boolean => typeof value === 'number'
export const isString = (value: any): boolean => typeof value === 'string'
export const isIntegerKey = (key: any): boolean => parseInt(key) + '' === key

export const hasOwn = (target: any, key: any): boolean => Object.prototype.hasOwnProperty.call(target, key)
export const hasChanged = (oldVal: any, newVal: any): boolean => oldVal !== newVal

export * from './shapeFlag'