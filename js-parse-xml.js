// @ts-check
const fs = require('fs')
// const es = require('event-stream')

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

/**
 * 
 * @param {string} filename Relative or absolute path to XML file.
 * @param {Object} options XML parsing options
 * @returns {Object}
 */
function parseFileSync(filename, options={debug:true})
{
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
function parseStringSync(xml, options={debug:true})
{
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
async function parseString(xml, options={debug:true})
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
async function parseFile(filename, options={debug:true})
{
    return new Promise((resolve, reject)=> {

        if (!options.stream) {
            return resolve(parseFileSync(filename, options))
        }


        let lwx_parser = new LWX(options)
        // stream the file
        fs.createReadStream(filename, 'utf8')
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
/**
 * LWX class
 * 
 */

class LWX 
{
    #tree
    #token
    #index
    #data
    #debug
    #tag
    #in_tag
    #cdata
    #in_cdata
    #attributes
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
        this.#debug = options.debug

        this.reset_parser()
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
        delete this.#tree.root
        return this.#tree
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
            // if (this.#nodes.length > 0)
            //     warn("The document type declaration must appear before the first element in the document")
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


        // also split any namespaces from the tag
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
            // if (this.#nodes.length > 0 && tag_split[0] == this.#nodes[0].name)
            //     warn(`Root node '${tag_split[0]}' should only appear once.`)

            
            // split the tag into important parts
            // w3 2.3: check if tag contains ; (reserved for experimental namespaces)
            if (this.#debug && tag_split[0].includes(";"))
                warn(`XML name '${tag_split[0]}' should not contain ';', in the future this will be reserved for namespaces.`)

            
            // construct a new default node
            let node = {}
            let name = this.preprocess_tag(tag_split[0])
            node[name] = {}
            // use an invalid key for internal use so it will not conflict
            node["<name>"] = name
            node['<attributes>'] = {}

            // collect all attributes -- skip 1 for the tag name
            for (var i=1; i<tag_split.length && i<tag_split.length-1; i+=2)
            {
                var value = tag_split[i+1].substring(1, tag_split[i+1].length - 1)

                // add any attributes into the global attributes array
                this.#attributes[tag_split[i]] = value
                // also add it into local
                node['<attributes>'][tag_split[i]] = value
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

    navigate_root()
    {
        while (!this.#tree.root)
        {
            this.navigate_outside()
        }
    }

    navigate_inside(node)
    {
        node.parent = this.#tree

        // copy all of the local data into the global data
        this.#attributes = Object.assign({}, node['<attributes>'], this.#attributes)


        if (!this.#tree) {
            node.parent = node
            node.root = true
            return this.#tree = node
        }


        if (this.#tree[this.#tree["<name>"]][node["<name>"]] && !Array.isArray(this.#tree[this.#tree["<name>"]][node["<name>"]]))
            this.#tree[this.#tree["<name>"]][node["<name>"]] = [this.#tree[this.#tree["<name>"]][node["<name>"]]]

        if (Array.isArray(this.#tree[this.#tree["<name>"]][node["<name>"]]))
        {
            this.#tree[this.#tree["<name>"]][node["<name>"]].push(node[node["<name>"]])
        }
        else
        {
            this.#tree[this.#tree["<name>"]][node["<name>"]] = node[node["<name>"]]
        }

        this.#tree = node
    }

    process_content(content)
    {
        if (Object.prototype.toString.call(content) === "[object String]")
        {
            // first apply any attributes on the string

            if (this.#attributes['xml:space'] != "preserve") content = content.trim()
            
            // convert attribute into numerical values?

            return content
        }
        return content
    }

    add_content(content)
    {

        content = this.process_content(content)
        // if the child is an array
        if (Array.isArray(this.#tree.parent[this.#tree.parent["<name>"]][this.#tree["<name>"]]))
        {
            this.#tree.parent[this.#tree.parent["<name>"]][this.#tree["<name>"]].pop()
            this.#tree.parent[this.#tree.parent["<name>"]][this.#tree["<name>"]].push(content)
        } else {
            //check if circular root obj
            if (this.#tree.root)
            {
                this.#tree[this.#tree["<name>"]] = content
            } else {
                this.#tree.parent[this.#tree.parent["<name>"]][this.#tree["<name>"]] = content
            }
        }
    }

    navigate_outside()
    {   



        // navigate outside and clean up any internal variables used
        delete this.#tree['<name>']
        delete this.#tree['<attributes>']


        let temp = this.#tree.parent
        delete this.#tree.parent
        this.#tree = temp

        // update our gobal attributes to our local attributes
        this.#attributes = Object.assign({}, this.#tree['<attributes>'])
    }
}

module.exports = {parseFile, parseFileSync, parseString, parseStringSync}