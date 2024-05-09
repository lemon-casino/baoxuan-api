const workingDayService = require("../service/workingDayService")
const assert = require('assert')

describe("workingDayService", () => {
    describe("sadPath", () => {
        it("bothUndefined", async () => {
            const duration = await workingDayService.computeValidWorkingDuration(undefined, undefined)
            assert.equal(0, duration)
        })
        it("bothNull", async () => {
            const duration = await workingDayService.computeValidWorkingDuration(null, null)
            assert.equal(0, duration)
        })
        it("startUndefined", async () => {
            const duration = await workingDayService.computeValidWorkingDuration(undefined, "2023-04-05 10:45:20")
            assert.equal(0, duration)
        })
        it("allBefore9Am", async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-27 07:45:20", "2024-04-27 08:35:20")
            assert.equal(duration, 0)
        })
        it("allAfter18Pm", async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-26 18:05:20", "2024-04-27 08:35:20")
            assert.equal(duration, 0)
        })

        it("endUndefined", async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2023-04-05 10:45:20", undefined)
            assert.equal(0, duration)
        })
        it("errorFormat", async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2023-04-0590", undefined)
            assert.equal(0, duration)
        })
        it("null", async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2023-04-05 10:45:20", null)
            assert.equal(0, duration)
        })
    })
    describe("computeValidWorkingDuration", () => {
        it('oneWorkingDay7Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-15 10:00:00", "2024-04-15 17:00:00")
            assert.equal(7, duration)
        })
        it('oneWorkingDay9hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-15 09:00:00", "2024-04-15 18:00:00")
            assert.equal(9, duration)
        })
        it('oneWorkingDay9Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-15 08:00:00", "2024-04-15 19:00:00")
            assert.equal(9, duration)
        })
        it('twoWorkingDay9Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-15 10:00:00", "2024-04-16 10:00:00")
            assert.equal(9, duration)
        })
        it('twoWorkingDay10Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-15 09:00:00", "2024-04-16 10:00:00")
            assert.equal(10, duration)
        })
        it('twoWorkingDay10Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-15 08:00:00", "2024-04-16 10:00:00")
            assert.equal(10, duration)
        })
        it('twoWorkingDay9Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-15 09:00:00", "2024-04-16 08:00:00")
            assert.equal(9, duration)
        })
        it('twoWorkingDay8Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-15 10:00:00", "2024-04-16 08:00:00")
            assert.equal(8, duration)
        })
        it('twoWorkingDay17Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-15 10:00:00", "2024-04-16 19:00:00")
            assert.equal(17, duration)
        })
        it('oneHoliday0Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-14 10:00:00", "2024-04-14 19:00:00")
            assert.equal(0, duration)
        })
        it('twoDaysWithOneHoliday0Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-14 10:00:00", "2024-04-15 08:00:00")
            assert.equal(0, duration)
        })
        it('twoDaysWithOneHoliday2Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-14 10:00:00", "2024-04-15 10:00:00")
            assert.equal(1, duration)
        })
        it('twoDaysWithOneHoliday9Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-14 18:00:00", "2024-04-15 18:00:00")
            assert.equal(9, duration)
        })
        it('twoDaysWithOneHoliday9Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-14 18:00:00", "2024-04-15 20:00:00")
            assert.equal(9, duration)
        })
        it('threeDaysWithTwoHoliday9Hours', async () => {
            const duration = await workingDayService.computeValidWorkingDuration("2024-04-13 18:00:00", "2024-04-15 20:00:00")
            assert.equal(9, duration)
        })
    })
    describe("computeValidWorkingDurationOfExecutionFlow", () => {
        it("workingDayBefore18PmAndBefore20Pm", async () => {
            const duration = await workingDayService.computeValidWorkingDurationOfExecutionFlow("2024-04-15 17:00:00", "2024-04-15 19:00:00")
            assert.equal(2, duration)
        })
        it("workingDayBefore18PmAndEqual20Pm", async () => {
            const duration = await workingDayService.computeValidWorkingDurationOfExecutionFlow("2024-04-15 17:00:00", "2024-04-15 20:00:00")
            assert.equal(3, duration)
        })
        it("workingDayBefore18PmAndAfter20Pm", async () => {
            const duration = await workingDayService.computeValidWorkingDurationOfExecutionFlow("2024-04-15 17:00:00", "2024-04-15 21:00:00")
            assert.equal(3, duration)
        })
        it("workingDayBefore18PmAndEndWithNextDay", async () => {
            const duration = await workingDayService.computeValidWorkingDurationOfExecutionFlow("2024-04-15 17:00:00", "2024-04-16 10:00:00")
            assert.equal(4, duration)
        })
        it("workingDayAfter18PmAndEndWithNextDay", async () => {
            const duration = await workingDayService.computeValidWorkingDurationOfExecutionFlow("2024-04-15 19:00:00", "2024-04-15 20:00:00")
            assert.equal(0, duration)
        })
        it("workingDayAfter18PmAndEndWithNextDay1", async () => {
            const duration = await workingDayService.computeValidWorkingDurationOfExecutionFlow("2024-05-07 18:19:00", "2024-05-08 18:25:00")
            console.log(duration)
            assert.equal(duration, 9)
        })
    })
})
