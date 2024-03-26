const singleItemTaoBaoService = require('../service/singleItemTaoBaoService')
const biResponse = require("../utils/biResponse")

const saveSingleItemTaoBao = async (req, res, next) => {
    try {
        const item = req.body
        await singleItemTaoBaoService.saveSingleItemTaoBao(item)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const deleteSingleIteTaoBaoByBatchIdAndLinkId = async (req, res, next) => {
    try {
        const {id, batchId, linkId} = req.query
        if (batchId) {
            await singleItemTaoBaoService.deleteSingleIteTaoBaoByBatchIdAndLinkId(batchId, linkId)
            return res.send(biResponse.success())
        }
        if (id) {
            // todo:根据需要补充
            return res.send(biResponse.success())
        }
        return res.send(biResponse.format("500", "仅提供基于id和batchId的删除操作"))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchIdAndLinkId
}