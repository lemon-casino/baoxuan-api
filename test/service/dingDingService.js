const dingDingService = require("../../service/dingDingService")
const assert = require("assert")

describe("dingDingService", () => {
    describe("createProcess", async () => {
        // bi测试流程
        const formId = "FORM-620E0853BB9E43B2A3265925E6B758B01JWI"
        const userId = "073105202321093148"
        const processCode = "TPROC--IS866C9196OIKPW7DDD3U47B4U8A28D6ZPDTLP"
        const formDataJsonStr = "{\"textField_ltwu34bu\":\"pricture_name\", \"textField_ltwu34bw\":\"picture_url\"}"
        const result = await dingDingService.createProcess(formId, userId, processCode, formDataJsonStr)
    })
})
