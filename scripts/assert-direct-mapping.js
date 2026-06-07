const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const generatedRoot = path.join(root, 'src', 'fluent', 'generated')
const targetField = 'u_sdk_repro_target_value'

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return []
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      return walk(fullPath)
    }
    return entry.isFile() && entry.name.endsWith('.now.ts') ? [fullPath] : []
  })
}

const files = walk(generatedRoot)
const generatedFile = files.find((file) => fs.readFileSync(file, 'utf8').includes(targetField))

if (!generatedFile) {
  console.error(`No generated ImportSet file contains ${targetField}. Run npm run transform first.`)
  process.exit(1)
}

const source = fs.readFileSync(generatedFile, 'utf8')
const fieldStart = source.indexOf(`${targetField}:`)
const nextFieldStart = source.indexOf('u_sdk_repro_scripted_target:', fieldStart)
const fieldBlock = source.slice(fieldStart, nextFieldStart === -1 ? undefined : nextFieldStart)

if (fieldBlock.includes('sourceScript') || fieldBlock.includes('useSourceScript: true')) {
  console.error('BUG REPRODUCED: direct mapping was generated as a scripted mapping.')
  console.error(`Generated file: ${path.relative(root, generatedFile)}`)
  console.error(fieldBlock.trim())
  process.exit(1)
}

console.log('PASS: direct mapping remained direct.')
