//make a recursive decent parser that parses the XML into a json object
let parser = require('./js-parse-xml')
let parser_q = require('fast-xml-parser')
let fs = require("fs")


// async function stream()
// {
//     console.time("large")
//     let json = await parser.parseFile("./psd7003.xml", {stream:true})
//     console.timeEnd("large")
// }
// stream()

// let xml = fs.readFileSync("./nasa.xml", 'utf8')

// console.time("js-parse-xml")
// let json = parser.parseStringSync(xml)
// console.timeEnd("js-parse-xml")


// console.time("fast-xml-parser")
// let p = new parser_q.XMLParser()
// json = p.parse(xml)
// console.timeEnd("fast-xml-parser")