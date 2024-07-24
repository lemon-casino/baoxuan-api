const tmallCompetitorRepo = require("../repository/tmallCompetitorRepo")



const uploadSingleIteTaoBaoCompetitorTable = async (item) => {
      let xx=await tmallCompetitorRepo.searchSingleIteTaoBaoCompetitorTable(null)
    xx = xx.map(x => ({
        ...x,
        linkId: parseInt(x.linkId),
        search: parseFloat(x.search)
    }));
    item = item.filter(i => {
        return !xx.some(x =>
            x.linkId === i.linkId &&
            x.date === i.date &&
            x.headOfProductLine === i.headOfProductLine
        );
    });
    return await tmallCompetitorRepo.uploadSingleIteTaoBaoCompetitorTable(item);
}
const searchSingleIteTaoBaoCompetitorTable = async (search) => {
    return await tmallCompetitorRepo.searchSingleIteTaoBaoCompetitorTable(search);
}
const conditionalFiltering = async (result) => {
    let data = await tmallCompetitorRepo.conditionalFiltering();
    data.forEach(item => {
        if (item.link_id && !result.link_id.some(e => e.value === item.link_id)) {
            result.link_id.push({ value: item.link_id, label: item.link_id });
        }
        if (item.competitor_id && !result.competitors_id.some(e => e.value === item.competitor_id)) {
            result.competitors_id.push({ value: item.competitor_id, label: item.competitor_id });
        }
        if (item.headOf_operations && !result.headOf_operations.some(e => e.value === item.headOf_operations)) {
            result.headOf_operations.push({ value: item.headOf_operations, label: item.headOf_operations });
        }
        if (item.competitors_name && !result.competitors_name.some(e => e.value === item.competitors_name)) {
            result.competitors_name.push({ value: item.competitors_name, label: item.competitors_name });
        }
        if (item.category && !result.category.some(e => e.value === item.category)) {
            result.category.push({ value: item.category, label: item.category });
        }
        if (item.headOf_productLine && !result.headOf_productLine.some(e => e.value === item.headOf_productLine)) {
            result.headOf_productLine.push({ value: item.headOf_productLine, label: item.headOf_productLine });
        }
    });

    return result;
}
module.exports = {

    uploadSingleIteTaoBaoCompetitorTable,
    searchSingleIteTaoBaoCompetitorTable,
    conditionalFiltering
}