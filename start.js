let fs = require("fs")
let {Parser, parseStringSync, parseFile, parseString, parseFileSync} = require("./dist/index")

// let xml = fs.readFileSync("./psd7003.xml", "utf-8")

console.time("benchmark")

async function parse() {
    await parseFile("./psd7003.xml", {strict:true, stream:true})
    console.timeEnd("benchmark")
}

parse()


// console.log(json)