import Logger = require("../logger");
import { Tokenizer } from "../tokenizer";
import { defaultOptions, Options, Token } from "../types";

class Builder {
    protected _attributes: any
    protected _options: Options
    protected _logger: Logger

    constructor(options?:Options) {
        this._attributes = {}
        this._logger = new Logger()

        this._options = Object.assign({}, defaultOptions, options)
    }

    build() {
        throw new Error("This method is not implemented.")
    }

    handleStartTagToken(token: Token) {
        throw new Error("This method is not implemented.")
    }
    handleEndTagToken(token: Token) {
        throw new Error("This method is not implemented.")
    }
    handleSelfClosingToken(token: Token) {
        throw new Error("This method is not implemented.")
    }
    handleCDATAToken(token: Token) {
        throw new Error("This method is not implemented.")
    }
    handleCommentToken(token: Token) {
        throw new Error("This method is not implemented.")
    }
    handleContentToken(token: Token) {
        throw new Error("This method is not implemented.")
    }
    handleParamToken(token: Token) {
        throw new Error("This method is not implemented.")
    }

    // string processing helper functions
    protected stripTag(token: Token) 
    {
        let  tag: string | undefined
        let regex: RegExp
        let match: boolean

        tag = token.value.trim()

        // remove brackets <>
        tag = tag.substring(1, tag.length - 1)

        // remove any attributes
        tag = tag.split(" ")[0]
        
        // remove end tag symbol </
        if (tag[0] == "/")
        {
            tag = tag.substring(1)
        }

        // remove self closing symbol />
        if (tag[tag.length - 1] == "/")
        {
            tag = tag.substring(0, tag.length - 1)
        }

        // check for any bad xml tags 
        regex = new RegExp(/([^.\-A-Za-z0-9_:])|(^[0-9._\-:])/)

        match = regex.test(tag)
        
        if (match) {
            this._logger.error(`Unexpected character found in '${tag}'`, this._options.strict)
        }

        // remove namespace
        let tag_split = tag.split(":")

        tag = tag_split.pop()

        
        return tag
    }

    // takes content and parses it into a number
    protected processContent(content: string)
    {
        if (Object.prototype.toString.call(content) === "[object String]")
        {
            // first apply any attributes on the string
            if (this._attributes['xml:space'] && this._attributes['xml:space'] != "default" && this._attributes['xml:space'] != "preserve")
            {
                this._logger.warning(`Found '${this._attributes["xml:space"]}' instead of 'default' or 'preserve'.`)
            }

            if (!this._options.preserve_whitespace && this._attributes['xml:space'] !== "preserve") 
                content = content.trim()
            
            // convert decimals and hex strings to numbers
            if (this._options.convert_values)
            {
                //@ts-ignore
                if (!isNaN(content)) {
                    // test if it is hex
                    if (content.includes("x"))
                        return Number.parseInt(content, 16)
                    else if (content.includes("."))
                        return Number.parseFloat(content)
                    else
                        return Number.parseInt(content)
                }
            }

            // also replace escaped characters like &lt; with <
            // escape special characters for regex support

            content = content.replace(/&lt;/g,     '<')
                .replace(/&gt;/g,      '>')
                .replace(/&amp;/g,     '&')
                .replace(/&apos;/g,    '\'')
                .replace(/&quot;/g,    '\"');

            return content
        }
        return content
    }

    parseAttributes(token: Token)
    {
        // take the value of the token and split it into all of the attributes, construct a hashmap
        let tag: string = token.value
        let cursor: number = 0;
        let result:any = {}
        while (cursor < tag.length)
        {
            let whitespace: number = tag.indexOf(" ", cursor)
            if (whitespace > -1)
            {
                // find the next = sign
                let equals: number = tag.indexOf("=", whitespace)
                if (equals > -1)
                {
                    cursor = equals + 1

                    let key: string = tag.slice(whitespace + 1, equals)

                    while (cursor < tag.length && tag[cursor] == " ") cursor ++

                    let char:string = tag[cursor ++]

                    if (char != "\"" && char != "\'") {
                        this._logger.error("Invalid attribute found.", this._options.strict)
                    }

                    let next:number = tag.indexOf(char, cursor)

                    if (next < 0) {
                        this._logger.error("Unexpected end of attribute.", this._options.strict)
                    } else {
                        
                        let value:string = tag.slice(cursor, next)
                        cursor = next + 1
                        result[key.trim()] = value.trim()
                    }
                } else cursor = tag.length
            } else cursor = tag.length
        }
        return result   
    }
}

export = Builder