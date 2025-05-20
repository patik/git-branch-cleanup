import { establishArgs } from '../utils/establish-args.js'
import FindStale from '../utils/find-stale.js'

const argv = establishArgs()
const skipConfirmation = argv.yes || argv['prune-all']

const worker = new FindStale({
    dryRun: argv['dry-run'],
    pruneAll: argv['prune-all'],
    force: argv.force,
    remote: argv.remote,
})

export { skipConfirmation, worker }
