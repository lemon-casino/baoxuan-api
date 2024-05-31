const tian_mao_link_user_table = require('../repository/tianmaolinkuser_tableRepo');

const get_user_table = async (id) => {
    try {

        const user = await tian_mao_link_user_table.get_user_table(id);
        if (user && user.dingdingUserId) {
            const newVar = await tian_mao_link_user_table.count_structure(user.dingdingUserId);
            if (newVar > 0) {
                //说明   这里存在内容
                return await tian_mao_link_user_table.getAll_user_table(user.dingdingUserId);
            } else {

                return await tian_mao_link_user_table.getAll_user_table_one();
            }

        }

    } catch (e) {
    }
}


const put_user_table = async (title, uptitle, id) => {
    try {

        const user = await tian_mao_link_user_table.get_user_table(id);

        const newVar = await tian_mao_link_user_table.count_structure(user.dingdingUserId);

        if (newVar <= 0) {
            //这里是复制数据
            await tian_mao_link_user_table.inst_user_table_one(user.dingdingUserId);
        }
        await tian_mao_link_user_table.put_user_table(title, uptitle, user.dingdingUserId);
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

module.exports = {
    get_user_table,
    put_user_table,
    sort_user_table
}