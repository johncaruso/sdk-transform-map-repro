const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const fixtureRoot = path.join(root, 'fixtures', 'metadata')
const metadataRoot = path.join(root, 'metadata')
const generatedRoot = path.join(root, 'src', 'fluent', 'generated')

function removeIfExists(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true })
  }
}

function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true })

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath)
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath)
    }
  }
}

removeIfExists(metadataRoot)
removeIfExists(generatedRoot)
copyDirectory(fixtureRoot, metadataRoot)

console.log('Restored metadata fixture and cleared generated output.')
