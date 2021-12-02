//make a recursive decent parser that parses the XML into a json object
import parser from './xml_parser/xml-parser.js';

async function get_xml(){
    var p = new parser()
    let obj = await p.parse_xml("./xml.xml")
    console.log(obj)
}


get_xml()



