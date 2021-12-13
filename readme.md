## **Description**
js-parse-xml was inspired by the need for an extremely lightweight performant XML parser. XML is part of every day business life and therefore extremely important to get right. To make sure js-parse-xml adheres to industry standards, the standard authority for XML structure is being used [REC-xml-19980210](https://www.w3.org/TR/1998/REC-xml-19980210)

## **Features**
js-parse-xml also has noteable features such as its ability to stream files, which allows for arbitrarily large XML file sizes.

## **Getting Started**
Simply run ```npm i js-parse-xml``` or ```yarn add js-parse-xml``` and the package can then be use as follows:

```
import parser from 'js-parse-xml'
``` 
or 
```
let parser = require('js-parse-xml')
```
### **Parsing XML**
js-parse-xml has 4 parsing options -- two asynchronous, and two synchronous.


```
let parser = require('js-parse-xml')

// parse a file asynchronously
await parser.parseFile('file path')

// parse string asynchronously
await parser.parseString('string of xml')

// parse a file synchronously
parser.parseFileSync('file path')

// parse a string synchronously
parser.parseStringSync('string of xml')



// alternatively if you have a large file you want to read in using streams, you can pass it as an option to parseFile like so
// NOTE: streaming files is only available with asynchronous parseFile function
await parser.parseFile('file name', {stream:true})
```


## **Performance**

Mac M1 Air: ~21 MB/s

This XML parser is about 98% as fast as the popular fast-xml-parser, but at 20% of the library size.

Unlike most other parsers, js-parse-xml does not use any external data structures to keep track of data while parsing. It constructs the final result as it is parsing. Not only that, but it can stream files, so the only limit to the size of files you can parse is the size of the final result object.

## **Output**
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

Output JSON:
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
let content = json['world-patent-data']['exchange-documents']['abstract']['p']
```
]


## **Contributing**
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






