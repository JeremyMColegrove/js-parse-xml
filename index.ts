import fs = require("fs")

import Parser = require("./lib/parser")
import {Options} from "./lib/types"

function parseStringSync(xml:string, options?:Options) : Object
{
    let parser = new Parser(options)
    parser.feed(xml)
    return parser.finish()
}

function parseFileSync(filename:string, options?:Options) : Object
{
    let encoding:BufferEncoding = "utf-8"
    if (options && options.encoding) encoding = options.encoding
    
    let xml = fs.readFileSync(filename, encoding)
    let parser = new Parser(options)
    parser.feed(xml)
    return parser.finish()
}

function parseString(xml:string, options?:Options) : Object
{
    return new Promise((resolve, reject) => {
        resolve(parseStringSync(xml, options))
    })
}

function parseFile(filename:string, options?:Options) : Object
{
    return new Promise((resolve, reject)=>{
        if (options && options.stream)
        {
            let encoding:BufferEncoding = "utf-8"
            if (options.encoding) encoding = options.encoding
    
            let parser = new Parser(options)
            fs.createReadStream(filename, encoding)
            .on("data", chunk=>{
                parser.feed(chunk.toString())
            })
            .on("end", ()=>{
                resolve(parser.finish())
            })
        } else {
            resolve(parseFileSync(filename, options))
        }
    })
}


export {Parser, parseStringSync, parseFileSync, parseString, parseFile}
