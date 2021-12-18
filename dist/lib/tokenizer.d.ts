import { Token } from "./types";
export declare class Tokenizer {
    private _string;
    private _line;
    private _buffer;
    private _in_tag;
    private _cursor;
    constructor();
    init(string: string): void;
    getNextToken(): Token | null;
    isCommentTag(tag: string): boolean;
    isCdataTag(tag: string): boolean;
    isEndTag(tag: string): boolean;
    isSelfClosing(tag: string): boolean;
    isParamTag(tag: string): boolean;
    ContentLiteral(): Token;
    TagLiteral(): Token;
    EndTagLiteral(): Token;
    SelfClosingLiteral(): Token;
    ParamTagLiteral(): Token;
    CDATALiteral(): Token;
    CommentLiteral(): Token;
    Literal(type: string): Token;
}
