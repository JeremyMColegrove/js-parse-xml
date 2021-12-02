//make a recursive decent parser that parses the XML into a json object
import LWX from './lwx/lwx.js';

async function get_xml() {
    var p = new LWX()
    let obj = await p.parse_file("./xml.xml")
    console.log(obj)
}

get_xml()



