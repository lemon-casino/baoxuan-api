const express = require("express")
const router = express.Router()
const tmallApi = require("../router_handler/customer_service/tmallApi")
const pddApi = require("../router_handler/customer_service/pddApi")
const jdApi = require("../router_handler/customer_service/jdApi")
const dyApi = require("../router_handler/customer_service/dyApi")
const xhsApi = require("../router_handler/customer_service/xhsApi")
const vipApi = require("../router_handler/customer_service/vipApi")
const tgcApi = require("../router_handler/customer_service/tgcApi")

// 天猫
router.get("/tmall/as", tmallApi.getTmallAsByDate)
router.post("/tmall/as-import", tmallApi.importTmallAsData)
router.get("/tmall/ps", tmallApi.getTmallPsByDate)
router.post("/tmall/ps-import", tmallApi.importTmallPsData)

//拼多多
router.get("/pdd/data", pddApi.getPddDataByDate)
router.get("/pdd/kf/data", pddApi.getPddKFDataByDate)
router.get("/pdd/dp/data", pddApi.getPddDPDataByDate)
router.post("/pdd/data-import", pddApi.importPddData)

//京东
router.get("/jd/data", jdApi.getJDDataByDate)
router.get("/jd/kf/data", jdApi.getJDKFDataByDate)
router.get("/jd/dp/data", jdApi.getJDDPDataByDate)
router.post("/jd/data-import", jdApi.importJDData)

//抖音
router.get("/dy/data", dyApi.getDYDataByDate)
router.get("/dy/kf/data", dyApi.getDYKFDataByDate)
router.get("/dy/dp/data", dyApi.getDYDPDataByDate)
router.post("/dy/data-import", dyApi.importDYData)

//小红书
router.get("/xhs/data", xhsApi.getXHSDataByDate)
router.post('/xhs/data-import', xhsApi.importXHSData)

//唯品会
router.get("/vip/data", vipApi.getVIPDataByDate)
router.post('/vip/data-import', vipApi.importVIPData)

//淘工厂
router.get("/tgc/data", tgcApi.getTGCDataByDate)
router.post('/tgc/data-import', tgcApi.importTGCData)

module.exports = router
