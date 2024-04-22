const flowFormDetailsRepo = require("../repository/flowFormDetailsRepo")

describe("", () => {
    it("", async () => {
        const result = await flowFormDetailsRepo.getFormLatestDetailsByFormId("FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS")
        console.log(result)
    })
})