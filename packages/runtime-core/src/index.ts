export function createRenderer(rendererOptions: any) {
    return {
        createApp(rootComponent: any, rootProps: any) {
            const app = {
                mount(container: Element) {
                    console.log(container, rootComponent, rootProps, rendererOptions)
                }
            }
            return app
        }
    }
}