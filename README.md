# @mini/vue

### Vue3 源代码主体实现

    利用monorepo管理packages

## srart

```bash
pnpm i -w #安装workspace所需要的依赖
pnpm run build #会将packages下的所有的包打包，打包的结果会在每个package下的dist文件下，打包的具体格式，在package下的package.json下的buildOptions中配置
pnpm run dev <package> #传入具体的包名，会单独打包
```
## reactivity

    vue3的响应式系统实现
- [x] reactive 的实现
- [x] ref 的实现
- [x] readonly 的实现
- [x] computed 的实现
- [x] track 依赖收集
- [x] trigger 触发依赖
- [x] 支持嵌套 reactive
- [x] 支持 effect.scheduler
- [x] 支持 shallowReadonly

## runtime-core
    运行时核心模块、具有跨平台能力
- [x] 支持组件类型
- [x] 支持 element 类型
- [x] 初始化 props
- [x] setup 可获取 props 和 context
- [x] 支持 proxy
- [x] 可以在 render 函数中获取 setup 返回的对象
- [x] nextTick 的实现
- [x] 支持 Text 类型节点

## runtime-dom
    dom平台的基本操作
- [x] 支持dom平台的基本操作

