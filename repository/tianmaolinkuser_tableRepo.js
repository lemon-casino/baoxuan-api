const usersto = require('../model/usersto');
const userTableStructureModel = require('../model/userTableStructure');
const sequelizeUtil = require("../utils/sequelizeUtil");
const {Sequelize, QueryTypes, Op} = require('sequelize');
const get_user_table = async (id) => {
    try {
        return await usersto.findOne({
            attributes: [
                'dingdingUserId'
            ],
            where: {
                user_id: id
            }
        })

    } catch (error) {
        throw new Error('查询用户数据失败');
    }
};
const count_structure = async (id) => {
    try {
        return await userTableStructureModel.count({
            where: {
                user_id: id
            },
            logging: false
        })
    } catch (error) {
        throw new Error('查询用户数据失败');
    }

};
const getAll_user_table_one = async () => {
    try {
        return await userTableStructureModel.findAll({
            attributes: [
                'field',
                'fixed',
                'width',
                'title',
                'editRender',
                'visible',
                'version',
                'editable'
            ],
            where: {
                user_id: "all-one"
            }
        })
    } catch (error) {
        throw new Error('查询数据失败');
    }

};
const getAll_user_table = async (dingdingUserId) => {
// select  COUNT(1) from  user_table_structure where  user_id='id;
    try {
        return await userTableStructureModel.findAll({
            attributes: [
                'field',
                'fixed',
                'width',
                'title',
                'editRender',
                'visible',
                'version',
                'editable'
            ],
            where: {
                user_id: dingdingUserId
            }
        })
    } catch (error) {
        throw new Error('查询用户数据失败');
    }

};


const put_user_table = async (title, uptitle, dingdingUserId) => {
    try {
        return await userTableStructureModel.update({
            title: uptitle
        }, {
            where: {
                title: title,
                user_id: {
                    [Op.eq]: dingdingUserId
                }
            }

        })
    } catch (error) {
        throw new Error('更新数据失败');
    }

};

const inst_user_table_one = async (dingdingUserId) => {
    try {
        userTableStructureModel.sequelize.query(
            `insert into user_table_structure (user_id, field, fixed, width, title, editRender, visible, editRender_version) select '${dingdingUserId}', field, fixed, width, title, editRender, visible, editRender_version from user_table_structure where user_id='all-one';`,
            {
                type: QueryTypes.INSERT,
            }
        )

    } catch (error) {
        throw new Error('更新数据失败');
    }

};
const del_user_table = async (dingdingUserId) => {
    try {
        //delete   from  user_table_structure where  user_id='073105202321093148';
        return await userTableStructureModel.destroy({
            where: {
                user_id: dingdingUserId
            },
            logging: false
        })

    } catch (error) {
        throw new Error('删除数据失败');
    }

};


const install_user_table_one = async (title) => {
    try {
        //批量添加数据
        return await userTableStructureModel.bulkCreate(title, {
            logging: false
        });

    } catch (error) {
        throw new Error('删除数据失败');
    }

};

module.exports = {
    get_user_table,
    count_structure,
    getAll_user_table_one,
    getAll_user_table,
    put_user_table,
    inst_user_table_one,
    del_user_table,
    install_user_table_one
};