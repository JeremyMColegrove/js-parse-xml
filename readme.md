[![Coverage Status](https://coveralls.io/repos/github/JeremyMColegrove/js-parse-xml/badge.svg?branch=main)](https://coveralls.io/github/JeremyMColegrove/js-parse-xml?branch=main)


Hello there :wave: This is the homepage for a well-formed XML document parser that is light, stream-based, and very fast. It is customizable, but we also provide easy functions for you to use! We hope you enjoy this XML parser.

1. Stream based.
2. 0 dependencies.
3. Small package size (~24KB).
4. Fast parsing (~40 MB/s).
5. Well-formed XML validation (optional).
6. Customizable.
7. Maintains tag order in object.
8. Custom whitespace handling.
9. Parses content into correct data types.

# **Getting Started :yum:**

### **Install**
``` npm i js-parse-xml``` Or ``` yarn add js-parse-xml```

**ES6**<br>
``` import {Parser, parseString, parseStringSync, parseFile, parseFileSync} from "js-parse-xml" ```

**ES5**<br>
``` const {Parser, parseString, parseStringSync, parseFile, parseFileSync} = require("js-parse-xml")```

### **Parser class**
| Method                   | Description                                                                        |
|--------------------------|------------------------------------------------------------------------------------|
| Parser(options?): Class  | Default constructor. Takes in an optional Options argument for customization.      |
| feed(xml: string) : void | Gives the Parser the next line of XML to parse. This works well with file streams. |
| finish() : Object        | Returns the finished, simplified parsed JSON object.                               |


### **Nice functions**
| Method                                            | Description                                                                                       |
|---------------------------------------------------|---------------------------------------------------------------------------------------------------|
| parseString(xml: string, options?): Object        | Parses the XML passed in asynchronously and returns the final JSON object.                        |
| parseStringSync(xml: string, options?): Object    | Parses the XML synchronously and returns the final JSON object.                                   |
| parseFile(filename: string, options?): Object     | Reads and parses the file specified by filename asynchronously. Returns the final JSON object.    |
| parseFileSync(filename: string, options?): Object | Reads and parses the file specified by the filename synchronously. Resurns the final JSON object. |
| simplify(object: Object): Object | Simplifies a node structure. Similarily, you can set the simplify option before parsing to do this automatically |

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
XML attributes are used to format the final content, most notability the xml:space attribute. This parser also supports CDATA. It removes the namespaces from the tag names.

Input XML:
```
<?xml version="1.0" encoding="UTF-8"?>
<ops:world-patent-data xmlns="http://www.epo.org/exchange" xmlns:ops="http://ops.epo.org" xmlns:xlink="http://www.w3.org/1999/xlink">
    <ops:meta/>
    <exchange-documents>
        <exchange-document>
            <abstract lang="en">
                <p><![CDATA[<xml>]]></p>
            </abstract>
        </exchange-document>
    </exchange-documents>
</ops:world-patent-data>
```

Simple Output JSON:
```
{
  "world-patent-data": {
    "exchange-documents": {
      "exchange-document": {
        "abstract": {
          "p": "<xml>"
        }
      }
    },
    "meta":{}
  }
}
```

If you are trying to access the content of the "p" tag, you can simply access like you would a normal object

```
let content = json['world-patent-data']['exchange-documents']['exchange-document']['abstract']['p']
```


# **Contributing :pray:**
### The Future
Current projects include giving the option to maintain tag attributes in the final json object, and provide support for all possible xml: tag options in accordance with a well-formed xml document. 

We also hope to include more test cases as we develop our own test case suite for XML testing.

We want to provide a way to parse json back into XML, as well as XML verification through given XML schema.

### **Overview**
The goal of this project is to be open source and community driven. Therefore contributing is welcomed, and any/all ideas and suggestions are taken into consideration. 

### **Process**
To get started, branch the [js-parse-xml GitHub repo](https://github.com/JeremyMColegrove/XML-LNP). 
You can then make a pull request with the change. This pull request will be reviewed by moderators. Here are the must-haves for a pull-request:

1. PR must have a clear description of what changed
2. PR must have a clear description of why it was changed
3. All tests must pass with no errors or warnings found (not implemented currently)
4. All changes must be documents using JSDoc syntax
5. All JSDocs must be re-made by running ```jsdoc js-parse-xml.js``` with no errors or warnings

### **Testing**

You can run tests by running ```npm test```
Testing is extremely important when it comes to parsers due to the wide range of inputs it can see.

As of right now, only our own tests are implemented. While this is better than nothing, we want to move to a standardized testing to make sure js-parse-xml performs in all scenarios.





