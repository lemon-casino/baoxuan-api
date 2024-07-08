const tian_mao_link_user_table = require('../repository/tianMaoLinkUserTableRepo');
const tian_mao_allocation = require('../repository/tianMaoAllocationRepo');
const get_user_table = async (id, tableType) => {
    try {


        const user = await tian_mao_link_user_table.get_user_table(id, tableType);
        if (user && user.dingdingUserId) {
            const newVar = await tian_mao_link_user_table.count_structure(user.dingdingUserId, tableType);
            if (newVar > 0) {
                //说明   这里存在内容
                return await tian_mao_link_user_table.getAll_user_table(user.dingdingUserId, tableType);
            } else {
                return await tian_mao_link_user_table.getAll_user_table_one(tableType)
            }

        }

    } catch (e) {
    }
}


const put_user_table = async (field, title, id, tableType) => {
    try {
        const user = await tian_mao_link_user_table.get_user_table(id);
        const roles = await tian_mao_link_user_table.get_roles(id);

        function checkRoles(roles) {
            return roles.some(roleGroup =>
                roleGroup.some(role =>
                    role.role_name === '超级管理员' ||
                    role.role_name === '天猫组-组长'
                )
            );
        }

        if (checkRoles(roles)) {
            await tian_mao_link_user_table.put_user_table(field, title, 'all-one', 1);
            await tian_mao_link_user_table.put_user_table(field, title, 'all-one', 2);
            await tian_mao_link_user_table.del_alluser_table();
        } else {

            const newVar = await tian_mao_link_user_table.count_structure(user.dingdingUserId, tableType);
            if (newVar <= 0) {
                //这里是复制数据
                await tian_mao_link_user_table.inst_user_table_one(user.dingdingUserId, tableType);
            }

            await tian_mao_link_user_table.put_user_table(field, title, user.dingdingUserId, tableType);
        }


    } catch (e) {
    }
}
const sort_user_table = async (title, id) => {
    try {

        const user = await tian_mao_link_user_table.get_user_table(id);

        //user.dingdingUserId
        //先删一边
        await tian_mao_link_user_table.del_user_table(user.dingdingUserId);

        // 循环便利title 数组 并且 给每个添加 一个字段 user_id:user.dingdingUserId
        for (let i = 0; i < title.length; i++) {
            title[i].userId = user.dingdingUserId;
            title[i].editRender = JSON.stringify(title[i].editRender);
        }
        await tian_mao_link_user_table.install_user_table_one(title);
    } catch (e) {
    }
}
const tmall_user_table = async (linkdata) => {
    try {
        linkdata.shoppingCatSumRoi = linkdata.shoppingCatSumRoi.replace('%', '');
        linkdata.accuratePeoplePromotionProductionRate = linkdata.accuratePeoplePromotionProductionRate.replace('%', '');
        linkdata.wanXiangTaiProductionRate = linkdata.wanXiangTaiProductionRate.replace('%', '');
        delete linkdata._X_ROW_KEY;
        await tian_mao_link_user_table.put_tmall_table(linkdata)
    } catch (e) {
    }
}


const getExceptionLinks = async (type) => {
    try {
        if (type === 1) {
            return await processType1Records();
        } else if (type === 2) {
            return await tian_mao_allocation.exceptionLinks(2);
        } else {
            throw new Error('Invalid type');
        }
    } catch (e) {
        console.error('Error fetching exception links:', e);
    }
};


const fetchAllType2Records = async () => {
    try {
        const records = await tian_mao_allocation.exceptionLinks(2);
        return records.reduce((acc, record) => {
            acc[record.id] = record;
            return acc;
        }, {});
    } catch (e) {
        console.error('Error fetching type 2 records:', e);
    }
};

const processType1Records = async () => {
    try {
        const type1Records = await tian_mao_allocation.exceptionLinks(1);
        const type2RecordsMap = await fetchAllType2Records();

        type1Records.forEach(record => {
            if (record.exclude) {
                const excludeIds = record.exclude.split(',');
                record.exclude = excludeIds.map(id => {
                    const type2Record = type2RecordsMap[id.trim()];
                    if (type2Record) {
                        return {
                            field: type2Record.field,
                            comparator: type2Record.comparator,
                            name: type2Record.name,
                            value: type2Record.id
                        };
                    }
                    return null;
                }).filter(Boolean);
            }
        });
        return type1Records;
    } catch (e) {
        console.error('Error processing type 1 records:', e);
    }
};


const putExceptionLinks = async (body) => {
    try {


        return await tian_mao_allocation.putExceptionLinks(body);
    } catch (e) {
    }
}
const delExceptionLinks = async (id) => {
    try {


        return await tian_mao_allocation.delExceptionLinks(id);
    } catch (e) {
    }
}
const postExceptionLinksExclude = async (body) => {
    try {

        return await tian_mao_allocation.addExceptionLinksExclude(body);
    } catch (e) {
    }
}


const exceptionexcludeLinks = async (body) => {
    try {

        return await tian_mao_allocation.exceptionexcludeLinks(body);
    } catch (e) {
    }
}

module.exports = {
    get_user_table,
    put_user_table,
    sort_user_table,
    tmall_user_table,
    getExceptionLinks,
    putExceptionLinks,
    delExceptionLinks,
    postExceptionLinksExclude,
    exceptionexcludeLinks

}