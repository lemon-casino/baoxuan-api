const models = require('@/model')
const flowFormProcessVersionModel = models.flowFormProcessVersionModel

const save = async (processVersions) => {
    for (const processVersion of processVersions) {
        try {
            await flowFormProcessVersionModel.create(processVersion)
        } catch (e) {
            if (e.original.code !== "ER_DUP_ENTRY") {
                throw e
            }
        }
    }
}

module.exports = {save}