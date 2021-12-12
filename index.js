//make a recursive decent parser that parses the XML into a json object
let parser = require('./js-parse-xml')

parser.parseFile("./tests/self_closing.xml").then(obj=>{
    //do whatever with the object when its complete
    console.log(obj)
})

// keep running 
console.log("Called right after parse xml")