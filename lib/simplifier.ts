import {Node} from './types'

class Simplifier
{
    simplify(root: Node) : any
    {
        let result: any
        
        result = {}

        result[root.name] = root.content?root.content:{}

        this.helper(root, result[root.name])

        return result 
    }

    private helper(node: Node, result: any) : any
    {
        // check if result is soemthing other than an object
        if (!(typeof result === 'object')) return result

        for (var child of node.children)
        {
            let append = child.content ? child.content : {}

            if (result[child.name] && Array.isArray(result[child.name]))
            {
                result[child.name].push(append)
            } else if (result[child.name]) {
                result[child.name] = [result[child.name]]
                result[child.name].push(append)
            } else {
                result[child.name] = append
            }

            this.helper(child, append)
        }
        return result
    }
}

export = Simplifier