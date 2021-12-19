


export interface Token {
    type: string;
    value: string;
    line: number | null;
  }

export interface Node {
  name: string;
  attributes: Object |  any;
  children: Array<Node>;
  content: any;
}

export interface Options {
  encoding?: BufferEncoding;
  stream?:boolean;
  preserve_whitespace?:boolean;
  convert_values?:boolean;
  strict?: boolean;
}

export const defaultOptions:Options = {
    encoding: "utf-8",
    stream:false,
    preserve_whitespace: false,
    convert_values: true,
    strict:true
  }