let fs = require("fs")
let {Parser, parseStringSync} = require("./dist/index")
let {Tokenizer} = require("./dist/lib/tokenizer")

function printTokens(tokenizer)
{
    let token
    while ((token = tokenizer.getNextToken()))
    {
        // just see how long it takes to perform lexical analysis
        console.log(token)
    }
}

let parser = new Parser({simplify:false})

let xml = fs.readFileSync("./tests/simple.xml", "utf-8")
parser.feed(xml)
let json = parser.finish()
console.log(JSON.stringify(json, null, 2))
console.log(JSON.stringify(parser.simplify(json), null, 2))
// parser.feed("<root><test>1</test></root>")
// let json = parser.finish()
// console.log(json)
// let simple = parser.simplify(json)
// console.log(simple)

// fs.createReadStream("./nasa.xml", "utf-8")
// .on("data", chunk=>{
//         parser.feed(chunk.toString())
// }).on("end", ()=>{
//     let json = parser.finish()
//     console.log(json)
// })




