const tianmao__user_tableService = require("../service/tianmao__user_tableService");
const {success} = require("../utils/biResponse");

const rest = {
    table: [],
}


const get_user_table = async (req, res) => {


    let tableType = req.query.tableType

    try {
        rest.table = await tianmao__user_tableService.get_user_table(req.user.id, tableType * 1);
        // rest.table.forEach(item => {
        //     item.visible = item.visible === 1;
        //     item.editable = item.editable === 1;
        // });
        // rest.table.map(item => {
        //     if (typeof item.editRender === 'string') {
        //         item.editRender = JSON.parse(item.editRender);
        //     }
        // });
        // console.log(rest.table)
        const parseKeys = ['slots', 'editRender'];
        let cleanedTable = rest.table.map(item => {
            // 转换visible和editable字段为布尔值
            item.visible = item.visible === 1;
            item.editable = item.editable === 1;
            item.editing = item.editing === 1;
            // 如果editRender是字符串，则解析为对象

            // 过滤掉值为null的字段
            let newItem = {};
            for (let key in item) {
                if (item[key] !== null) {
                    newItem[key] = parseKeys.includes(key) ? JSON.parse(item[key]) : item[key];
                }
            }

            return newItem;
        });

        // 怎加一个字段  用来判断是否是固定列
        return res.send(success(cleanedTable));

    } catch (e) {
    }
}

const put_user_table = async (req, res) => {
    let tableType = req.query.tableType
    try {
        //  如果获取的参数没有 或者为 undefined tableType * 1 NaN  则报错返回
        if (!req.query.field || !req.query.title || isNaN(tableType * 1)) {
            return res.send(success('参数错误'));
        }

        rest.table = await tianmao__user_tableService.put_user_table(req.query.field, req.query.title, req.user.id, tableType * 1);
        return res.send(success(rest.table));

    } catch (e) {
    }
}

const sort_user_table = async (req, res) => {

    try {

        rest.table = await tianmao__user_tableService.sort_user_table(req.body, req.user.id);
        return res.send(success(rest.table));

    } catch (e) {
    }
}
const tmall_user_table = async (req, res) => {

    try {

        rest.table = await tianmao__user_tableService.tmall_user_table(req.body);
        return res.send(success(rest.table));

    } catch (e) {
    }
}
module.exports = {
    get_user_table,
    put_user_table,
    sort_user_table,
    tmall_user_table
}