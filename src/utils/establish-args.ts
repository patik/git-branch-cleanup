import minimist, { ParsedArgs } from 'minimist'
import { exit } from 'node:process'
import pkg from '../../package.json' with { type: 'json' }

const options = ['version', 'dry-run', 'd', 'prune-all', 'p', 'force', 'f', 'remote', 'r', 'yes', 'y', '_']

export function establishArgs(): ParsedArgs {
    const argv = minimist(process.argv, {
        string: 'remote',
        boolean: ['dry-run', 'prune-all', 'force', 'yes', 'version'],
        alias: { d: 'dry-run', p: 'prune-all', f: 'force', r: 'remote', y: 'yes' },
        default: {
            remote: 'origin',
            force: false,
            yes: false,
        },
    })

    const hasInvalidParams = Object.keys(argv).some((name) => options.indexOf(name) === -1)

    if (hasInvalidParams) {
        console.info(
            'Usage: git prune-branches [-d|--dry-run] [-p|--prune-all] [-f|--force] [-r|--remote <remote>] [-y|--yes] [--version]',
        )
        exit(1)
    }

    if (argv.version) {
        console.log(pkg.version)
        exit(0)
    }

    return argv
}
