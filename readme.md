## **Description**
js-parse-xml was inspired by the need for an extremely lightweight performant XML parser. XML is part of every day business life and therefore extremely important to get right. To make sure js-parse-xml adheres to industry standards, the standard authority for XML structure is being used [REC-xml-19980210](https://www.w3.org/TR/1998/REC-xml-19980210)

## **Features**
js-parse-xml also has noteable features such as its ability to stream files, which allows for arbitrarily large XML file sizes.

## **Getting Started**
Getting started is very easy. Once you have cloned the repo, simply run npm install inside the projects directory. From there, you should be able to use it in all of your projects.

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
await parser.parseFile('absolute file path')

// parse string asynchronously
await parser.parseString('string of xml')

// parse a file synchronously
parser.parseFileSync('absolute file path')

// parse a string synchronously
parser.parseStringSync('string of xml')



// alternatively if you have a large file you want to read in using streams, you can pass it as an option to parseFile like so
// NOTE: streaming files is only available with asynchronous parseFile function
await parser.parseFile('absolute file name', {stream:true})
```



## **Contributing**
### **Overview**
The goal of this project is to be open source and community driven. Therefore contributing is welcomed, and any/all ideas and suggestions are taken into consideration. 

### **Process**
To get started, branch the [js-parse-xml GitHub repo](https://github.com/JeremyMColegrove/XML-LNP). 
You can then make a pull request with the change. This pull request will be reviewed by moderators. Here are the must-haves for a pull-request:

1. PR must have a clear description of what changed
2. PR must have a clear description of why it was changed
3. All tests must pass with no errors or warnings found (not implemented currently)
4. All changes must be documents using JSDoc syntax
5. All JSDocs must be re-made by running ```jsdoc js-parse-xml.js`` with no errors or warnings

### **Testing**

You can run tests by running ```npm test```
Testing is extremely important when it comes to parsers due to the wide range of inputs it can see.

As of right now, only our own tests are implemented. While this is better than nothing, we want to move to a standardized testing to make sure js-parse-xml performs in all scenarios.






