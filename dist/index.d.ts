import Parser = require("./lib/parser");
import { Options } from "./lib/types";
declare function parseStringSync(xml: string, options?: Options): Object;
declare function parseFileSync(filename: string, options?: Options): Object;
declare function parseString(xml: string, options?: Options): Object;
declare function parseFile(filename: string, options?: Options): Object;
export { Parser, parseStringSync, parseFileSync, parseString, parseFile };
