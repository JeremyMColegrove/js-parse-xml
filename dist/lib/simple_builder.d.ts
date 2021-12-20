import Builder = require('./abstracts/builder');
import { Token, Options } from './types';
declare class SimpleBuilder extends Builder {
    private _branch;
    private _finished;
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
export = SimpleBuilder;
