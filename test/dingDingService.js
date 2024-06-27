const dingDingService = require("../service/dingDingService")
const assert = require("assert")

describe("dingDingService", () => {
    describe("createProcess", async () => {
        // bi测试流程
        const formId = "FORM-CP766081CPAB676X6KT35742KAC229LLKHIILB"
        const userId = "223851243926087312"
        const processCode = "TPROC--CP766081CPAB676X6KT35742KAC22BLLKHIILC"
        const formDataJsonStr = "{\n" +
            "  \"textField_liihs7kv\": \"113测试\",\n" +
            "  \"radioField_lx30hv7y\": \"否\",\n" +
            "  \"radioField_lwuecm6c\": \"是\",\n" +
            "  \"selectField_liihs7ky\": \"老猫\",\n" +
            "  \"selectField_liihs7kz\": \"老品问题\",\n" +
            "  \"multiSelectField_lwufb7oy\": [\"累计60天负利润\",\"老品利润率低于15%\"],\n" +
            "  \"cascadeDateField_lloq9vjk\": [\"1719417600000\",\"1719763200000\"],\n" +
            "}"
        const result = await dingDingService.createProcess(formId, userId, processCode, formDataJsonStr)
    })
})
