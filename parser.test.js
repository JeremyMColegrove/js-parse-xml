let {Parser, parseStringSync, parseFile, parseString, parseFileSync} = require('./dist/index')
let Logger = require("./dist/lib/logger")
let Builder = require("./dist/lib/abstracts/builder")
let SimpleBuilder = require("./dist/lib/simple_builder")
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

    test("Logger warning", ()=>{
        let logger = new Logger()
        const warning = () => {logger.warning("test");}
        expect(logger.warning("")).toBeUndefined()
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
        expect(builder.handleEndTagToken).toThrowError(Error)
        expect(builder.build).toThrowError(Error)


    })

    test("SimpleBuilder build", ()=>{
        let builder = new SimpleBuilder()
        let b = builder.build()
        expect(b).toBeUndefined()
    })

    test("Builder parse content", ()=>{
        let builder = new Builder()
        let attrs = builder.parseAttributes({type:"token", value:`<a test='ok'>`, line:0})
        let attrd = builder.parseAttributes({type:"token", value:`<a test="ok">`, line:0})

        let expected = {test:"ok"}
        expect(attrs).toStrictEqual(expected)
        expect(attrd).toStrictEqual(expected)
    })


    // check all of the errors that would cause a well-formed XML document to fail

    /**
     * Types of XML validation for well-formed documents
     * 1) XML document must have a root element
     * 2) XML (param) prolog must be at start of document
     * 3) all tags must have closing tag
     * 4) XML tags are case sensitive
     * 5) Elements must be properly nested
     * 6) Attributes must be quoted
     * 7) Comments can not contain --
     * 8) White space is preserved (no test for this)
     */


    test("FAIL - Root element", ()=>{
        let xml = fs.readFileSync("./tests/errors/root_element.xml", "utf-8")
        expect(()=>parseStringSync(xml)).toThrowError(SyntaxError)
    })

    test("FAIL - Param at start", ()=>{
        let xml = fs.readFileSync("./tests/errors/prolog_at_start.xml", "utf-8")
        expect(()=>parseStringSync(xml)).toThrowError(SyntaxError)
    })

    test("FAIL - Closing tags", ()=>{
        let xml = fs.readFileSync("./tests/errors/no_closing.xml", "utf-8")
        expect(()=>parseStringSync(xml)).toThrowError(SyntaxError)
    })

    test("FAIL - Case sensitive", ()=>{
        let xml = fs.readFileSync("./tests/errors/case_sensitive.xml", "utf-8")
        expect(()=>parseStringSync(xml)).toThrowError(SyntaxError)
    })

    test("FAIL - Properly nested", ()=>{
        let xml = fs.readFileSync("./tests/errors/properly_nested.xml", "utf-8")
        expect(()=>parseStringSync(xml)).toThrowError(SyntaxError)
    })

    test("FAIL - Quoted attributes", ()=>{
        let xml = fs.readFileSync("./tests/errors/quoted_attributes.xml", "utf-8")
        expect(()=>parseStringSync(xml)).toThrowError(SyntaxError)
    })

    test("FAIL - Bad comment", ()=>{
        let xml = fs.readFileSync("./tests/errors/bad_comment.xml", "utf-8")
        expect(()=>parseStringSync(xml)).toThrowError(SyntaxError)
    })



    // Run automated tests on files automatically

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
