const tian_mao_link_user_table = require('../repository/tianmaolinkuser_tableRepo');

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

module.exports = {
    get_user_table,
    put_user_table,
    sort_user_table,
    tmall_user_table
}