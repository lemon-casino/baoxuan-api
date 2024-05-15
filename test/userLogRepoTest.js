const userLogRepo = require("../repository/userLogRepo")
const assert = require('assert')

describe('userLogRepo', () => {
    describe('updateFields', async() => {
        userLogRepo.updateFields("a0b85a8e-68fb-4e99-9a95-17c76dbf2746", {userName: "llx"})
    });
});
