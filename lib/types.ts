export interface Options {
    encoding?: string;
    stream?:boolean;
    preserve_whitespace?:boolean;
    convert_values?:boolean;
    debug?:boolean;
    benchmark?:boolean;
  }

export interface Token {
    type: string;
    value: string;
    line: number | null;
  }