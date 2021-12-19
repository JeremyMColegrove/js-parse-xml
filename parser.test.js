let {Parser, parseStringSync} = require('./dist/index')
let fs = require('fs')

/***
 * tests all tests inside tests folder
 * will parse all .xml files in /tests and look for correct result in /tests/out/*same_filename*.json
 * */ 
function run_all_tests()
{
    //look for all of the test files
    var files = fs.readdirSync('./tests');
    for (var file of files)
    {
        // if it is a file
        if (file.includes(".") && file.split('.')[0]!="lwx")
        {
            // get all of the test information and content
            // construct paths of both the input and the expected output
            let file_path = "./tests/" + file
            let path = "./tests/out/" + file.split('.')[0] + ".json"

            let output = fs.readFileSync(path, 'utf-8')
            let input = fs.readFileSync(file_path, 'utf-8')
            
            // parse the output to an object for comparison
            output = JSON.parse(output)


            /***************************\
                        tests
            \***************************/
            let parser = new Parser()
            // test for parsing file asynchronously
            // test(file + " parseFile", async ()=>{
            //     let result = await parser.parseFile(file_path)
            //     expect(result).toStrictEqual(output)
            // })

            // // test for parsing file synchronously
            // test(file + " parseFileSync", ()=>{
            //     let result = parser.parseFileSync(file_path)
            //     expect(result).toStrictEqual(output)
            // })

            // // test for parsing string asynchronously
            // test(file + " parseString", async ()=>{
            //     let result = await parser.parseString(input)
            //     expect(result).toStrictEqual(output)
            // })

            // test for parsing string synchronously
            test(file + " parseStringSync", ()=>{
                let result = parseStringSync(input)
                expect(result).toStrictEqual(output)
            })
        }
    }
}

run_all_tests()
