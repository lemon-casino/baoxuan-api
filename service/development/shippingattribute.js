const ShippingAttributeService = {}
const shippingAttributeRepo = require('../../repository/development/shippingAttributeRepo')
ShippingAttributeService.UploadShippingAttribute = async(rows) =>{
    let result = false, count = 0, data = []
    let columns = rows[0].values,
        sku_row = null,
        shipping_attributes_row = null
    for (let i = 1; i < columns.length; i++) {
        if (columns[i] == '商品编码') {sku_row = i;  continue}
        if (columns[i] == '发货属性') {shipping_attributes_row = i; continue}
    }
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].getCell(1).value) continue
        let sku = rows[i].getCell(sku_row).value
        let shipping_attributes = rows[i].getCell(shipping_attributes_row).value
        let info = await shippingAttributeRepo.getBySkuInfo(sku)
        if (info?.length) {
            result = await shippingAttributeRepo.update(sku,shipping_attributes)
        } else {
            data.push(
                sku,
                shipping_attributes
            )
            count += 1
        }
    }
    if (count > 0)
        result = await shippingAttributeRepo.batchInsert(count, data)
    return result
}

ShippingAttributeService.getShippingAttribute = async() =>{
    let result = await shippingAttributeRepo.getInfo()
    return result
}

module.exports = ShippingAttributeService