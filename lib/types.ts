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

export const defaultOptions = {
    encoding: "utf-8",
    stream: false,
    preserve_whitespace: false,
    convert_values: true,
    debug: true,
    benchmark: false
}