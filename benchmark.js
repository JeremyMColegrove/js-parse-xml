let {Parser} = require("./index")
var Benchmark = require('benchmark');

var suite = new Benchmark.Suite;

let parser = new Parser()
parser.feed("<a>")
suite.add("js-parse-xml", ()=>{
    parser.feed("<b>5</b>")
}).on("cycle", (event)=>{
    console.log(String(event.target));
}).run({async:true})