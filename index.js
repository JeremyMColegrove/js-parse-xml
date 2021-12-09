//make a recursive decent parser that parses the XML into a json object
let parser = require('./js-parse-xml')

async function get_xml() {
    //this is a test comment
    
    // let obj = await p.stream_file("./tests/003.xml")
    let obj = await parser.parseFile("./tests/self_closing.xml")

    console.log(JSON.stringify(obj, null, 2))
}

get_xml()
// let obj = parser.parseFileSync("./tests/003.xml", {stream:true})
// console.log(JSON.stringify(obj, null, 2))




