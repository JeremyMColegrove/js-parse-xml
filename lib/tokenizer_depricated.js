class Tokenizer {
    constructor() {
        this._string = "",
        this._token = ''
        this._line = 1
        // state should persist between loading of lines
        this._in_tag = false
        this._tag = ""
        this._in_cdata = false
        this._cdata = ""
        this._in_content = false
        this._content = ""
        this._in_comment = false
        this._comment = ""
    }

    // primes our tokenizer, resets cursor etc
    init(string)
    {
        this._string = string;
        this._cursor = 0;
        this._token = ''
    }

    EOF() {
        return this._cursor > this._string.length
    }

    eatChar() {
        do {
            if (this._token.charCodeAt(0) == 10) this._line += 1

            this._token = this._string[this._cursor ++]

        } while (!this.EOF() && this._token.charCodeAt(0) == 10)

        return !this.EOF()
    }

    getNextToken()
    {
        while (this.eatChar())
        {
            // if we are not in a tag, and we have not reached the start of a tag, treat as content
            // 62 = "<"
            if (!this._in_tag && this._token.charCodeAt(0) != 60)
            {
                // otherwise it is content, so parse the content
                this._content += this._token
                this._in_content = true
                continue
            }
            // we are either in a tag or have started a tag

            this._in_tag = true
            this._tag += this._token

            // send any content if there was some
            if (this._in_content && this._content.trim()) {
                let result = this.ContentLiteral(this._content)
                this._in_content = false
                this._content = ""
                return result
            }

            // check if in comment
            if (!this._in_comment && this._tag.indexOf("<!--") > -1)
            {
                this._in_comment = true
            }

            // check if in CDATA
            if (!this._in_cdata && this._tag.indexOf("<![CDATA[") > -1)
            {
                this._in_cdata = true
            }

            if (this._in_comment)
            {
                this._comment += this._token
                let start = this._comment.length - 3
                if (this._tag.indexOf("-->", start) > -1)
                {
                    let result = this.CommentLiteral(this._tag)
                    this._tag = ""
                    this._in_comment = false
                    this._in_tag = false
                    return result
                }
            } else if (this._in_cdata)
            {
                if (this._tag.indexOf("]]>", this._cdata.length - 3))
                {
                    let result = this.CDATALiteral(this._tag)
                    this._tag = ""
                    this._in_cdata = false
                    this._in_tag = false
                    return result
                }
            }
            // 62 = ">"
            else if (this._token.charCodeAt(0) == 62) {
                // return a new start tag
                
                let result
                if (this.isParamTag(this._tag)){
                    result = this.ParamTagLiteral(this._tag)
                } else if (this.isEndTag(this._tag))
                    result = this.EndTagLiteral(this._tag)
                else if (this.isSelfClosing(this._tag))
                    result = this.SelfClosingLiteral(this._tag)
                else
                    result = this.TagLiteral(this._tag)

                this._in_tag = false
                this._tag = ""
                return result
            }  
        }

        return null
    }


    isEndTag(tag)
    {
        // 47 = "/"
        if (tag.charCodeAt(1) == 47) return true
        return false
    }

    isSelfClosing(tag)
    {

        if (tag.charCodeAt(tag.length - 2) == 47) return true
        return false
    }

    isParamTag(tag)
    {
        let first_letter = tag.charCodeAt(1)
        if (first_letter == 63 || first_letter == 33 ) 
        {
            return true
        }
        return false
    }

    ContentLiteral(value)
    {
        return this.Literal("ContentLiteral", value)
    }

    TagLiteral(value) {
        return this.Literal("StartTagLiteral", value)
    }

    EndTagLiteral(value)
    {
        return this.Literal("EndTagLiteral", value)
    }
    SelfClosingLiteral(value)
    {
        return this.Literal("SelfClosingLiteral", value)
    }

    ParamTagLiteral(value)
    {
        return this.Literal("ParamTagLiteral", value)
    }

    CDATALiteral(value)
    {
        return this.Literal("CDATALiteral", value)
    }
    CommentLiteral(value)
    {
        return this.Literal("CommentLiteral", value)
    }
    Literal(type, value){
        return {
            type,
            value,
            line:this._line
        }
    }
}

module.exports = Tokenizer