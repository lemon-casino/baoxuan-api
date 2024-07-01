const assert = require("assert")
const redisUtil = require("@/utils/redisUtil")
const redisRepo = require("@/repository/redisRepo")

describe("redisUtil", () => {
    it("rPush", async () => {
        await redisUtil.rPush("test:working_days", "2024-05-03")
        await redisUtil.rPush("test:working_days", "2024-05-04")
        await redisUtil.rPush("test:working_days", "2024-05-05")
        await redisUtil.rPush("test:working_days", "2024-05-06")
        await redisUtil.rPush("test:working_days", "2024-05-07")
        await redisUtil.rPush("test:working_days", "2024-05-08")
        await redisUtil.rPush("test:working_days", "2024-05-09")
        await redisUtil.rPush("test:working_days", "2024-05-10")
        await redisUtil.rPush("test:working_days", "2024-05-11")
    })

    it("lRange", async () => {
        const days = await redisUtil.lRange("test:working_days", 0, 99999)
        console.log(days)
    })
    it("getAllWorkingDays", async()=>{
        const workingDays = await redisRepo.getAllWorkingDays()
        // assert.equal(workingDays.length, 78)
    })
})