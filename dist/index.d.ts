/**
 * @remark Hey there
 */
import Parser = require("./lib/parser");
import { Options } from "./lib/types";
declare function parseStringSync(xml: string, options?: Options): Object;
export { Parser, parseStringSync };
