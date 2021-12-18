import { Options, Token } from "./types";
export = Parser;
declare class Parser {
    private _tokenizer;
    private _branch;
    private _root;
    private _attributes;
    private _options;
    private _tag_balance;
    constructor(options: Options);
    syntaxErrorMessage(message: string, lineNo: number | null): string;
    finish(): any;
    feed(xml: string): void;
    handleStartTagToken(token: Token): any;
    handleSelfClosingToken(token: Token): void;
    handleEndTagToken(token: Token): void;
    handleContentToken(token: Token): void;
    handleCDATAToken(token: Token): void;
    handleParamToken(token: Token): void;
    handleCommentToken(token: Token): void;
    stripTag(token: Token): string | undefined;
    processContent(content: string): string | number;
}
