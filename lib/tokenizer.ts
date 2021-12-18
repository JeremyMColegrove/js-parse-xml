import { Token } from "./types";

export class Tokenizer {
    private _string: string;
    private _line: number;
    private _buffer: string;
    private _in_tag: boolean;
    private _cursor: number;


    constructor() {
        this._string = "",
        this._line = 1
        this._buffer = ""
        this._cursor = 0

        // flags to make this parser streamer friendly
        this._in_tag = false
    }

    // primes our tokenizer, resets cursor etc
    init(string: string) : void
    {
        this._string = string
        this._cursor = 0
    }

    getNextToken() : Token | null
    {

        if (this._cursor < 0) return null

        // if we are not currently parsing a tag, treat as content and look for next tag
        if (!this._in_tag)
        {
            let next = this._string.indexOf("<", this._cursor)

            if (next > -1) {

                this._in_tag = true

                this._buffer += this._string.slice(this._cursor, next)

                this._cursor = next

                if (this._buffer.trim())
                    return this.ContentLiteral()
                
                // clear the buffer for this new tag
                this._buffer = ""
                
            } else {
                
                this._buffer += this._string.slice(this._cursor)
                this._cursor = -1
            }
        }

        // keep looking for an end tag until some condition is satisfied 
        // e.i <![CDATA[<xml>]]> it will find one in the CDATA, but does not satisfy cdata condition so continues
        while (this._cursor > -1)
        {
            let end = this._string.indexOf(">", this._cursor)
        
            if (end > -1) end ++
    
            this._buffer += this._string.slice(this._cursor, end)
    
            this._cursor = end
    
            /**
             * check end tag was found
             * if so, check what is in the buffer
             */
    
            if (end > -1)
            {
                if (this.isCommentTag(this._buffer))
                {
                    if (this._buffer.indexOf("-->") == this._buffer.length - 3)
                    {
                        return this.CommentLiteral()
                    }
                } 
                else if (this.isCdataTag(this._buffer))
                {
                    this._in_tag = false
                    if (this._buffer.indexOf("]]>") == this._buffer.length - 3)
                    {
                        return this.CDATALiteral()
                    }
                } 
                else if (this.isEndTag(this._buffer))
                {
                    return this.EndTagLiteral()
                }
                else if (this.isSelfClosing(this._buffer))
                {
                    return this.SelfClosingLiteral()
                }
                else if (this.isParamTag(this._buffer))
                {
                    return this.ParamTagLiteral()
                } else {
                    return this.TagLiteral()
                }

            } else {
                // if no end tag was found, add everything to buffer
                this._buffer += this._string.slice(this._cursor)
            }
        }
        
        // return null (like requesting the next line in the stream)
        return null
    }

    isCommentTag(tag: string) : boolean
    {
        if (tag.indexOf("<!--") > -1) return true
        return false
    }
    isCdataTag(tag: string) : boolean
    {
        if (tag.indexOf("<![CDATA[") > -1) return true
        return false
    }

    isEndTag(tag: string) : boolean
    {
        if (tag.charCodeAt(1) == 47) return true
        return false
    }

    isSelfClosing(tag: string) : boolean
    {

        if (tag.charCodeAt(tag.length - 2) == 47) return true
        return false
    }

    isParamTag(tag: string) : boolean
    {
        let first_letter = tag.charCodeAt(1)
        if (first_letter == 63 || first_letter == 33 ) 
        {
            return true
        }
        return false
    }

    ContentLiteral() : Token
    {
        return this.Literal("ContentLiteral")
    }

    TagLiteral() : Token
    {
        this._in_tag = false
        return this.Literal("StartTagLiteral")
    }

    EndTagLiteral() : Token
    {
        this._in_tag = false

        return this.Literal("EndTagLiteral")
    }
    SelfClosingLiteral() : Token
    {
        this._in_tag = false

        return this.Literal("SelfClosingLiteral")
    }

    ParamTagLiteral() : Token
    {
        this._in_tag = false

        return this.Literal("ParamTagLiteral")
    }

    CDATALiteral() : Token
    {
        this._in_tag = false

        return this.Literal("CDATALiteral")
    }

    CommentLiteral() : Token
    {
        this._in_tag = false

        return this.Literal("CommentLiteral")
    }

    Literal(type: string) : Token
    {
        let literal : Token
        
        literal = {
            type,
            value:this._buffer,
            line:this._line
        }
        this._buffer = ""
        return literal
    }
}