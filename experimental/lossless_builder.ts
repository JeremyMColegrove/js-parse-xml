import Builder = require('../lib/abstracts/builder')
import { defaultOptions, Options, Token } from '../lib/types';

class LosslessBuilder extends Builder
{
    private _branch: any

    constructor(options?:Options) {
        super(options)
        this._branch = null
    }

    build(): any {
        return this._branch
    }

    handleStartTagToken(token: Token) {
        let node: any
        let name: string | undefined

        name = this.stripTag(token)

        node = {
                name:name, 
                attributes:{},
                "@parent":this._branch,
                content:null,
                children:[]
            }
        
        if (!this._branch)
        {
            node["@parent"] = node
            this._branch = node
            return
        }

        this._branch.children.push(node)
        this._branch = node    
    }

    handleEndTagToken(token: Token): void 
    {
        if (this.stripTag(token) != this._branch.name)
        {
            this._logger.error(`Found mismatched start/end tag <${this._branch.name}> ${token.value}`, this._options.strict)
        }

        let parent = this._branch["@parent"]
        delete this._branch["@parent"]
        this._branch = parent
    }

    handleSelfClosingToken(token: Token): void {
        this.handleStartTagToken(token)
        this.handleEndTagToken(token)
    }

    handleContentToken(token: Token): void {
        this._branch.content = this.processContent(token.value)
    }

    handleCDATAToken(token: Token): void {
        token.value =  token.value.substring(9, token.value.length - 3)
        this.handleContentToken(token)
    } 

    handleCommentToken(token: Token): void {
        // just a comment, do nothing
    }

    
    handleParamToken(token: Token): void {
        if (this._branch)
        {
            this._logger.error("Invalid parameter tag position", this._options.strict)
        }

        // check that <? ends with ?> 
        if (token.value[1] == "?" && token.value[1] != token.value[token.value.length-2]) {
            this._logger.error(`Invalid parameter tag '${token.value}'`, this._options.strict)
        }    
    }
}


export = LosslessBuilder