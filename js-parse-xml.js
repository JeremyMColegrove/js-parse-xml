// @ts-check
const fs = require('fs')
const es = require('event-stream')


const LINE_ONLY = "%s\x1b[0m"
const YELLOW = "\x1b[33m%s\x1b[0m"
const RED = "\x1b[31m"
const BLACK = "\x1b[30m"
//Background colors
const BGRED = "\x1b[41m"
const BGYELLOW = "\x1b[43m"

const RESET = "\x1b[0m"


// xml schema to implement rules for this parser
// https://www.w3.org/TR/1998/REC-xml-19980210

function warn(message) {
    console.warn(BGYELLOW, BLACK, message, RESET)
}
function error(message) {
    console.error(BGRED, BLACK, message, RESET)
}

/**
 * 
 * @param {string} filename Relative or absolute path to XML file.
 * @param {Object} options XML parsing options
 * @returns {Object}
 */
function parseFileSync(filename, options={})
{
    if (options.stream) warn("js-parse-xml warning: flag 'stream' will be ignored by synchronous call. Use parseFile() to stream file.")
    
    let lwx_parser = new LWX()
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
function parseStringSync(xml, options={})
{
    let lwx_parser = new LWX()
    lwx_parser.parse_line(xml)
    return lwx_parser.get_result()
}

/**
 * 
 * @param {string} xml XML string to parse
 * @param {Object} options XML parsing options
 * @returns {Promise}
 */
async function parseString(xml, options={})
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
async function parseFile(filename, options={})
{
    return new Promise((resolve, reject)=> {

        if (!options.stream) {
            return resolve(parseFileSync(filename, options))
        }


        let lwx_parser = new LWX()
        // stream the file
        fs.createReadStream(filename, 'utf8')
        .on('data', (chunk)=> {
            // in case it reads in the chunk as a buffer
            if (chunk instanceof Buffer) chunk = chunk.toString('utf8')
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
    #token
    #index
    #result
    #nodes
    #highest_id
    #data
    #start_tag
    #end_tag
    #preserve
    #default
    #white_space
    #in_comment
    #errors

    constructor() 
    {
        /**
         * @property {string} token current token it is parsing
         * @property {number} index current index it is parsing
         * @property {Object} result final object tree
         * @property {Array<Node>} nodes Array of the current path through the tree
         * @property {number} highest_id An ID that each new node receives so we can keep track of duplicates
         * @property {string} data A buffer to store XML data split across multiple lines
         * @property {number} start_tag Stores the index of the starting tag
         * @property {number} end_tag Stores the index of the end tag
         * @property {boolean} in_comment Stores whether or not we are currently parsing a comment
         * 
         */

        this.#reset_parser()
    }

    /**
     * Resets all internal variables used for parsing
     */
    #reset_parser()
    {
        this.#token = ''

        this.#index = -1

        this.#result = {}

        this.#nodes = []

        this.#highest_id = 0

        this.#data = ""

        this.#start_tag = 0

        this.#end_tag = 0

        this.#preserve = "preserve"

        this.#default = "default"

        this.#white_space = this.#default

        this.#in_comment = false

        this.#errors = 0
    }

    /**
     * Removes all built in metadata used while constructing the object (all __id keys)
     * @param {Object} obj 
     */
    #finalize(obj)
    {
        let key = "__id"

        for(var prop in obj) 
        {
            if (prop === key)
            delete obj[prop];
            else if (typeof obj[prop] === 'object')
            this.#finalize(obj[prop]);
        }

        if(Array.isArray(obj))
        {
            obj.forEach(item => {
              this.#finalize(item)
            });
        }
        else if(typeof obj === 'object' && obj != null)
        {
            Object.getOwnPropertyNames(obj).forEach(item=> {
                if(item == key) delete obj[key];
                else this.#finalize(obj[item]);
            });
        }
    }

    get_result() {
        this.#finalize(this.#result)
        return this.#result
    }
    /**
     * Prints out a warning to the console
     * @param {string|number} message - The message to print out
     */
    #warning(message)
    {
        // console.log(chalk.yellow(`${++this.errors}) Warning: ${message}`))
        console.log(`${++this.#errors}) Warning: ${message}`)
    }

    /**
     * Increments {@link #index} and {@link #token}
     * @param {string} xml - The xml string we are parsing
     * @returns {boolean}
     */
    #eat_char(xml)
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
    #is_end_tag(tag)
    {
        if (tag.charAt(0) == "/") return true
        return false
    }

    /**
     * Checks if a given tag is self closing
     * @param {string} tag Tag to check 
     * @returns  {boolean}
     */
    #is_self_closing(tag)
    {
        if (tag.charAt(tag.length - 1) == "/") return true
        return false
    }

    /**
     * Checks if given tag is a parameter tag
     * @param {string} tag - Tag to check
     * @returns {boolean}
     */
    #is_param_tag(tag)
    {
        let first_letter = tag.charAt(0)
        if (first_letter == "?" || first_letter == "!" ) 
        {
            // 2.8 Prolog and Document Type Declaration
            // The document type declaration must appear before the first element in the document.
            if (this.#nodes.length > 0)
                this.#warning("The document type declaration must appear before the first element in the document")
            return true
        }
        return false
    }

    /**
     * Checks if given tag is a CDATA tag
     * @param {string} xml - XML string
     * @returns {boolean}
     */
    #is_cdata_tag(xml)
    {
        let cdata_tag = xml.substring(this.#start_tag, this.#start_tag + 9)
        if (cdata_tag == "<![CDATA[") return true
        return false
    }

    /**
     * Checks if given tag is a comment tag
     * @param {string} xml - XML string
     * @returns {boolean}
     */
    #is_comment_tag(xml)
    {
        let comment_tag = xml.substring(this.#start_tag, this.#start_tag + 4)
        if (comment_tag == "<!--") return true
        return false
    }

    /**
     * Extracts the CDATA from a given CDATA tag
     * Will eat the XML until it finds closing tags
     * @param {string} xml - The XML we are parsing
     */
    #extract_cdata(xml)
    {
        // get all of the CDATA string
        let cdata = ""
        // read forward until ]]> tag is found
        while (this.#eat_char(xml) && !cdata.endsWith("]]>"))
        {
            cdata += this.#token
        }

        // start both the end and start tag from the same place
        this.#end_tag = this.#index
        this.#start_tag = this.#index
        // extract the cdata from the string
        cdata = cdata.substring(8, cdata.length - 3)

        if (this.#white_space == this.#default) 
            cdata = cdata.trim()

        
        this.#data += cdata
    }

    /**
     * Data split up on multiple lines gets processed correctly, but tags split on differnet lines do not
     * TODO: allow for tags to be split on multiple lines
     * Example -- if the parser were to read this in, it should handle it correctly
     *      lineNr      Text
     *      1.          <patie
     *      2.          nce > test </pat
     *      3.          ience>
     */

    /**
     * Parses a line of XML
     * @param {string} xml - The line of XML to parse
     * @returns {void}
     */
    parse_line(xml)
    {
        this.#index = -1
        this.#end_tag = -1
        this.#start_tag = -1
        // go through all of the characters
        while (this.#eat_char(xml))
        {
            // if we find the start of a tag
            if (this.#token == "<")
            {

                this.#start_tag = this.#index

                // w3 2.7 CDATA <![CDATA[<greeting></greeting>]]> should be treated as data not XML
                // look for <![CDATA[ start tag
                
                if (this.#is_cdata_tag(xml))
                {
                    this.#extract_cdata(xml)   
                }
                
                // try and get the data between end and start tags (if any)
                else if (this.#start_tag > 0)
                {
                    if (this.#is_comment_tag(xml))
                    {
                        //this will ignore all tags and data until > is found
                        this.#in_comment = true
                    }
                    let new_data = xml.substring(this.#end_tag+1, this.#start_tag)
                    if (this.#white_space == this.#default)
                    {
                        new_data = new_data.trim()
                    }
                    this.#data += new_data
                    
                }
            }
            // if we reach the end of the comment
            else if (this.#token == ">" && this.#in_comment)
            {
                this.#end_tag = this.#index
                this.#in_comment = false
            }
            // if we find the end of a tag
            else if (this.#token == ">" && !this.#in_comment)
            {
                
                // try and parse the tag with the information in it
                this.#end_tag = this.#index
                let tag = xml.substring(this.#start_tag+1, this.#end_tag)
                if (tag.trim())
                {   

                    if (!this.#is_param_tag(tag))
                    {
                        this.#parse_tag(tag, this.#data)
                        // clear all of the data
                        this.#data = ""
                    } 
                }
                //now reset the start tag
                this.#start_tag = this.#end_tag
            }
        }

        // if there is some data on another line, append to our buffer
        if (this.#end_tag != this.#index && !this.#in_comment)
        {
            // append data
            let new_data = xml.substring(this.#end_tag+1, this.#index)
            if (this.#white_space == this.#default)
            {
                new_data = new_data.trim()
            }
            this.#data += new_data
        }
    }

    /**
     * 
     * @param {string} tag The tag to pre-process 
     * @returns {string}
     */
    #preprocess_tag(tag) {
        // tags will not have any / in them. this is a basic rule of xml, and also removes / from self closing tags
        // @ts-ignore
        tag = tag.replaceAll('/', '')

        // also split any namespaces from the tag
        let tag_split = tag.split(":")
        tag = tag_split[tag_split.length-1]

        return tag
    }

    
    /**
     * Takes a tag and parses it, and adds it into the {@link #result} object
     * @param {string} tag 
     * @param {string|void} data 
     */
    #parse_tag(tag, data)
    {
        // split the tag up into its important parts
        let tag_split = tag.split(/[= ]/)

        if (this.#is_end_tag(tag))
        {
            // we have an end tag, add the data and all branches
            this.#update_tree(data)
            // remove the last node from the tree
            this.#nodes.pop()
        }
        else
        {
            // w3 2.2: check if root node is the only node that exists (it should)
            if (this.#nodes.length > 0 && tag_split[0] == this.#nodes[0].name)
                this.#warning(`Root node '${tag_split[0]}' should only appear once.`)

            
            // split the tag into important parts


            // w3 2.3: check if tag contains ; (reserved for experimental namespaces)
            if (tag_split[0].includes(";"))
                this.#warning(`XML name '${tag_split[0]}' should not contain ';', in the future this will be reserved for namespaces.`)

            
            // construct the new node
            let new_node = {name:this.#preprocess_tag(tag_split[0]), __id:this.#highest_id++}

            // 2.10 White Space Handling
            // check for white space declarations
            for (var i=1; i<tag_split.length; i++)
            {
                if (tag_split[i] == "xml:space")
                {
                    if (i < tag_split.length-1)
                    {
                        // @ts-ignore
                        let space = tag_split[i+1].replaceAll("\"", "")
                        if (space != this.#default && space != this.#preserve)
                        {
                            this.#warning(`Invalid xml:space value '${space}' found. Valid values are 'default' and 'preserve'.`)
                        } else
                        {
                            new_node.__white_space = space
                        }
                    } else
                    {
                        this.#warning("Invalid XML markup found for attribute xml:space")
                    }
                }
            }
            
            // push the new node on only if it is not self_closing
            if (!this.#is_self_closing(tag))
            {
                this.#nodes.push(new_node)
                // traverse the tree when a new node is discovered in case the node contains important properties
                // about reading data in the node (like whitespace)
                this.#update_tree(null, tag_split)
            } else {
                new_node.self_closing = true
                this.#nodes.push(new_node)
                this.#update_tree(null, tag_split)
                this.#nodes.pop()
            }

            
        }
    }

    /**
     * Updates the tree using the path from {@link #nodes}, and insert data if needed
     * @param {string|void} [data] Data inside of tags
     * @param {Array} [attributes] Tag attributes
     */
    #update_tree(data=null, attributes=null)
    {
        // takes in the tree node and the parent and will construct object for result tree
        function construct_new_node(node)
        {
            let result = {}
            result.__id = node.__id

            // add in all relevant information into the final tree here
            if (node.__white_space) result.__white_space = node.__white_space
            return result
        }


        // reset any parser params here (like whitespace attribute)
        this.#white_space = this.#default

        let previous = this.#result

        let branch

        for (var i=0; i<this.#nodes.length; i++)
        {

            // deal with self closing tags first
            // if (this.#nodes[i].self_closing)
            // {
            //     if (!previous[this.#nodes[i].name]) {
            //         previous[this.#nodes[i].name] = null
            //     }
            //     continue;
            // }


            // if the branch does not exist, add it
            if (previous[this.#nodes[i].name] === undefined)
            {
                // add the branch as an empty object
                previous[this.#nodes[i].name] = construct_new_node(this.#nodes[i])
            } 
            else if (Array.isArray(previous[this.#nodes[i].name]) && previous[this.#nodes[i].name][previous[this.#nodes[i].name].length-1].__id != this.#nodes[i].__id)
            {
                previous[this.#nodes[i].name].push(construct_new_node(this.#nodes[i]))
            }
            // if the branch is null (probably a self closing tag) or it does exist, check if it is a new branch by comparing the __id
            else if (!previous[this.#nodes[i].name] || (!Array.isArray(previous[this.#nodes[i].name]) && previous[this.#nodes[i].name].__id != this.#nodes[i].__id))
            {
                // convert object to array and add a new element
                previous[this.#nodes[i].name] = [previous[this.#nodes[i].name]]
                previous[this.#nodes[i].name].push(construct_new_node(this.#nodes[i]))
            }
            
            // if it is an array
            if (Array.isArray(previous[this.#nodes[i].name]))
            {
                // get the last element
                branch = previous[this.#nodes[i].name][previous[this.#nodes[i].name].length - 1]
            } else {
                // just access the element
                branch = previous[this.#nodes[i].name]
            }

            // update any params based on the attributes of the node just entered (white space and such)
            if (branch && branch.__white_space) this.#white_space = branch.__white_space

            // insert any attributes here
            // if it is the last node, replace the default object with the desired data
            /***
             * TODO use the attributes to insert attributes followed by @ sign in the node.
             * ISSUE how do we handle a tag with both an attribute and data? ignore the attribute?
             * */
            if (i == this.#nodes.length - 1) 
            {
                if ((data && data.trim()) || this.#nodes[i].self_closing)
                {
                    // insert any data/new tag data here
                    if (Array.isArray(previous[this.#nodes[i].name]))
                    {
                        previous[this.#nodes[i].name] [previous[this.#nodes[i].name].length - 1] = data
                    } else
                    {
                        previous[this.#nodes[i].name] = data
                    }         
                }
            }
            previous = branch
        }
    }
}

module.exports = {parseFile, parseFileSync, parseString, parseStringSync}