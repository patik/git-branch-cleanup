import { checkbox, confirm } from '@inquirer/prompts'
import { exit } from 'node:process'
import { skipConfirmation, worker } from './state.js'

export async function firstAttempt(): Promise<void> {
    await worker.findStaleBranches()

    if (worker.staleBranches.length === 0) {
        console.info('✅ No stale branches were found')
        exit(0)
    }

    const userSelectedBranches = worker.pruneAll
        ? worker.staleBranches
        : await checkbox({
              message: 'Select branches to remove',
              pageSize: 40,
              choices: worker.staleBranches.map((value) => ({ value })),
          })
    const confirmAnswer = skipConfirmation
        ? true
        : await confirm({
              message: `Are you sure you want to remove ${userSelectedBranches.length} branch${userSelectedBranches.length !== 1 ? 'es' : ''}?`,
              default: false,
          })

    if (!confirmAnswer) {
        console.info('👋 No branches were removed.')
        exit(0)
    }

    await worker.deleteBranches(userSelectedBranches)
}
