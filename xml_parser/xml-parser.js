
// @ts-check

// xml schema to implement rules for this parser
// https://www.w3.org/TR/1998/REC-xml-19980210

import chalk from 'chalk'

/**
 * XML class
 * 
 */
class light_xml_parser {
    constructor() {
        /**
         * @property {string} token current token it is parsing
         */
        this.token = ''

        /**
         * @property {number} index current index it is parsing
         */
        this.index = -1

        /**
         * @property {Object} result final object tree
         */
        this.result = {}

        /**
         * A node object that is part of {@link nodes} which track current path through XML
         * @typedef {Object} Node
         * @property {number} __id - Node ID
         * @property {string} [__white_space] - Whitespace value
         * @property {string} name - Node name
         */

        /**
         * @property {Array<Node>} nodes Array of the current path through the tree
         */
        this.nodes = []

        /**
         * @property {number} highest_id An ID that each new node receives so we can keep track of duplicates
         */
        this.highest_id = 0

        /**
         * @property {string} data A buffer to store XML data split across multiple lines
         */
        this.data = ""

        /**
         * @property {number} start_tag Stores the index of the starting tag
         */
        this.start_tag = 0
        /**
         * @property {number} end_tag Stores the index of the end tag
         */
        this.end_tag = 0

        //node properties
        this.preserve = "preserve"
        this.default = "default"
        this.white_space = this.default

        /**
         * @property {boolean} in_comment Stores whether or not we are currently parsing a comment
         */
        this.in_comment = false

        //how many errors
        this.errors = 0
    }

    /**
     * Prints out a warning to the consol
     * @param {string|number} message - The message to print out
     */
    warning(message)
    {
        console.log(chalk.yellow(`${++this.errors}) Warning: ${message}`))
    }

    /**
     * Returns the final constructed object
     * @returns {Object}
     */
    get_result()
    {
        return this.result
    }

    /**
     * Increments {@link index} and {@link token}
     * @param {string} xml - The xml string we are parsing
     * @returns {boolean}
     */
    eat_char(xml)
    {
        this.index ++
        if (this.index < xml.length)
        {
            this.token = xml.charAt(this.index);
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
        if (tag.charAt(0) == "/" || tag.charAt(tag.length-1)=="/") return true
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
            if (this.nodes.length > 0)
                this.warning("The document type declaration must appear before the first element in the document")
            return true
        }
        return false
    }

    /**
     * Checks if given tag is a CDATA tag
     * @param {string} xml - XML string
     * @returns {boolean}
     */
    is_cdata_tag(xml)
    {
        let cdata_tag = xml.substring(this.start_tag, this.start_tag + 9)
        if (cdata_tag == "<![CDATA[") return true
        return false
    }

    /**
     * Checks if given tag is a comment tag
     * @param {string} xml - XML string
     * @returns {boolean}
     */
    is_comment_tag(xml)
    {
        let comment_tag = xml.substring(this.start_tag, this.start_tag + 4)
        if (comment_tag == "<!--") return true
        return false
    }

    /**
     * Extracts the CDATA from a given CDATA tag
     * Will eat the XML until it finds closing tags
     * @param {string} xml - The XML we are parsing
     */
    extract_cdata(xml)
    {
        // get all of the CDATA string
        let cdata = ""
        // read forward until ]]> tag is found
        while (this.eat_char(xml) && !cdata.endsWith("]]>"))
        {
            cdata += this.token
        }
        this.end_tag = this.index+1
        this.start_tag = this.index
        cdata = cdata.substring(8, cdata.length - 3)
        this.data += cdata
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
     * @returns null
     */
    parse_line(xml)
    {
        this.index = -1
        this.end_tag = -1
        this.start_tag = -1
        // go through all of the characters
        while (this.eat_char(xml))
        {
            // if we find the start of a tag
            if (this.token == "<")
            {

                this.start_tag = this.index

                // w3 2.7 CDATA <![CDATA[<greeting></greeting>]]> should be treated as data not XML
                // look for <![CDATA[ start tag
                
                if (this.is_cdata_tag(xml))
                {
                    this.extract_cdata(xml)   
                }
                
                // try and get the data between end and start tags (if any)
                else if (this.start_tag > 0)
                {
                    if (this.is_comment_tag(xml))
                    {
                        //this will ignore all tags and data until > is found
                        this.in_comment = true
                    }
                    let new_data = xml.substring(this.end_tag+1, this.start_tag)
                    if (this.white_space == this.default)
                    {
                        new_data = new_data.trim()
                    }
                    this.data += new_data
                    
                }
            }
            // if we reach the end of the comment
            else if (this.token == ">" && this.in_comment)
            {
                this.end_tag = this.index
                this.in_comment = false
            }
            // if we find the end of a tag
            else if (this.token == ">" && !this.in_comment)
            {
                
                // try and parse the tag with the information in it
                this.end_tag = this.index
                let tag = xml.substring(this.start_tag+1, this.end_tag)
                if (tag.trim())
                {   

                    if (!this.is_param_tag(tag))
                    {
                        this.parse_tag(tag, this.data)
                        // clear all of the data
                        this.data = ""
                    } 
                }
                //now reset the start tag
                this.start_tag = this.end_tag
            }
        }

        // if there is some data on another line, append to our buffer
        if (this.end_tag != this.index && !this.in_comment)
        {
            // append data
            let new_data = xml.substring(this.end_tag+1, this.index)
            if (this.white_space == this.default)
            {
                new_data = new_data.trim()
            }
            this.data += new_data
        }
    }

    /**
     * Takes a tag and parses it, and adds it into the {@link result} object
     * @param {string} tag 
     * @param {string|void} data 
     */
    parse_tag(tag, data)
    {
        // split the tag up into its important parts
        let tag_split = tag.split(/[= ]/)

        if (this.is_end_tag(tag))
        {
            // we have an end tag, add the data and all branches
            this.update_tree(data)
            // remove the last node from the tree
            this.nodes.pop()
        }
        else
        {
            // w3 2.2: check if root node is the only node that exists (it should)
            if (this.nodes.length > 0 && tag_split[0] == this.nodes[0].name)
                this.warning(`Root node '${tag_split[0]}' should only appear once.`)

            
            // split the tag into important parts


            // w3 2.3: check if tag contains ; (reserved for experimental namespaces)
            if (tag_split[0].includes(";"))
                this.warning(`XML name '${tag_split[0]}' should not contain ';', in the future this will be reserved for namespaces.`)
            

            // construct the new node
            let new_node = {name:tag_split[0], __id:this.highest_id++}

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
                        if (space != this.default && space != this.preserve)
                        {
                            this.warning(`Invalid xml:space value '${space}' found. Valid values are 'default' and 'preserve'.`)
                        } else
                        {
                            new_node.__white_space = space
                        }
                    } else
                    {
                        this.warning("Invalid XML markup found for attribute xml:space")
                    }
                }
            }

            // push the new node on
            this.nodes.push(new_node)

            // traverse the tree when a new node is discovered in case the node contains important properties
            // about reading data in the node (like whitespace)
            this.update_tree()

        }
    }

    // uses the nodes to either add the branch or update the branch or insert data
    /**
     * Updates the tree using the path from {@link nodes}, and insert data if needed
     * @param {string|void} data 
     */
    update_tree(data=null)
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

        this.white_space = this.default
        let previous = this.result
        let branch
        for (var i=0; i<this.nodes.length; i++)
        {

            // if the branch does not exist, add it
            if (previous[this.nodes[i].name] === undefined)
            {
                // add the branch as an empty object
                previous[this.nodes[i].name] = construct_new_node(this.nodes[i])
            } 
            else if (Array.isArray(previous[this.nodes[i].name]) && previous[this.nodes[i].name][previous[this.nodes[i].name].length-1].__id != this.nodes[i].__id)
            {
                previous[this.nodes[i].name].push(construct_new_node(this.nodes[i]))
            }
            // if the branch does exist, check if it is a new branch
            else if (!Array.isArray(previous[this.nodes[i].name]) && previous[this.nodes[i].name].__id != this.nodes[i].__id)
            {
                // convert object to array and add a new element
                previous[this.nodes[i].name] = [previous[this.nodes[i].name]]
                previous[this.nodes[i].name].push(construct_new_node(this.nodes[i]))
            }
            
            // if it is an array
            if (Array.isArray(previous[this.nodes[i].name]))
            {
                // get the last element
                branch = previous[this.nodes[i].name][previous[this.nodes[i].name].length - 1]
            } else {
                // just access the element
                branch = previous[this.nodes[i].name]
            }

            // update any params based on the attributes of the node just entered (white space and such)
            if (branch.__white_space) this.white_space = branch.__white_space


            // if it is the last node, replace the default object with the desired data
            if (i == this.nodes.length - 1 && data && data.trim()) {
                previous[this.nodes[i].name] = data
            }

            previous = branch
        }
    }
}

export default light_xml_parser