const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const generatedRoot = path.join(root, 'src', 'fluent', 'generated')
const builtEntryDir = path.join(root, 'dist', 'app', 'update')
const directField = 'u_sdk_repro_target_value'
const scriptedField = 'u_sdk_repro_scripted_target'
const directEntryId = '22222222222222222222222222222222'
const scriptedEntryId = '33333333333333333333333333333333'

const failures = []
const notes = []

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

function fieldBlock(source, field, nextField) {
  const start = source.indexOf(`${field}:`)
  if (start === -1) {
    return ''
  }
  const end = nextField ? source.indexOf(`${nextField}:`, start) : -1
  return source.slice(start, end === -1 ? undefined : end)
}

// 1. Generated Fluent: the direct entry must not be scripted.
const generatedFile = walk(generatedRoot).find((file) => fs.readFileSync(file, 'utf8').includes(directField))

if (!generatedFile) {
  console.error(`No generated ImportSet file contains ${directField}. Run npm run transform first.`)
  process.exit(1)
}

const source = fs.readFileSync(generatedFile, 'utf8')
const direct = fieldBlock(source, directField, scriptedField)
const scripted = fieldBlock(source, scriptedField)

if (direct.includes('useSourceScript: true')) {
  failures.push(`Fluent: ${directField} has useSourceScript: true (input has use_source_script=false).`)
}
if (direct.includes('sourceScript')) {
  notes.push(
    `Fluent: ${directField} still carries the platform placeholder sourceScript. It is inert because scripting stays off.`,
  )
}
if (!scripted.includes('useSourceScript: true')) {
  failures.push(`Fluent: control ${scriptedField} lost useSourceScript: true.`)
}

// 2. Built XML (after npm run build): the platform flag must match the input.
function builtFlag(id) {
  const file = path.join(builtEntryDir, `sys_transform_entry_${id}.xml`)
  if (!fs.existsSync(file)) {
    return undefined
  }
  const match = fs.readFileSync(file, 'utf8').match(/<use_source_script>([^<]*)<\/use_source_script>/)
  return match ? match[1] : ''
}

const directFlag = builtFlag(directEntryId)
const scriptedFlag = builtFlag(scriptedEntryId)

if (directFlag === undefined || scriptedFlag === undefined) {
  notes.push('Built XML not found; run npm run build to check use_source_script in the install output.')
} else {
  if (directFlag !== 'false') {
    failures.push(`Build: direct entry use_source_script=${directFlag || '(empty)'}, expected false.`)
  }
  if (scriptedFlag !== 'true') {
    failures.push(`Build: control entry use_source_script=${scriptedFlag || '(empty)'}, expected true.`)
  }
}

console.log(`Generated file: ${path.relative(root, generatedFile)}`)
for (const note of notes) {
  console.log(`NOTE: ${note}`)
}

if (failures.length > 0) {
  console.error('BUG REPRODUCED: direct mapping was generated as a scripted mapping.')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  console.error(direct.trim())
  process.exit(1)
}

console.log('PASS: direct mapping remained direct.')
