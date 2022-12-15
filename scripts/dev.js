const execa = require('execa')
const fs = require('fs')
const agrs = process.argv.slice(2)
const package = agrs[0] || 'runtime-dom'

async function run() {
    if (fs.statSync(`packages/${package}`).isDirectory()) {
        await execa('rollup', ['-c', '--environment', `TARGET:${package}`], { stdio: 'inherit' })
    } else {
        log.warn('this package is not a directory')
    }
}
run().then(() => console.log('finished build ' + `${package}`))

