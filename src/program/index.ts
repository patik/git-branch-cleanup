// Side effects
import './side-effects/check-for-git-repo.js'
import './side-effects/handle-control-c.js'

// Program imports
import { exit } from 'node:process'
import { firstAttempt } from './firstAttempt.js'
import { retryFailedDeletions } from './retryFailedDeletions.js'
import { worker } from './state.js'

export default async function program() {
    try {
        await firstAttempt()

        if (worker.failedToDelete.length > 0) {
            await retryFailedDeletions()
        }
    } catch (err: unknown) {
        if (typeof err === 'object' && err) {
            if ('code' in err && typeof err.code === 'number' && err.code === 128) {
                process.stderr.write('ERROR: Not a git repository\r\n')
            } else if ('code' in err && typeof err.code === 'number' && 'message' in err && err.code === 1984) {
                process.stderr.write(`ERROR: ${err.message} \r\n`)
            } else if ('stack' in err) {
                if (err instanceof Error && err.name === 'ExitPromptError') {
                    console.log('\r\n👋 until next time!')
                    exit(0)
                }

                process.stderr.write((err.stack || err) + '\r\n')
            }
        }

        exit(1)
    }
}
