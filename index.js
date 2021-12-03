//make a recursive decent parser that parses the XML into a json object
import LWX from './lwx/lwx.js';

async function get_xml() {
    //this is a test comment
    var p = new LWX()
    let obj = await p.stream_file("./lwx/tests/003.xml")
    // let obj = await p.stream_file("./xml.xml")

    console.log(JSON.stringify(obj, null, 2))
}

get_xml()



