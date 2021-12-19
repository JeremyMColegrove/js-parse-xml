import Builder = require('../lib/abstracts/builder');
import { Options, Token } from '../lib/types';
declare class LosslessBuilder extends Builder {
    private _branch;
    constructor(options?: Options);
    build(): any;
    handleStartTagToken(token: Token): void;
    handleEndTagToken(token: Token): void;
    handleSelfClosingToken(token: Token): void;
    handleContentToken(token: Token): void;
    handleCDATAToken(token: Token): void;
    handleCommentToken(token: Token): void;
    handleParamToken(token: Token): void;
}
export = LosslessBuilder;
