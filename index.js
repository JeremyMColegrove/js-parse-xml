//make a recursive decent parser that parses the XML into a json object
let parser = require('./js-parse-xml')
let fs = require("fs")


async function stream()
{
    let json = await parser.parseFile("./psd7003.xml", {stream:true, benchmark:true})
    console.log(json)
}
stream()

// let xml = fs.readFileSync("./tests/convert_values.xml", 'utf8')
// let json = parser.parseStringSync(xml, {benchmark:true})
// console.log(json)
// console.log(JSON.stringify(json, null, 2))
// console.log(json)


// console.time("fast-xml-parser")
// let p = new parser_q.XMLParser()
// json = p.parse(xml)
// console.timeEnd("fast-xml-parser")