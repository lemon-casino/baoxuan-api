const models = require('@/model')
const uuidUtil = require("@/utils/uuidUtil")
const {QueryTypes} = require("sequelize");

/**
 * 保存流程详情（一组）
 * @param detailsArr
 * @returns {Promise<boolean>}
 */
const saveProcessDetailsArr = async (detailsArr) => {
    const transaction = await models.sequelize.transaction();
    try {
        for (const details of detailsArr) {
            details.id = uuidUtil.getId()
            await models.processDetailsModel.create(details, transaction)
        }
        await transaction.commit()
        return true
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

const saveProcessDetailsArrWithOutTrans = async (detailsArr, transaction) => {
    for (const details of detailsArr) {
        details.id = uuidUtil.getId()
        await models.processDetailsModel.create(details, transaction)
    }
    return true
}

const getProcessDetailsByProcessInstanceIds = async (ids) => {
    const result = await models.processDetailsModel.findAll({
        where: {processInstanceId: {$in: ids}}
    })
    return result.map(item => item.get({plain: true}))
}
//三天内完成的流程

const theProcessIsCompletedInThreeDays = async () => {
    try {
        return await models.sequelize.query(
            `SELECT
    MAX(CASE WHEN field_id = 'textField_liihs7kw' THEN field_value END) AS textField_value,
    MAX(CASE WHEN field_id = 'multiSelectField_lwufb7oy' THEN field_value END) AS multiSelectField_value
FROM
    process_details
WHERE
    process_instance_id IN (
        SELECT process_instance_id
        FROM process
        WHERE form_uuid = 'FORM-51A6DCCF660B4C1680135461E762AC82JV53'
          AND done_time > DATE_SUB(DATE(NOW()), INTERVAL 3 DAY)
          AND instance_status = 'COMPLETED'
    )
    AND (field_id = 'textField_liihs7kw' OR field_id = 'multiSelectField_lwufb7oy')
GROUP BY
    process_instance_id
HAVING
    textField_value IS NOT NULL
    AND multiSelectField_value IS NOT NULL; `,
            {
                raw: true,
                logging: false,
                type: QueryTypes.SELECT

            }
        );


    } catch (error) {
        throw new Error('查询数据失败');
    }
};


module.exports = {
    saveProcessDetailsArr,
    saveProcessDetailsArrWithOutTrans,
    getProcessDetailsByProcessInstanceIds,
    theProcessIsCompletedInThreeDays
}