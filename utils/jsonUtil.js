const getSqlFieldQuery = (field, operator, value) => {
    return {field, operator, value}
}

/**
 * 获取key所在json中的顺序节点号（需要将子节点遍历完后继续兄弟节点）
 * @param nodeKey
 * @param jsonData
 */
const getNodeOrderNo = (nodeKey, jsonData)=>{

}

module.exports = {
    getSqlFieldQuery
}