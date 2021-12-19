import Builder = require('./abstracts/builder')
import { Token, Options } from './types';

class SimpleBuilder extends Builder
{
    private _branch: any

    constructor(options?: Options) {
        super(options)
        this._branch = null
    }

    build(): any {
        if (this._branch)
        {
            delete this._branch["@name"]
            delete this._branch["@attributes"]
            delete this._branch["@parent"]
            delete this._branch["@root"]
        }

        return this._branch
    }

    handleStartTagToken(token: Token) {
        let name: string | undefined;
        let node: any
        
        name = this.stripTag(token)

        node = {
            "@name":name, 
            "@attributes":this.parseAttributes(token),
            "@parent":this._branch
        }

        //@ts-ignore (gives error about undefined value)
        node[name] = {}

        // copy all of the local data into the global data
        this._attributes = Object.assign({}, this._attributes, node['@attributes']) 

        if (!this._branch) {
            node["@parent"] = node
            node["@root"] = true
            return this._branch = node
        }

        let value = this._branch["@name"]
        let child = node["@name"]
        
        if (this._branch[value][child] && !Array.isArray(this._branch[value][child]))
            this._branch[value][child] = [this._branch[value][child]]


        if (Array.isArray(this._branch[value][child]))
        {
            this._branch[value][child].push(node[child])
        }
        else
        {
            if (typeof this._branch[value] !== "object")
            {
                this._logger.error("Invalid XML syntax. Embedded content and tags as child.", this._options.strict)
                this._branch[value] = {}
            }

            this._branch[value][child] = node[child]
            
        }

        this._branch = node
    }

    handleEndTagToken(token: Token): void 
    {
        if (this.stripTag(token) != this._branch["@name"])
        {
            this._logger.error(`Found mismatched start/end tag <${this._branch["@name"]}> ${token.value}`, this._options.strict)
        }

        // navigate out
        this._branch = this._branch["@parent"]

        this._attributes = this._branch["@attributes"]
    }

    handleSelfClosingToken(token: Token): void {
        this.handleStartTagToken(token)
        this.handleEndTagToken(token)
    }

    handleContentToken(token: Token): void {
        // add content
        let content = this.processContent(token.value)

        let value = this._branch["@parent"]["@name"]
        let child = this._branch["@name"]

        // if the child is an array
        if (Array.isArray(this._branch["@parent"][value][child]))
        {
            this._branch["@parent"][value][child].pop()
            this._branch["@parent"][value][child].push(content)
        } else {
            //check if circular root obj
            if (this._branch["@root"])
            {
                this._branch[child] = content
            } else {
                this._branch["@parent"][value][child] = content
            }
        }    
    }

    handleCDATAToken(token: Token): void {
        token.value =  token.value.substring(9, token.value.length - 3)
        this.handleContentToken(token)
    } 

    handleCommentToken(token: Token): void {
        // just a comment, do nothing
        let comment = token.value.slice(4, token.value.length - 3)
        if (comment.indexOf("--") > -1)
        {
            this._logger.error(`Invalid syntax '--'found in comment ${token.value}`, this._options.strict)
        }
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


export = SimpleBuilder