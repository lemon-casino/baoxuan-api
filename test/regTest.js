const assert = require("assert")

describe("flowUtil", () => {
    describe("getLatestUniqueReviewItems", () => {
        it('getFlowFormName', () => {
            const flowFormName = /发起的(.+流程)/.exec("赵天鹏发起的财务经营费用申请流程工资")
            console.log(flowFormName)
        })
    })
})