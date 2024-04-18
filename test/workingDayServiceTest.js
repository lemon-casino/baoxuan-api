const workingDayService = require("../service/workingDayService")
const assert = require('assert')

describe("workingDayService", () => {
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
    })
})
