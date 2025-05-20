import { exec } from 'node:child_process'
import { exit } from 'node:process'

// check for git repository
exec('git rev-parse --show-toplevel', (err) => {
    if (err) {
        process.stderr.write(err.message + '\r\n')
        exit(1)
    }
})
