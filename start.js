let fs = require("fs")
let {Parser, parseStringSync} = require("./dist/index")

function printTokens(tokenizer)
{
    let token
    while ((token = tokenizer.getNextToken()))
    {
        // just see how long it takes to perform lexical analysis
        console.log(token)
    }
}

let parser = new Parser()

fs.createReadStream("./nasa.xml", "utf-8")
.on("data", chunk=>{
        parser.feed(chunk.toString())
}).on("end", ()=>{
    let json = parser.finish()
    console.log(json)
})




