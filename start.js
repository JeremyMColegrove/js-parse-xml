let fs = require("fs")
let {Parser, parseStringSync} = require("./dist/index")
let {Tokenizer} = require("./dist/lib/tokenizer")

// function printTokens(tokenizer)
// {
//     let token
//     while ((token = tokenizer.getNextToken()))
//     {
//         // just see how long it takes to perform lexical analysis
//         console.log(token)
//     }
// }

let xml = fs.readFileSync("./example.xml", "utf-8")

console.time("benchmark")

let json = parseStringSync(xml, {strict:false})

console.timeEnd("benchmark")

console.log(json)