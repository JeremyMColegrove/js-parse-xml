import { Options, Node } from "./types";
export = Parser;
declare class Parser {
    private _tokenizer;
    private _logger;
    private _simplifier;
    private _branch;
    private _root;
    private _attributes;
    private _options;
    private _tag_balance;
    constructor(options?: Options);
    finish(): any;
    feed(xml: string): void;
    simplify(object: Node): any;
    private error;
    private syntaxErrorMessage;
    private handleStartTagToken;
    private handleSelfClosingToken;
    private handleEndTagToken;
    private handleContentToken;
    private handleCDATAToken;
    private handleParamToken;
    private handleCommentToken;
    private stripTag;
    private processContent;
}
