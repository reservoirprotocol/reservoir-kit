const fs = require('fs')
const path = require('path')
const gitlog = require('gitlog').default

let package = process.argv.find((arg) => arg.includes('package='))
if (package) {
  package = package.replace('package=', '')
}

const repo = path.join(__dirname, '..', 'packages', package)
const options = {
  repo: repo,
  number: -1000000000000000000000000,
  execOptions: { maxBuffer: 1000 * 1024 },
  fields: ['subject', 'hash', 'abbrevHash', 'authorDate'],
  file: repo,
}

const { gitlogPromise } = require('gitlog')

gitlogPromise(options)
  .then((commits) => {
    const changelog = commits.reduce((changelog, commit) => {
      if (
        !commit.subject ||
        commit.subject.includes('changelog:') ||
        commit.subject.includes('chore:') ||
        commit.subject.includes('wip:')
      ) {
        return changelog
      }

      let version = null
      const commitLink = `https://github.com/reservoirprotocol/reservoir-kit/commit/${commit.hash}`

      if (package === 'ui') {
        if (commit.subject.includes('Prerelease ui package')) {
          version = commit.subject.replace('✨ Prerelease ui package v', '')
        } else if (commit.subject.includes('Release ui package')) {
          version = commit.subject.replace('🎉 Release ui package v', '')
        } else if (commit.subject.includes('🎉 ui v')) {
          version = commit.subject.replace('🎉 ui v', '')
        } else if (commit.subject.includes('v0.0.')) {
          version = commit.subject.replace('v0.0.', '')
        }
      } else if (package === 'client') {
        if (commit.subject.includes('🎉 Release client package v')) {
          version = commit.subject.replace('🎉 Release client package v', '')
        }
      }

      if (version !== null) {
        changelog += `\n## [${version}](${commitLink}) (${
          commit.authorDate.split(' ')[0]
        })\n`
      } else {
        changelog += `\n* ${commit.subject} [${commit.abbrevHash}](${commitLink})`
      }

      return `${changelog}`
    }, '')

    const data = new Uint8Array(Buffer.from(commits))
    fs.writeFile(repo + '/CHANGELOG.md', changelog, function (err) {
      if (err) {
        return console.log(err)
      }
      console.log(
        '\x1b[32m%s\x1b[0m',
        `Changelog was generated from ${commits.length} commits`
      )
    })
  })
  .catch((err) => console.log('\x1b[31m%s\x1b[0m', err))
