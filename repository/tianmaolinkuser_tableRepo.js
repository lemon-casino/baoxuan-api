const usersto = require('../model/usersto');
const sequelize = require("../model/init");
const getUserTableStructureModel = require('../model/userTableStructure');
const userTableStructureModel = getUserTableStructureModel(sequelize);

const getSingleItemTaoBaoModel = require("../model/singleItemTaobaoModel")
const singleItemTaoBaoModel = getSingleItemTaoBaoModel(sequelize);
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
const count_structure = async (id, tableType) => {
    try {
        return await userTableStructureModel.count({
            where: {
                user_id: id,
                tableType: tableType
            },
            raw: true,
            logging: false
        })
    } catch (error) {
        throw new Error('查询用户数据失败');
    }

};
const getAll_user_table_one = async (tableType) => {
    try {
        return await userTableStructureModel.findAll({
            attributes: {exclude: ["userId", 'tableType']},
            where: {
                user_id: "all-one",
                tableType: tableType
            },
            raw: true,
            logging: false
        })
    } catch (error) {
        throw new Error('查询数据失败');
    }

};
const getAll_user_table = async (dingdingUserId, tableType) => {
    try {
        return await userTableStructureModel.findAll({
            attributes: {exclude: ["userId", 'tableType']},
            where: {
                user_id: dingdingUserId,
                tableType: tableType
            },
            raw: true,
            logging: false
        })
    } catch (error) {
        throw new Error('查询用户数据失败');
    }

};


const put_user_table = async (field, title, dingdingUserId, tableType) => {
    try {
        return await userTableStructureModel.update({
            title: title
        }, {
            where: {
                field: field,
                user_id: {
                    [Op.eq]: dingdingUserId
                },
                tableType: {
                    [Op.eq]: tableType
                }
            },
            raw: true,
            logging: true

        })
    } catch (error) {
        throw new Error('更新数据失败');
    }

};

const inst_user_table_one = async (dingdingUserId, tableType) => {
    //批量复制
    try {
        userTableStructureModel.sequelize.query(
            `insert into user_table_structure (user_id, field, fixed, width, title, editRender, visible, editRender_version,tableType)
 select '${dingdingUserId}', field, fixed, width, title, editRender, visible, editRender_version,tableType from user_table_structure 
 where user_id='all-one' and tableType=${tableType}
 ;`,
            {
                type: QueryTypes.INSERT,
                raw: true,
                logging: true
            }
        )

    } catch (error) {
        throw new Error('批量复制all-one数据失败');
    }

};
const del_user_table = async (dingdingUserId) => {
    try {
        //delete   from  user_table_structure where  user_id='073105202321093148';
        return await userTableStructureModel.destroy({
            where: {
                user_id: dingdingUserId
            },
            raw: true,
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
            raw: true,
            logging: false
        });

    } catch (error) {
        throw new Error('批量添加数据失败');
    }

};

const put_tmall_table = async (item) => {
    try {
        return await singleItemTaoBaoModel.update(item, {
            where: {id: item.id},
            logging: false
        })


    } catch (error) {
        throw new Error('更新数据失败');
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
    install_user_table_one,
    put_tmall_table
};