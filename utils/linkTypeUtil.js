const linkTypeConst = require("../const/linkTypeConst")

const getLinkGroupName = (originLinkType) => {
    for (const group of linkTypeConst.groups) {
        if (group.items.includes(originLinkType)) {
            return group.name
        }
    }
    return null
}

module.exports = {
    getLinkGroupName
}