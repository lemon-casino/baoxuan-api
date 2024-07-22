const tmallCompetitorRepo = require("../repository/tmallCompetitorRepo")



const uploadSingleIteTaoBaoCompetitorTable = async (item) => {
    return await tmallCompetitorRepo.uploadSingleIteTaoBaoCompetitorTable(item);
}

module.exports = {

    uploadSingleIteTaoBaoCompetitorTable
}