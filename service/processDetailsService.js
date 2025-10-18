const processDetailsRepo = require("@/repository/processDetailsRepo")

const saveProcessDetailsArr = async (detailsArr) => {
    const result = await processDetailsRepo.saveProcessDetailsArr(detailsArr)
    return result
}

module.exports = {
    saveProcessDetailsArr
}