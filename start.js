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

let parser = new Parser({strict:false})

console.time("benchmark")

fs.createReadStream("./tests/simple.xml", "utf-8").on("data", chunk=>{

        parser.feed(chunk.toString())

}).on("end", ()=>{

    let json = parser.finish()

    console.timeEnd("benchmark")

    console.log(json)

})




