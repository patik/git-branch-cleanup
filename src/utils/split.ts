// Split the stdout output
// and will take out all the empty lines
const split = (stdout: string) => {
    return (
        stdout
            ?.toString()
            .split('\n')
            .map((line) => line.trim())
            // remove empty
            .filter((line) => line != '')
    )
}

export default split
