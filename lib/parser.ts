import { Tokenizer } from "./tokenizer"
import {Options, Token, Node, defaultOptions, tokenTypes} from "./types"
import Logger = require('./logger')
import Builder = require("./abstracts/builder")
import SimpleBuilder = require("./simple_builder")

export = Parser

class Parser {
    private _tokenizer: Tokenizer
    private _logger: Logger
    private _builder: Builder
    private _options: Options
    private _tag_balance: number

    constructor(options?:Options) {
        this._tokenizer = new Tokenizer()
        this._logger = new Logger()
        
        this._options = Object.assign({}, defaultOptions, options)

        // the simple or full builder type
        this._builder = new SimpleBuilder(options)

        // making sure same number of start and end tags
        this._tag_balance = 0

    }

    finish(): any {
        // // not enough end tags
        if (this._tag_balance > 0)
        {
            this._logger.error("Unexepcted end of input", this._options.strict)
        }

        return this._builder.build()
    }

    feed(xml: string)
    {
        // prime our token stream
        this._tokenizer.init(xml)

        let next: Token | null = null
        while ((next = this._tokenizer.getNextToken()))
        {
            // checks to see if certain conditions are true, like content can not follow an end tag
            switch (next.type)
            {
                case tokenTypes.LITERAL_START:
                    this.handleStartTagToken(next)
                    break;
                case tokenTypes.LITERAL_SELF_CLOSING:
                    this.handleSelfClosingToken(next)
                    break
                case tokenTypes.LITERAL_CONTENT:
                    this.handleContentToken(next)
                    break;
                case tokenTypes.LITERAL_END:
                    this.handleEndTagToken(next)
                    break;
                case tokenTypes.LITERAL_CDATA:
                    this.handleCDATAToken(next)
                    break
                case tokenTypes.LITERAL_PARAM:
                    this.handleParamToken(next)
                    break
                case tokenTypes.LITERAL_COMMENT:
                    this.handleCommentToken(next)
                    break
                default:
                    this._logger.error(`Could not process unknown token '${next.type}'. Try upgrading js-parse-xml to latest version?`, this._options.strict)
            }
        }
    }

    private handleStartTagToken(token: Token)
    {
        this._tag_balance ++

        this._builder.handleStartTagToken(token)
        
    }

    private handleSelfClosingToken(token: Token)
    {
        //handle the tag name and then pass to both StartToken and EndToken
        this._builder.handleSelfClosingToken(token)
    }


    private handleEndTagToken(token: Token)
    {
        this._tag_balance --

        this._builder.handleEndTagToken(token)
  
    }

    private handleContentToken(token: Token)
    {

        this._builder.handleContentToken(token)
        
    }

    private handleCDATAToken(token: Token)
    {
        this._builder.handleCDATAToken(token)
    }

    private handleParamToken(token: Token)
    {
        this._builder.handleParamToken(token)
    }

    private handleCommentToken(token: Token)
    {
        this._builder.handleCommentToken(token)
    }
}

module.exports = Parser