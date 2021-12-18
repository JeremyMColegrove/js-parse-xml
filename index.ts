/**
 * @remark Hey there
 */

import Parser = require("./lib/parser")
import {Options} from "./lib/types"

const defaultOptions: Options = {
    encoding:'utf8',
    stream:false,
    preserve_whitespace:false,
    convert_values:true,
    debug:true,
    benchmark:false
}

function parseStringSync(xml:string, options:Options=defaultOptions) : Object
{
    options = Object.assign({}, defaultOptions, options)
    let parser = new Parser(options)
    parser.feed(xml)
    return parser.finish()
}

export {Parser, parseStringSync}
