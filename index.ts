import Parser = require("./lib/parser")
import {Options} from "./lib/types"

function parseStringSync(xml:string, options?:Options) : Object
{
    let parser = new Parser(options)
    parser.feed(xml)
    return parser.finish()
}

export {Parser, parseStringSync}
