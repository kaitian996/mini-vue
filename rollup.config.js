import json from '@rollup/plugin-json'
import ts from 'rollup-plugin-typescript2'
import resolvePlugin from '@rollup/plugin-node-resolve'
import path from 'path'
//拿到要打的包根目录
const packagesDir = path.resolve(__dirname, 'packages')
//要打的包
const packageDir = path.resolve(packagesDir, process.env.TARGET)
//工具函数，能拿到当前包下的文件
const resolve = p => path.resolve(packageDir, p)
const packageJson = require(resolve('package.json'))
const buildOptions = packageJson.buildOptions || {}
const fileName = path.basename(packageDir)
const moduleName = buildOptions.name

function createConfig(buildOptions, fileName, moduleName) {
    const ouputOptions = {
        "esm-bundler": {
            file: resolve(`dist/${fileName}.esm-bundler.js`),
            format: 'es'
        },
        "esm-browser": {
            file: resolve(`dist/${fileName}.esm-browser.js`),
            format: 'es'
        },
        "cjs": {
            file: resolve(`dist/${fileName}.cjs.js`),
            format: 'cjs'
        },
        "global": {
            file: resolve(`dist/${fileName}.global.js`),
            format: 'iife'
        }
    }
    return buildOptions.formats.map(format => {
        const output = ouputOptions[format]
        output.name = moduleName
        output.sourcemap = true
        return {
            input: resolve('src/index.ts'),
            output,
            plugins: [
                json(),
                ts({
                    tsconfig: path.resolve(__dirname, 'tsconfig.json')
                }),
                resolvePlugin()
            ]
        }
    })
}

export default createConfig(buildOptions, fileName, moduleName)