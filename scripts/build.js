const fs = require('fs');
const execa = require('execa')
const packages = fs.readdirSync('packages').filter(path => fs.statSync(`packages/${path}`).isDirectory())
async function build(package) {
    await execa('rollup', ['-c', '--environment', `TARGET:${package}`], { stdio: 'inherit' })
}
async function runParallel(packages, build) {
    const result = []
    packages.forEach(package => result.push(build(package)))
    return Promise.all(result)
}

runParallel(packages, build).then(() => console.log('build finished'))