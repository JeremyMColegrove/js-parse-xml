class XMLNode {
    constructor(name="", parent=null) {
        this.content = ""
        this.atrributes = {}
        this.name = name
        this.children = []
        this.parent = parent
    }
}

module.exports = XMLNode