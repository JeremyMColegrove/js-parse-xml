import { Options } from "./types";
export = Parser;
declare class Parser {
    private _tokenizer;
    private _logger;
    private _builder;
    private _options;
    private _tag_balance;
    constructor(options?: Options);
    finish(): any;
    feed(xml: string): void;
    private handleStartTagToken;
    private handleSelfClosingToken;
    private handleEndTagToken;
    private handleContentToken;
    private handleCDATAToken;
    private handleParamToken;
    private handleCommentToken;
}
