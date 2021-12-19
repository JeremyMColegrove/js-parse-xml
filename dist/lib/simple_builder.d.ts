import Builder = require('./abstracts/builder');
import { Token, Options } from './types';
declare class SimpleBuilder extends Builder {
    private _branch;
    constructor(options?: Options);
    build(): any;
    handleStartTagToken(token: Token): any;
    handleEndTagToken(token: Token): void;
    handleSelfClosingToken(token: Token): void;
    handleContentToken(token: Token): void;
    handleCDATAToken(token: Token): void;
    handleCommentToken(token: Token): void;
    handleParamToken(token: Token): void;
}
export = SimpleBuilder;
