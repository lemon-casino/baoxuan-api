const express = require('express')
// 创建路由对象
const router = express.Router()
const operationApi = require('../router_handler/operationApi')
const analysisPlanApi = require('../router_handler/analysisPlanApi')

// 数据面板
router.get('/data-pannel', operationApi.getDataStats)
router.get('/data-pannel-detail/:column', operationApi.getDataStatsDetail)
router.get('/goods-info', operationApi.getGoodsInfo)
router.get('/goods-line-info', operationApi.getGoodsLineInfo)
router.get('/goods-info-detail', operationApi.getGoodsInfoDetailTotal)
router.get('/sku-info-detail', operationApi.getskuInfoDetailTotal)
router.get('/goods-info-detail/:column', operationApi.getGoodsInfoDetail)
router.get('/sku-info-detail/:column', operationApi.getJDskuInfoDetail)
router.get('/goods-info-sub-detail', operationApi.getGoodsInfoSubDetail)
router.post('/goods-info/import', operationApi.importGoodsInfo)
router.post('/goods-order-stat/import', operationApi.importGoodsOrderStat)
router.post('/goods-key-words/import', operationApi.importGoodsKeyWords)
router.post('/goods-dsr/import', operationApi.importGoodsDSR)
router.post('/goods-pay-info/import', operationApi.importGoodsPayInfo)
router.post('/goods-composite-info/import', operationApi.importGoodsCompositeInfo)
router.post('/goods-sycm-info/import', operationApi.importGoodsSYCMInfo)
router.post('/goods-xhs-info/import', operationApi.importGoodsXHSInfo)
router.post('/goods-brushing-info/import', operationApi.importGoodsBrushingInfo)
router.post('/goods-pdd-info/import', operationApi.importGoodsPDDInfo)
router.post('/goods-orders/import', operationApi.importGoodsOrderInfo)
router.post('/goods-verified/import', operationApi.importGoodsVerified)
router.post('/goods-order-verified-stat/import', operationApi.importGoodsOrderVerifiedStat)
router.post('/goods-order-pay-stat/import', operationApi.importGoodsOrderPayStat)
router.post('/shop-promotion-log', operationApi.createShopPromotionLog)
//订单数据导入
router.post('/orders-goods/import', operationApi.importOrdersGoods)
router.post('/orders-goods-verified/import', operationApi.importOrdersGoodsVerified)
// 二类刷单
router.post('/orders-erlei/import', operationApi.importErleiShuadan)
// 小红书
router.post('/orders-xhs-gd/import', operationApi.importXhsShuadan)
/**
 * 京东自营
 */
router.post('/jdzz-info/import', operationApi.importJDZYInfo)
router.post('/jdzz-promotion-info/import', operationApi.importJDZYPromotionInfo)
router.post('/jdzz-composite-info/import', operationApi.importJDZYcompositeInfo)

// 工作面板
router.get('/work-pannel', operationApi.getWorkStats)
router.get('/new-on-sale', operationApi.getNewOnSaleInfo)
router.get('/optimize', operationApi.getOptimizeInfo)
router.get('/report', operationApi.getReportInfo)
router.get('/report/download', operationApi.ReportDownload)

//表单配置
router.post('/pannel-setting', operationApi.setPannelSetting)

//测试优化
router.post('/check-optimize', operationApi.checkOperationOptimize)

//数据同步
router.post('/refresh-pay-stats', operationApi.refreshGoodsPaysStats)
router.post('/refresh-sale-stats', operationApi.refreshGoodsSalesStats)
router.post('/refresh-verify-stats', operationApi.refreshGoodsVerifiedsStats)
router.post('/refresh-payments', operationApi.refreshGoodsPayments)
router.post('/refresh-labor-cost', operationApi.refreshLaborCost)
router.post('/refresh-verified-labor-cost', operationApi.refreshVerifiedLaborCost)

//天猫单渠道推广
router.post('/tmall-promotion-info/import', operationApi.importTmallpromotioninfo)


//首页销售数据
router.get('/sale_data', operationApi.getSaleData)
router.get('/inventory-data', operationApi.getInventoryData)
router.get('/division-sale', operationApi.getDivisionSaleData)
router.get('/project-sale', operationApi.getProjectSaleData)
router.get('/shop-sale', operationApi.getShopSaleData)
router.get('/division-qty', operationApi.getDivisionSaleQtyData)
router.get('/project-qty', operationApi.getProjectSaleQtyData)
router.get('/shop-qty', operationApi.getShopSaleQtyData)
// 更新 inventory_attributes
router.post('/inventory_attributes/update',operationApi.updateInventory)

//推广计划导入
router.post('/promotion-plan/import', operationApi.importPromotionPlan)

//分析方案
router.get('/analysis-plan', analysisPlanApi.getAnalysisPlan)
router.post('/analysis-plan/create', analysisPlanApi.createAnalysisPlan)
router.put('/analysis-plan/update', analysisPlanApi.updateAnalysisPlan)
router.post('/analysis-plan/delete', analysisPlanApi.deleteAnalysisPlan)
//市场分析（分组）
router.get('/analysis-plan/group', analysisPlanApi.getGroup)
router.post('/analysis-plan/group/create', analysisPlanApi.createGroup)
//市场统计(总)
router.get('/analysis-plan/rivals', analysisPlanApi.getRivals)
router.post('/analysis-plan/rivals/create', analysisPlanApi.createRivals)
//竞品信息
router.get('/analysis-plan/rivals-specific', analysisPlanApi.getSpecificRivals)
router.post('/analysis-plan/rivals-specific/create', analysisPlanApi.createSpecificRivals)
//产品的信息和价格
router.get('/analysis-plan/rivals-sku', analysisPlanApi.getSku)
router.post('/analysis-plan/rivals-sku/create', analysisPlanApi.createSku)

//文件上传至bpm
router.post('/file-upload', analysisPlanApi.fileUpload)
module.exports = router