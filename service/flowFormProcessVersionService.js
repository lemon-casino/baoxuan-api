const flowFormProcessVersionRepo = require("@/repository/flowFormProcessVersionRepo")

const save = async (processVersions) => {
    return (await flowFormProcessVersionRepo.save(processVersions))
}

module.exports = {
    save
}