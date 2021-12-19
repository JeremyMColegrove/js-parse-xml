import Logger = require("../logger");
import { Options, Token } from "../types";
declare class Builder {
    protected _attributes: any;
    protected _options: Options;
    protected _logger: Logger;
    constructor(options?: Options);
    build(): void;
    handleStartTagToken(token: Token): void;
    handleEndTagToken(token: Token): void;
    handleSelfClosingToken(token: Token): void;
    handleCDATAToken(token: Token): void;
    handleCommentToken(token: Token): void;
    handleContentToken(token: Token): void;
    handleParamToken(token: Token): void;
    protected stripTag(token: Token): string | undefined;
    protected processContent(content: string): string | number;
    parseAttributes(token: Token): any;
}
export = Builder;
