const { query } = require('../../model/danpinDbConn')
const combinationProductCodeRepo = {}

combinationProductCodeRepo.get = async (skuids) => {
    let sql = `SELECT \`组合商品编码\` AS sku_id, \`商品编码\` AS sku_code 
        FROM combination_product_code WHERE \`组合商品编码\` IN ("${skuids}")`
    let result = await query(sql)
    return result
}

module.exports = combinationProductCodeRepo