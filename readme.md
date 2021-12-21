[![Coverage Status](https://coveralls.io/repos/github/JeremyMColegrove/js-parse-xml/badge.svg?branch=main)](https://coveralls.io/github/JeremyMColegrove/js-parse-xml?branch=main&service=github)
![NPM Downloads](https://img.shields.io/npm/dw/js-parse-xml)
![![ISC License](https://opensource.org/licenses/ISC)](https://img.shields.io/npm/l/js-parse-xml)
![![Discord](https://discord.gg/sk2dtMkWhF)](https://img.shields.io/discord/922658833728413706)

Home of the fastest well-formed XML parser on NPM! <br>
Chat and ask questions with us on [Discord](https://discord.gg/sk2dtMkWhF).<br>
Features:

1. Stream based.
2. 0 dependencies.
3. Small package size.
4. Fast parsing (~40 MB/s).
5. Well-formed XML validation (optional).
6. Customizable.
7. Maintains tag order in object.
8. Custom whitespace handling.
9. Parses content into correct data types (optional).

# **Getting Started :yum:**

### **Install**
``` npm i --save js-parse-xml``` OR ``` yarn add js-parse-xml```

**ES6 imports**<br>
``` import {Parser, parseString, parseStringSync, parseFile, parseFileSync} from "js-parse-xml" ```

**ES5 imports**<br>
``` const {Parser, parseString, parseStringSync, parseFile, parseFileSync} = require("js-parse-xml")```

### **Usage**
**Synchronous**
```
let json = parseStringSync("<xml>Example!</xml>")

// do whatever with the json here
```

```
let json = parseFileSync("file.xml")

// do whatever with the json here
```

**Asynchronous**
```
async function parse(string)
{
  let json = await parseString(string)

  // do whatever with the json here
}

parse("<xml>Testing</xml>")
```
```
async function parse(file)
{
  let json = await parseFile(file, {stream:true})

  //do something with the json
}
parse("large_file.xml")
```
**Parser class**
```
// strict:false will continue parsing if it finds error

let parser = new Parser({strict: false})

// create stream and feed each chunk to the parser

let stream = fs.createReadStream("filename.xml", "utf-8")

stream.on("data", parser.feed)

stream.on("end", ()=>{
  let json = parser.finish()

  // do whatever with the json
})

```


### **Options**
These are all of the available/default options
```
let options = {
    encoding: "utf-8",
    stream: false,
    preserve_whitespace: false,
    convert_values: true,
    strict: true
  }
```


# **Output :fire:**

XML Input
```
<space:test>
    <example>
        content
    </example>
</space:test>
```
JSON Output
```
{
    "test":{
        "example":"content"
    }
}
```
XML Input
```
<test>
    <v>0.01e2</v>
    <v>0003</v>
    <v>-003</v> 
    <v>0x2f</v>
    <v><![CDATA[  <xml> ]]></v>
</test>
```
JSON Output
```
{
    "test": {
        "v":[1,3,-3,47,"<xml>"]
    }
}
```

# **Contributing :pray:**

The goal of this project is to be open source and community driven. Therefore contributing is welcomed, and any/all ideas and suggestions are taken into consideration. We welcome everyone to join our [Discord](https://discord.gg/sk2dtMkWhF) server and post questions, comments, concerns or feature requests! You can also navigate to our [Github](https://github.com/JeremyMColegrove/js-parse-xml) and open a new issue.





