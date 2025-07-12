const goodsApi = {
    itemQuery: '/open/mall/item/query',
}

const stockApi = {
    inventoryQuery: '/open/inventory/query',
}

const commonApi = {
    token: '/openWeb/auth/getInitToken',
    wmsQuery: '/open/wms/partner/query'
}

const inApi = {
    outQuery: '/open/orders/out/simple/query'
}

const purchaseApi = {
    purchaseQuery: '/open/purchase/query'
}

module.exports = {
    goodsApi,
    stockApi,
    commonApi,
    inApi,
    purchaseApi
}