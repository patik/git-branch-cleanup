import { exec } from 'node:child_process'

/**
 * Executes a command and returns stdout as a string
 */
export async function stdout(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        return exec(command, (err, stdout, stderr) => {
            if (err || stderr) {
                reject(`getBranch Error: ${err ?? stderr}`)
            } else if (typeof stdout === 'string') {
                resolve(stdout.trim())
            }
        })
    })
}
