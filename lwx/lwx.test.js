import LWX from './lwx'
import fs from 'fs'
// let fs = require('fs')

/***
 * tests all tests inside tests folder
 * will parse all .xml files in /tests and look for correct result in /tests/out/*same_filename*.json
 * */ 
function run_all_tests()
{
    //look for all of the test files
    var files = fs.readdirSync('./lwx/tests');
    for (var file of files)
    {
        // if it is a file
        if (file.includes("."))
        {
            let file_path = "./lwx/tests/" + file
            // read in the output as well
            let output = fs.readFileSync("./lwx/tests/out/" + file.split('.')[0] + ".json", 'utf-8')
            output = JSON.parse(output)



            // test with file streaming
            test("stream " + file, async ()=>{
                let parser = new LWX()
                let result = await parser.stream_file(file_path)
                expect(result).toStrictEqual(output)
            })

            // test file without streaming
            test("parse " + file, async ()=>{
                let parser = new LWX()
                let result = await parser.parse_file(file_path)
                expect(result).toStrictEqual(output)
            })

            // test file with just text
            test("text " + file, async ()=>{
                let input = fs.readFileSync(file_path, 'utf-8')

                let parser = new LWX()
                let result = await parser.parse_xml(input)
                expect(result).toStrictEqual(output)
            })
        }
    }
}

run_all_tests()
