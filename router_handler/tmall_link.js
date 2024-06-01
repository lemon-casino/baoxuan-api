const tianmao__user_tableService = require("../service/tianmao__user_tableService");
const {success} = require("../utils/biResponse");

const rest = {
    table: [],
}


const get_user_table = async (req, res) => {

    try {
        rest.table = await tianmao__user_tableService.get_user_table(req.user.id);
        rest.table.forEach(item => {
            item.visible = item.visible === 1;
            item.editable = item.editable === 1;
        });
        rest.table.map(item => {
            if (typeof item.editRender === 'string') {
                item.editRender = JSON.parse(item.editRender);
            }
        });
        // 怎加一个字段  用来判断是否是固定列
        return res.send(success(rest.table));

    } catch (e) {
    }
}

const put_user_table = async (req, res) => {

    try {

        rest.table = await tianmao__user_tableService.put_user_table(req.query.title, req.query.uptitle, req.user.id);
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