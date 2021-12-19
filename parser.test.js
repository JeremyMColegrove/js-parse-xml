let {Parser, parseStringSync, parseFile, parseString, parseFileSync} = require('./dist/index')
let Logger = require("./dist/lib/logger")
let Builder = require("./dist/lib/abstracts/builder")
let fs = require('fs')

/***
 * tests all tests inside tests folder
 * will parse all .xml files in /tests and look for correct result in /tests/out/*same_filename*.json
 * */ 
function run_all_tests()
{

    // run tests on logger
    test("Strict logger error", ()=>{
        let logger = new Logger()
        expect(() => {logger.error("");}).toThrowError(SyntaxError)
    })
    test("Soft logger error", ()=>{
        let logger = new Logger()
        expect(logger.error("", false)).toBeUndefined()
    })

    test("Strict logger warning", ()=>{
        let logger = new Logger()
        const warning = () => {logger.warning("test");}
        expect(()=>{logger.warning("")}).toThrowError(SyntaxError)
    })

    test("Soft logger warning", ()=>{
        let logger = new Logger()
        expect(logger.warning("test", false)).toBeUndefined()
    })

    // run tests on default Builder class
    test("Builder", () => {
        let builder = new Builder()
        // expect(builder.build()).toThrowError(Error)
        expect(builder.handleCDATAToken).toThrowError(Error)
        expect(builder.handleCommentToken).toThrowError(Error)
        expect(builder.handleStartTagToken).toThrowError(Error)
        expect(builder.handleSelfClosingToken).toThrowError(Error)
        expect(builder.handleContentToken).toThrowError(Error)
        expect(builder.handleParamToken).toThrowError(Error)
    })


    //look for all of the test files
    var files = fs.readdirSync('./tests');
    for (var file of files)
    {
        // if it is a file
        if (file.includes("."))
        {
            let file_path = "./tests/" + file


            // get all of the test information and content
            // construct paths of both the input and the expected output
            let path = "./tests/out/" + file.split('.')[0] + ".json"

            let output = fs.readFileSync(path, 'utf-8')
            
            // parse the output to an object for comparison
            output = JSON.parse(output)

            test_files_ok(file, output, file_path)
        
        }
    }
}

function test_files_ok(file, output, file_path) {
            let input = fs.readFileSync(file_path, 'utf-8')

            // NO STREAMING
            // test for parsing file asynchronously
            test(file + " parseFile", async ()=>{
                let result = await parseFile(file_path)
                expect(result).toStrictEqual(output)
            })

            // test for parsing file synchronously
            test(file + " parseFileSync", ()=>{
                let result = parseFileSync(file_path)
                expect(result).toStrictEqual(output)
            })

            // test for parsing string asynchronously
            test(file + " parseString", async ()=>{
                let result = await parseString(input)
                expect(result).toStrictEqual(output)
            })

            // test for parsing string synchronously
            test(file + " parseStringSync", ()=>{
                let result = parseStringSync(input)
                expect(result).toStrictEqual(output)
            })

            // STREAMING
            test(file + " parseFile", async ()=>{
                let result = await parseFile(file_path, {stream:true})
                expect(result).toStrictEqual(output)
            })

            // test for parsing file synchronously
            test(file + " parseFileSync", ()=>{
                let result = parseFileSync(file_path, {stream:true})
                expect(result).toStrictEqual(output)
            })

            // test for parsing string asynchronously
            test(file + " parseString", async ()=>{
                let result = await parseString(input, {stream:true})
                expect(result).toStrictEqual(output)
            })

            // test for parsing string synchronously
            test(file + " parseStringSync", ()=>{
                let result = parseStringSync(input, {stream:true})
                expect(result).toStrictEqual(output)
            })
}
run_all_tests()
