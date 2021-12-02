## **Description**
LWX was inspired by the need for an extremely lightweight performant XML parser. XML is part of every day business life and therefore extremely important to get right. This parser is around only 400 lines of well-documented code. To make sure LWX adheres to industry standards, the standard authority for XML structure is being used [REC-xml-19980210](https://www.w3.org/TR/1998/REC-xml-19980210)

## **Features**
LWX also has noteable features such as its ability to stream files, which allows for arbitrarily large XML file sizes.

## **Getting Started**
Getting started is very easy. Once you have cloned the repo, simply run npm install inside the projects directory. From there, you should be able to use it in all of your projects.

```
import LWX from './lwx/lwx'
``` 
or 
```
let LWX = require('./lwx/lwx')
```
### **Parsing XML**
LWX is a promise based XML parser. Therefore, in order to parse XML you can choose to use either async/await
```
let parser = new LWX()
let result = await parser.parse_xml("./filename.xml")
// do whatever with the result here
```

or then/catch
```
let parser = new LMX()
parser.parse_xml("./filename.xml").then(result=>{
    // do whatever with the result here
}).catch(err=>{
    // do whatever with the error here
})
```
Or any other asynchronous calls available to you in JavaScript!

## **Contributing**
### **Overview**
The goal of this project is to be open source and community driven. Therefore contributing is welcomed, and any/all ideas and suggestions are taken into consideration. 

### **Process**
To get started, branch the [LWX GitHub repo](https://github.com/JeremyMColegrove/XML-LNP). 
You can then make a pull request with the change. This pull request will be reviewed by moderators. Here are the must-haves for a pull-request:

1. PR must have a clear description of what changed
2. PR must have a clear description of why it was changed
3. All tests must pass with no errors or warnings found (not implemented currently)
4. All changes must be documents using JSDoc syntax
5. All JSDocs must be re-made by running ```npm run doc``` with no errors or warnings

### **Testing**

You can run tests by running ```npm test```
Testing is extremely important when it comes to parsers due to the wide range of inputs it can see. For this purpose, LWX will rely on the [XML W3C Conformance Test Suite 20130923](https://www.w3.org/XML/Test/) from IBM. TODO: These tests are not currently working, and have not been verified against the parser yet. This is a must-have and will be fixed in a future release.

As of right now, only our own tests are implemented. While this is better than nothing, we want to move to a standardized testing to make sure LWX performs in all scenarios.






