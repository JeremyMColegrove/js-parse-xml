let fs = require("fs")
let {Parser, parseStringSync, parseFile, parseString, parseFileSync} = require("./dist/index")

let xml = fs.readFileSync("./example.xml", "utf-8")

console.time("benchmark")

let json = parseStringSync(xml, {strict:false})

console.timeEnd("benchmark")

console.log(json)