const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const parseCommit = (commit) => {
  const pieces = commit.split(',')
  const subject = pieces[0]
  const ignore =
    !subject ||
    subject.includes('changelog:') ||
    subject.includes('chore:') ||
    subject.includes('wip:') ||
    subject.includes("Merge branch 'main'")
  return {
    subject: subject,
    date: pieces[1],
    abbrevHash: pieces[2],
    hash: pieces[3],
    isVersionCommit: subject && subject.includes('🎉 Release'),
    ignore,
  }
}

let package = process.argv.find((arg) => arg.includes('package='))
if (package) {
  package = package.replace('package=', '')
}

const repo = path.join(__dirname, '..', 'packages', package)

fs.readFile(repo + '/CHANGELOG.md', 'utf8', async (err, data) => {
  if (err) {
    return console.log(err)
  }

  let regex = /./g

  if (package === 'ui') {
    regex = /v([^\]-]+)-UI/g
  } else {
    regex = /v([^\]-]+)-SDK/g
  }

  const lastTagDocumented = data.match(regex)[0]

  exec(
    `git log --date=short --pretty=format:%s,%ad,%h,%H ${lastTagDocumented}..HEAD ${repo}`,
    (error, stdout) => {
      const newCommits = stdout.trim().split('\n')
      const changelog = newCommits.reduce((changelog, commit) => {
        const { ignore, hash, abbrevHash, subject, date, isVersionCommit } =
          parseCommit(commit)
        if (ignore) {
          return changelog
        }

        const commitLink = `https://github.com/reservoirprotocol/reservoir-kit/commit/${hash}`

        if (isVersionCommit) {
          const version = subject.replace(`🎉 Release ${package} package `, '')
          changelog += `\n## [${version}](${commitLink}) (${
            date.split(' ')[0]
          })\n`
        } else {
          changelog += `\n* ${subject} [${abbrevHash}](${commitLink})`
        }

        return `${changelog}`
      }, '')

      const newChangelog = changelog + '\n' + data

      fs.writeFile(repo + '/CHANGELOG.md', newChangelog, function (err) {
        if (err) {
          return console.log(err)
        }
        console.log(
          '\x1b[32m%s\x1b[0m',
          `Changelog: ${newCommits.length} new commits added`
        )
      })
    }
  )
})
