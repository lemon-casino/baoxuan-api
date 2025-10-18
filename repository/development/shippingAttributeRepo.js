const { query } = require('../../model/dbConn')
const shippingAttributeRepo = {}
shippingAttributeRepo.getBySkuInfo = async(sku) =>{
    let sql = `select * from sku_info where SKU = ? `
    let result = await query(sql,[sku])
    return result
}

shippingAttributeRepo.getInfo = async() =>{
    let sql = `select * from sku_info  `
    let result = await query(sql)
    return result
}

shippingAttributeRepo.update = async(sku,shipping_attributes) =>{
    let sql = `update sku_info set shipping_attributes = ? where SKU = ? `
    let result = await query(sql,[shipping_attributes,sku])
    return result
}

shippingAttributeRepo.batchInsert = async(count,data) =>{
    let sql = `INSERT INTO sku_info (SKU,shipping_attributes)
        VALUES `
    for (let i = 0; i < count; i++) {
        sql = `${sql}(?,?),`
    }
    sql = sql.substring(0, sql.length - 1)
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}
module.exports = shippingAttributeRepo