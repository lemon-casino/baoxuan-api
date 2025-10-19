const { query } = require('../../model/danpinDbConn')
const goodsInfoRepo = {}

goodsInfoRepo.get = async (skuids) => {
    let sql = `SELECT \`工期\` AS purchase_time, \`商品编码\` AS sku_id, \`spu简称\` AS spu,  
            \`一级类目\` AS first_category, \`二级类目\` AS second_category, 
            \`三级类目\` AS third_category, \`开发员\` AS director, \`市场|吊牌价\` AS price 
        FROM goods_info WHERE \`商品编码\` IN ("${skuids}") ORDER BY \`spu简称\``
    let result = await query(sql)
    return result
}

module.exports = goodsInfoRepo