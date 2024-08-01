const tmallCompetitorRepo = require("../repository/tmallCompetitorRepo")



const uploadSingleIteTaoBaoCompetitorTable = async (item) => {
      let xx=(await tmallCompetitorRepo.searchSingleIteTaoBaoCompetitorTable(null, 1, 99999999))
    xx = xx.data.map(x => ({
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
    console.log(item)
    return await tmallCompetitorRepo.uploadSingleIteTaoBaoCompetitorTable(item);
}
const searchSingleIteTaoBaoCompetitorTable = async (searchParams, page, pageSize) => {
    return await tmallCompetitorRepo.searchSingleIteTaoBaoCompetitorTable(searchParams, page, pageSize);
}
const addItemToResult = (item, key, result) => {
    if (item[key] && !result[key].some(e => e.value === item[key])) {
        result[key].push({ value: item[key], label: item[key] });
    }
};

const conditionalFiltering = async (result) => {
    let data = await tmallCompetitorRepo.conditionalFiltering();
    const keys = [
        'link_id',
        'competitors_id',
        'headOf_operations',
        'competitors_name',
        'category',
        'headOf_productLine',
        'store_name',
        'month_on_month',
        'week_on_week'
    ];

    data.forEach(item => {
        keys.forEach(key => {
            addItemToResult(item, key, result);
        });
    });
    return result;
}




module.exports = {

    uploadSingleIteTaoBaoCompetitorTable,
    searchSingleIteTaoBaoCompetitorTable,
    conditionalFiltering
}