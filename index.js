//make a recursive decent parser that parses the XML into a json object
import fs from 'fs'
import es from 'event-stream'
import parser from './xml_parser/xml-parser.js';


var lineNr = 0;
var p = new parser()
var s = fs.createReadStream('xml.xml')
    .pipe(es.split())
    .pipe(es.mapSync(function(line){

        // pause the readstream
        s.pause();

        lineNr += 1;
        // console.log(line)
        p.parse_line(line)
        // resume the readstream, possibly from a callback
        s.resume();
    })
    .on('error', function(err){
        console.log('Error while reading file.', err);
    })
    .on('end', function(){
        console.log(JSON.stringify(p.get_result(), null, 2))
    })
);


