const { query } = require('../../model/danpinDbConn')
const goodsInfoRepo = {}

goodsInfoRepo.get = async (skuids) => {
    let sql = `SELECT \`工期\` AS purchase_time, \`商品编码\` AS sku_id, \`spu简称\` AS spu  
        FROM goods_info WHERE \`商品编码\` IN ("${skuids}") ORDER BY \`spu简称\``
    let result = await query(sql)
    return result
}

module.exports = goodsInfoRepo