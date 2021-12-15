
/**
 * 
 * @param {Object} root 
 * @returns {Object}
 */

function convert(root)
{
    let result = {}
    result[root.name] = root.content?root.content:{}
    helper(root, result[root.name])
    return result
}

/*
All of the global attributes available for XML nodes
*/

/**
 * 
 * @param {Object} node 
 * @param {Object} result 
 * @returns {Object}
 */
function helper(node, result)
{
    for (var child of node.children)
    {
        
        // format the new content however we want -- this just pastes it in as plain text
        let append = child.content? child.content : {}

        if (result[child.name] && Array.isArray(result[child.name]))
        {
            result[child.name].push(append)
        } else if (result[child.name]) {
            result[child.name] = [result[child.name]]
            result[child.name].push(append)
        } else {
            result[child.name] = append
        }       

        helper(child, append)
    }
    return result
}

module.exports = convert