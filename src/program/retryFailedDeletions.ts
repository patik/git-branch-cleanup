import { checkbox, confirm } from '@inquirer/prompts'
import { exit } from 'node:process'
import { bold, red, yellowBright } from 'yoctocolors'
import { skipConfirmation, worker } from './state.js'

export async function retryFailedDeletions() {
    console.info(
        yellowBright(
            `
⚠️ Not all branches could be removed. You may try again using ${bold('--force')}, or press Ctrl+C to cancel
`,
        ),
    )
    const branchesToRetry = await checkbox({
        message: red('Select branches to forcefully remove'),
        pageSize: 40,
        choices: worker.failedToDelete.map((value) => ({ value })),
    })

    if (branchesToRetry.length === 0) {
        console.info(`
👋 No additional branches were removed.`)
        exit(0)
    }

    const confirmRetry = skipConfirmation
        ? true
        : await confirm({
              message: `Are you sure you want to forcefully remove ${branchesToRetry.length} branch${branchesToRetry.length !== 1 ? 'es' : ''}?`,
              default: false,
          })

    if (!confirmRetry) {
        console.info(`
👋 No additional branches were removed.`)
        exit(0)
    }

    worker.setForce(true)

    await worker.deleteBranches(branchesToRetry)
}
