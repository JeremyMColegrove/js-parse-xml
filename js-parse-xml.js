const fs = require('fs')

//for node based parsing, somewhat faster and less code but more memory usage...bad for large files
// const XMLNode = require('./experimental/xml_node')
// const convert = require('./experimental/nodes_to_json')

const LINE_ONLY = "%s\x1b[0m"
const YELLOW = "\x1b[33m%s\x1b[0m"
const RED = "\x1b[31m"
const MAGENTA = "\x1b[35m"

const BLACK = "\x1b[30m"
//Background colors
const BGRED = "\x1b[41m"
const BGYELLOW = "\x1b[43m"

const RESET = "\x1b[0m"


// xml schema to implement rules for this parser
// https://www.w3.org/TR/1998/REC-xml-19980210

function warn(message) {
    console.warn(BGYELLOW, BLACK, "WARN", RESET, MAGENTA,"js-parse-xml", RESET, message)
}

function error(message) {
    console.error(BGRED, BLACK, "ERROR", RESET, MAGENTA,"js-parse-xml", RESET, message)
}

// the default options for parsing the XML
let default_options = {
    encoding:'utf8',
    stream:false,
    preserve_whitespace:false,
    convert_values:true,
    debug:true,
    benchmark:false
}
/**
 * 
 * @param {string} filename Relative or absolute path to XML file.
 * @param {Object} options XML parsing options
 * @returns {Object}
 */
function parseFileSync(filename, options=default_options)
{
    options = Object.assign({}, default_options, options)
    if (options.stream) warn("js-parse-xml warning: flag 'stream' will be ignored by synchronous call. Use parseFile() to stream file.")
    
    let lwx_parser = new LWX(options)
    let data = fs.readFileSync(filename, 'utf-8')
    lwx_parser.parse_line(data)
    return lwx_parser.get_result()
}

/**
 * 
 * @param {string} xml XML string to parse
 * @param {Object} options XML parsing options
 * @returns {Object}
 */
function parseStringSync(xml, options=default_options)
{
    options = Object.assign({}, default_options, options)

    let lwx_parser = new LWX(options)
    lwx_parser.parse_line(xml)
    return lwx_parser.get_result()
}

/**
 * 
 * @param {string} xml XML string to parse
 * @param {Object} options XML parsing options
 * @returns {Promise}
 */
async function parseString(xml, options=default_options)
{
    return new Promise((resolve, reject)=> {
        return resolve(parseStringSync(xml, options))
    })
}

/**
 * 
 * @param {string} filename Relative or absolute path to XML file.
 * @param {Object} options XML parsing options
 * @returns {Promise}
 */
async function parseFile(filename, options=default_options)
{
    return new Promise((resolve, reject)=> {

        if (!options.stream) {
            return resolve(parseFileSync(filename, options))
        }

        options = Object.assign({}, default_options, options)

        let lwx_parser = new LWX(options)
        // stream the file
        fs.createReadStream(filename, {encoding:options.encoding})
        .on('data', (chunk)=> {
            // @ts-ignore
            lwx_parser.parse_line(chunk)
        })
        .on('end', ()=>{
            resolve(lwx_parser.get_result())
        })
        .on('error', (error)=>{
            console.error(error)
            resolve(null)
        })

    })
}

class LWX 
{
    #tree
    #token
    #index
    #data
    #tag
    #in_tag
    #cdata
    #in_cdata
    #attributes
    #options
    #root
    constructor(options) 
    {
        /**
         * @property {Object} tree the json representation of the xml
         * @property {string} token current token it is parsing
         * @property {number} index current index it is parsing
         * @property {Object} result final object tree
         * @property {Object} current_node
         * @property {number} highest_id An ID that each new node receives so we can keep track of duplicates
         * @property {string} data A buffer to store XML data split across multiple lines
         * @property {boolean} in_comment Stores whether or not we are currently parsing a comment
         * @property {string} tag Stores the current tag it is parsing
         */

        // set flags here for our options
        this.#options = options   
        this.reset_parser()

        if (this.#options.benchmark)
            console.time("benchmark")
    }

    /**
     * Resets all internal variables used for parsing
     */
    reset_parser()
    {
        this.#tree = null

        this.#token = ''

        this.#index = -1


        this.#data = ""

        this.#tag = ""

        this.#cdata = ""

        this.#in_cdata = false

        this.#in_tag = false

        this.#attributes = {}
    }

    get_result() {
        // remove any temporary variables
        this.#tree?delete this.#tree["@root"]:null
        this.#tree?delete this.#tree["@name"]:null
        this.#tree?delete this.#tree["@attributes"]:null

        if (this.#options.benchmark)
            console.timeEnd("benchmark")

        return this.#tree//convert(this.#tree)
    }

    /**
     * Increments {@link #index} and {@link #token}
     * @param {string} xml - The xml string we are parsing
     * @returns {boolean}
     */
    eat_char(xml)
    {
        this.#index ++
        if (this.#index < xml.length)
        {
            this.#token = xml.charAt(this.#index);
            return true
        }
        return false
    }

    /**
     * Checks if given tag is a closing tag
     * @param {string} tag - Tag to check
     * @returns {boolean}
     */
    is_end_tag(tag)
    {
        if (tag.charAt(0) == "/") return true
        return false
    }

    /**
     * Checks if a given tag is self closing
     * @param {string} tag Tag to check 
     * @returns  {boolean}
     */
    is_self_closing(tag)
    {
        if (!tag) return false
        if (tag.charAt(tag.length - 1) == "/") return true
        return false
    }

    /**
     * Checks if given tag is a parameter tag
     * @param {string} tag - Tag to check
     * @returns {boolean}
     */
    is_param_tag(tag)
    {
        let first_letter = tag.charAt(0)
        if (first_letter == "?" || first_letter == "!" ) 
        {
            // 2.8 Prolog and Document Type Declaration
            // The document type declaration must appear before the first element in the document.
            if (this.#root)
                warn("The document type declaration must appear before the first element in the document")
            return true
        }
        return false
    }

    /**
     * Checks if given tag is a CDATA tag
     * @param {string} tag - XML tag
     * @returns {boolean}
     */
    is_cdata_tag(tag)
    {
        return tag.startsWith("![CDATA[")
    }

    
    /**
         * Extracts the CDATA from a given CDATA tag
         * Will eat the XML until it finds closing tags
         */
    extract_cdata(xml)
    {
        this.#in_cdata = true
        while (this.eat_char(xml)) {       
            this.#cdata += this.#token

            if (this.#cdata.endsWith("]]>")) {
                this.#in_cdata = false
                this.#data += this.#cdata.substring(0, this.#cdata.length - 3)
                this.#cdata = ""
                this.#tag = ""
                break
                
            }
        }
        
    }
    /**
     * Checks if given tag is a comment tag
     * @param {string} tag - the tag to check
     * @returns {boolean}
     */
    is_comment_tag(tag)
    {
        if (tag.charAt(0) == "!" && tag.charAt(1) == "-" && tag.charAt(2) == "-") return true
        return false
    }

    

    /**
     * Parses a line of XML
     * @param {string} xml - The line of XML to parse
     * @returns {void}
     */
    parse_line(xml)
    {
        this.#index = -1
        // go through all of the characters


        if (this.#in_cdata)
        {
            this.extract_cdata(xml)
        }

        while (this.eat_char(xml))
        {
            

            if (this.#token == "<") 
            {
                // we must add any data that we have
                this.#in_tag = true
                continue
            }
            else if (this.#token == ">" && this.#in_tag) 
            {
                this.handle_tag(this.#tag)
                this.#in_tag = false
                continue
            }

            // if we are in a tag, append to tag
            if (this.#in_tag)
            {
                this.#tag += this.#token

                // check to see if we are building a CDATA tag
                if (this.is_cdata_tag(this.#tag))
                {
                    this.extract_cdata(xml)
                }
            } 
            // otherwise we are appending data
            else 
            {
                // must be some data, so add it to the data
                this.#data += this.#token
            }
        }

    }


    handle_tag(tag)
    {
        if (!tag) return

        if (this.is_comment_tag(tag))
        {
            // console.log("Comment found", tag)
        } 
        else if (this.is_cdata_tag(tag))
        {   
            this.extract_cdata(tag)
        } 
        else if (this.is_param_tag(tag)) 
        {
            // console.log("Param tag found", tag)
        } 
        else 
        {
            this.parse_tag(tag)
        }
        // the tag is parsed, reset it
        this.#tag = ""
    }
    /**
     * 
     * @param {string} tag The tag to pre-process 
     * @returns {string}
     */
    preprocess_tag(tag) {
        // tags will not have any / in them. this is a basic rule of xml, and also removes / from self closing tags
        tag = tag.trim()

        if (tag.charAt(0) == "/")
        {
            tag = tag.substring(1)
        }

        if (tag.charAt(tag.length - 1) == "/")
        {
            tag = tag.substring(0, tag.length - 1)
        }

        let tag_split = tag.split(":")
        tag = tag_split.pop()

        return tag
    }


    /**
     * Takes a tag and parses it, and adds it into the {@link #result} object
     * @param {string} tag 
     */
    parse_tag(tag)
    {
        // split the tag up into its important parts
        var tag_split = tag.split(/[= ]/)

        if (this.is_end_tag(tag))
        {
            // back up the tree
            if (this.#data.trim())
                this.add_content(this.#data)

            this.#data = ""
            this.navigate_outside()
        }
        else
        {
            // if it is a start tag, disregard any data that we read previously
            this.#data = ""

            // w3 2.2: check if root node is the only node that exists (it should)
            if (this.#root==tag_split[0])
                warn(`Root node '${tag_split[0]}' should only appear once.`)

            
            // split the tag into important parts
            // w3 2.3: check if tag contains ; (reserved for experimental namespaces)
            if (this.#options.debug && tag_split[0].includes(";"))
                warn(`XML name '${tag_split[0]}' should not contain ';', in the future this will be reserved for namespaces.`)

            
            // construct a new default node
            let node = {
                
                // name: this.preprocess_tag(tag_split[0]),
                // attributes: {},
                // parent: null
            }
            let name = this.preprocess_tag(tag_split[0])

            // make circular link with parent
            node[name] = {}
            node["@name"] = name
            node['@attributes'] = {}

            // collect all attributes -- skip 1 for the tag name
            for (var i=1; i<tag_split.length && i<tag_split.length-1; i+=2)
            {
                var value = tag_split[i+1].substring(1, tag_split[i+1].length - 1)

                // add any attributes into the global attributes array
                this.#attributes[tag_split[i]] = value
                // also add it into local
                node['@attributes'][tag_split[i]] = value
            }



            // push the new node on only if it is not self_closing
            this.navigate_inside(node)

            if (this.is_self_closing(tag))
            {
                this.add_content({})
                this.navigate_outside()
            }
        }
    }

    navigate_inside(node)
    {
        node["@parent"] = this.#tree

        // copy all of the local data into the global data
        this.#attributes = Object.assign({}, node['@attributes'], this.#attributes)

        if (!this.#tree) {
            node["@parent"] = node
            node["@root"] = true
            this.#root = node
            return this.#tree = node
        }

        let name = this.#tree["@name"]
        let child = node["@name"]

        
        if (this.#tree[name][child] && !Array.isArray(this.#tree[name][child]))
            this.#tree[name][child] = [this.#tree[name][child]]


        if (Array.isArray(this.#tree[name][child]))
        {
            this.#tree[name][child].push(node[child])
        }
        else
        {
            this.#tree[name][child] = node[child]
        }

        this.#tree = node
    }

    process_content(content)
    {
        if (Object.prototype.toString.call(content) === "[object String]")
        {
            // first apply any attributes on the string

            if (!this.#options.preserve_whitespace && this.#attributes['xml:space'] != "preserve") content = content.trim()
            
            // convert decimals and hex strings to numbers
            if (this.#options.convert_values)
            {
                if (!isNaN(content)) {
                    // test if it is hex
                    if (content.includes("x"))
                        content = Number.parseInt(content, 16)
                    else if (content.includes("."))
                        content = Number.parseFloat(content)
                    else
                        content = Number.parseInt(content)
                }
            }

            return content
        }
        return content
    }

    add_content(content)
    {

        content = this.process_content(content)

        // console.log(this.#tree)
        let name = this.#tree["@parent"]["@name"]
        let child = this.#tree["@name"]
        // if the child is an array
        if (Array.isArray(this.#tree["@parent"][name][child]))
        {
            this.#tree["@parent"][name][child].pop()
            this.#tree["@parent"][name][child].push(content)
        } else {
            //check if circular root obj
            if (this.#tree["@root"])
            {
                this.#tree[child] = content
            } else {
                this.#tree["@parent"][name][child] = content
            }
        }
    }

    navigate_outside()
    {   
        let temp = this.#tree["@parent"]
        delete this.#tree["@parent"]
        this.#tree = temp

        // update our gobal attributes to our local attributes since we are stepping backwards
        this.#attributes = Object.assign({}, this.#tree['@attributes'])
    }


    /**************************************************************************************************\
        functions for node-based parsing. maybe 15% faster and much less code, but higher memory usage
    \**************************************************************************************************/
    // navigate_inside(node)
    // {
    //     let new_node = new XMLNode(node.name, this.#tree)
    //     new_node.atrributes = node.attributes;

    //     if (!this.#tree) return this.#tree = new_node

    //     this.#tree.children.push(new_node)
    //     this.#tree = new_node
    // }

    // add_content(content)
    // {
    //     this.#tree.content = this.process_content(content)
    // }

    // navigate_outside()
    // {
    //     this.#tree = this.#tree["@parent"]
    // }
}

module.exports = {parseFile, parseFileSync, parseString, parseStringSync}