


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
  
  export const tokenTypes = {
    LITERAL_CONTENT: "ContentTagLiteral",
    LITERAL_START: "StartTagLiteral",
    LITERAL_END: "EndTagLiteral",
    LITERAL_SELF_CLOSING: "SelfClosingLiteral",
    LITERAL_PARAM:"ParamTagLiteral",
    LITERAL_CDATA:"CDATALiteral",
    LITERAL_COMMENT:"CommentLiteral"
  }