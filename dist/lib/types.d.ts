/// <reference types="node" />
export interface Token {
    type: string;
    value: string;
    line: number | null;
}
export interface Node {
    name: string;
    attributes: Object | any;
    children: Array<Node>;
    content: any;
}
export interface Options {
    encoding?: BufferEncoding;
    stream?: boolean;
    preserve_whitespace?: boolean;
    convert_values?: boolean;
    strict?: boolean;
}
export declare const defaultOptions: Options;
