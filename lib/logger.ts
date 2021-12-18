
const LINE_ONLY = "%s\x1b[0m"

const YELLOW = "\x1b[33m%s\x1b[0m"
const RED = "\x1b[31m"
const MAGENTA = "\x1b[35m"
const BLACK = "\x1b[30m"
//Background colors
const BGRED = "\x1b[41m"
const BGYELLOW = "\x1b[43m"
const RESET = "\x1b[0m"


class Logger {
    // print out warnings and errors
    warning(message: string) : void
    {
        console.warn(BGYELLOW, BLACK, "WARN", RESET, MAGENTA,"js-parse-xml", RESET, message)
    }

    error(message: string) : void
    {
        console.error(BGRED, BLACK, "ERROR", RESET, MAGENTA,"js-parse-xml", RESET, message)
    }
}

export = Logger