import assert from 'assert'
import child_process, { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { argv } from 'node:process'
import { fileURLToPath } from 'node:url'
import { green } from 'yoctocolors'

const onlyPrepare = argv.find((one) => one === '--prepare')
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const bin = path.join(__dirname, '../dist/index.js')
const isCI = process.argv[2]?.split('=')[1] === 'true'

let tempdir: string = process.argv[3]?.split('=')[1] || ''
let workingDir: string = ''

const setup = () => {
    if (isCI) {
        child_process.execSync('git config --global user.email "you@example.com"', { cwd: tempdir })
        child_process.execSync('git config --global user.name "Your Name"', { cwd: tempdir })
    }

    if (!tempdir) {
        const tmp = os.tmpdir()
        tempdir = mkdtempSync(tmp + path.sep + 'git-prune-branches-')
    }

    const bareDir = tempdir + path.sep + 'bare'
    workingDir = tempdir + path.sep + 'working'

    const file = `${workingDir}${path.sep}lolipop`

    mkdirSync(bareDir)

    console.log(`Using "${tempdir}" dir`)

    // create bare repository
    child_process.execSync('git init --bare --initial-branch=main', { cwd: bareDir })

    // clone repository
    child_process.execSync('git clone bare working', { cwd: tempdir })

    // create initial commit
    writeFileSync(file, 'lolipop content')
    child_process.execSync('git add lolipop', { cwd: workingDir })
    child_process.execSync('git commit -m "inital commit"', { cwd: workingDir })

    // create new branch, which will be deleted by -d flag
    child_process.execSync('git branch feature/fast-forwarded', { cwd: workingDir })
    // create another branch with special character
    child_process.execSync('git branch "#333-work"', { cwd: workingDir })
    // create branch with renamed name, which is deleted on remote
    child_process.execSync('git branch chore/local-name-deleted', { cwd: workingDir })
    // create branch with renamed name, which is NOT deleted on remote
    child_process.execSync('git branch chore/local-name-persistent', { cwd: workingDir })
    // create new branch, which can be deleted only with -D flag
    child_process.execSync('git branch no-ff', { cwd: workingDir })

    // checkout working branch
    child_process.execSync('git checkout no-ff', { cwd: workingDir })

    // update file content
    writeFileSync(file, 'lolipop content changed')
    child_process.execSync('git commit -a -m "second commit"', { cwd: workingDir })

    // push all the branches to the remote and update config
    child_process.execSync('git push origin -u main', { cwd: workingDir })
    child_process.execSync('git push origin -u feature/fast-forwarded', { cwd: workingDir })
    child_process.execSync('git push origin -u "#333-work"', { cwd: workingDir })
    child_process.execSync('git push origin -u chore/local-name-deleted:chore/remote-name-deleted', { cwd: workingDir })
    child_process.execSync('git push origin -u chore/local-name-persistent:chore/remote-name-persistent', {
        cwd: workingDir,
    })
    child_process.execSync('git push origin -u no-ff', { cwd: workingDir })

    // remove all the branches from the remote, except for the local-name
    child_process.execSync('git push origin :feature/fast-forwarded', { cwd: workingDir })
    child_process.execSync('git push origin :no-ff', { cwd: workingDir })
    child_process.execSync('git push origin :"#333-work"', { cwd: workingDir })
    child_process.execSync('git push origin :chore/remote-name-deleted', { cwd: workingDir })

    // checkout main branch
    child_process.execSync('git checkout main', { cwd: workingDir })
}

const test_nothing = () => {
    const output = execFileSync('node', [bin, '--prune-all', '--dry-run'], {
        cwd: workingDir,
        encoding: 'utf8',
    })

    console.log(`------ test_nothing ------
${output}
-------------------`)

    assert.equal(output.indexOf('chore/local-name-persistent'), -1)
    assert.notEqual(output.indexOf(' chore/local-name-deleted'), -1)
    assert.notEqual(output.indexOf(' #333-work'), -1)
    assert.notEqual(output.indexOf(' feature/fast-forwarded'), -1)
    assert.notEqual(output.indexOf(' no-ff'), -1)
}

const testing_prune = () => {
    const output = child_process.execFileSync('node', [bin, '--prune-all'], {
        cwd: workingDir,
        encoding: 'utf8',
    })

    console.log(`------ test_prune ------
${output}
-------------------`)

    assert.notEqual(output.indexOf('Deleted branch #333-work'), -1)
    assert.notEqual(output.indexOf('Deleted branch feature/fast-forwarded'), -1)
    assert.notEqual(output.indexOf(' no-ff'), -1)
}

const testing_force = () => {
    const output = child_process.execFileSync('node', [bin, '--prune-all', '--force'], {
        cwd: workingDir,
        encoding: 'utf8',
    })

    console.log(`------ test_force ------
${output}
-------------------`)

    assert.notEqual(output.indexOf('Deleted branch no-ff'), -1)
}

setup()

if (onlyPrepare) {
    console.log(`All prepared

${workingDir}
`)
} else {
    test_nothing()
    testing_prune()
    testing_force()
    console.log(green('All tests passed!'))
}
