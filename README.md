# 🌟 js-parse-xml

<a href='https://coveralls.io/github/JeremyMColegrove/js-parse-xml?branch=main'><img src='https://coveralls.io/repos/github/JeremyMColegrove/js-parse-xml/badge.svg?branch=main' alt='Coverage Status' /></a>
![NPM Downloads](https://img.shields.io/npm/dw/js-parse-xml)
<a href='https://opensource.org/licenses/ISC'><img src='https://img.shields.io/npm/l/js-parse-xml' alt='ISC License' /></a>
<a href='https://discord.gg/sk2dtMkWhF'><img src='https://img.shields.io/discord/922658833728413706' alt='Discord' /></a>

## 🚀 Key Features

- **Stream based**: Efficiently handles large files, tested up to 700MB.
- **0 dependencies**: A small package size with no external dependencies.
- **Fast Parsing**: Optimized for speed.
- **Well-formed XML validation**: Ensures the integrity of your XML.
- **Maintains tag order**: Preserves the order of tags in the output object.
- **Customizable whitespace handling**: Tailor whitespace parsing to your needs.
- **Type conversion**: Optionally parse content into the correct data types.

## 🛠 Installation

Install using NPM or Yarn:

```bash
npm i --save js-parse-xml
```

OR

```bash
yarn add js-parse-xml
```

## 🌟 Getting Started

**ESM Imports**

```javascript
import { Parser, parseString, parseStringSync, parseFile, parseFileSync } from "js-parse-xml";
```

**CommonJS Imports**

```javascript
const { Parser, parseString, parseStringSync, parseFile, parseFileSync } = require("js-parse-xml");
```

## 📸 Example

**Synchronous Parsing**

```javascript
let json = parseStringSync("<xml>Example!</xml>");
// do whatever with the json here
```

```javascript
let json = parseFileSync("file.xml");
// do whatever with the json here
```

**Asynchronous Parsing**

```javascript
async function parse(string) {
  let json = await parseString(string);
  // do whatever with the json here
}
parse("<xml>Testing</xml>");
```

```javascript
async function parse(file) {
  let json = await parseFile(file, { stream: true });
  // do something with the json
}
parse("large_file.xml");
```

**Using the Parser Class**

```javascript
// strict:false will continue parsing if it finds error
let parser = new Parser({ strict: false });

// create stream and feed each chunk to the parser
let stream = fs.createReadStream("filename.xml", "utf-8");

stream.on("data", parser.feed);

stream.on("end", () => {
  let json = parser.finish();
  // do whatever with the json
});
```

## 🌍 Supported Environments

- Node.js
- Browsers (with bundlers like Webpack or Rollup)

## 🔧 Output Examples

**XML Input**

```xml
<space:test>
    <example>
        content
    </example>
</space:test>
```

**Parsed JSON Output**

```json
{
    "test": {
        "example": "content"
    }
}
```

**XML Input**

```xml
<test>
    <v>0.01e2</v>
    <v>0003</v>
    <v>-003</v> 
    <v>0x2f</v>
    <v><![CDATA[  <xml> ]]></v>
</test>
```

**Parsed JSON Output**

```json
{
    "test": {
        "v": [1, 3, -3, 47, "<xml>"]
    }
}
```


## 🎨 Customization

Configure your parser with available options:

```javascript
let options = {
    encoding: "utf-8",
    stream: false,
    preserve_whitespace: false,
    convert_values: true,
    strict: true
};
```

## 🔧 Acknowledgments & Contributions

The goal of this project is to be open source and community-driven. Therefore, contributing is welcomed, and any/all ideas and suggestions are taken into consideration. We welcome everyone to join our [Discord](https://discord.gg/sk2dtMkWhF) server and post questions, comments, concerns, or feature requests! You can also navigate to our [Github](https://github.com/JeremyMColegrove/js-parse-xml) and open a new issue.
