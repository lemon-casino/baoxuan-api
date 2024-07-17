const models = require('@/model')
const flowFormDetailsRepo = require("@/repository/flowFormDetailsRepo")
const dateUtil = require("@/utils/dateUtil")
const uuidUtil = require("@/utils/uuidUtil")
const {QueryTypes} = require("sequelize");

const getLatestModifiedProcess = async () => {
    const latestProcess = await models.processModel.findOne({
        order: [["doneTime", "desc"]]
    })
    if (latestProcess) {
        return latestProcess.dataValues
    }
    return latestProcess
}

const saveProcess = async (process) => {
    const transaction = await models.sequelize.transaction()
    try {
        const originator = process.originator
        process.originatorName = originator.name.nameInChinese
        process.originatorId = originator.userId
        process.createTime = dateUtil.formatGMT(process.createTimeGMT)
        process.doneTime = dateUtil.formatGMT(process.modifiedTimeGMT)
        process.stockedTime = new Date()
        await models.processModel.create(process, {transaction})

        const reviewItems = process.overallprocessflow
        for (let i = 0; i < reviewItems.length; i++) {
            reviewItems[i].id = uuidUtil.getId()
            reviewItems[i].orderIndex = i
            reviewItems[i].taskHoldTime = reviewItems[i].taskHoldTimeGMT
            reviewItems[i].doneTime = dateUtil.formatGMT2Str(reviewItems[i].operateTimeGMT)
            await models.processReviewModel.create(reviewItems[i], {transaction})
        }
        const flowFormDetails = await flowFormDetailsRepo.getFormDetailsByFormId(process.formUuid)

        const data = process.data
        for (const key of Object.keys(data)) {
            const fieldDetails = flowFormDetails.filter((item) => key.includes(item.fieldId))
            const fieldValue = data[key] instanceof Array ? JSON.stringify(data[key]) : data[key]
            const details = {
                id: uuidUtil.getId(),
                processInstanceId: process.processInstanceId,
                fieldId: key,
                fieldName: fieldDetails && fieldDetails.length > 0 ? fieldDetails[0].fieldName : "",
                fieldValue
            }
            await models.processDetailsModel.create(details, {transaction})
        }
        await transaction.commit()
        return true
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

const getProcessByProcessInstanceId = async (processInstanceId) => {
    const result = await models.processModel.findOne({
        where: {
            processInstanceId
        }
    })
    if (result) {
        return result.dataValues
    }
    return null
}

/**
 * 将流程表中data和overallprocessflow为字符串的数据改为json
 * @returns {Promise<void>}
 */
const correctStrFieldToJson = async () => {
    // 修正流程表中data、overallprocessflow 字符串为json

    const flowsOfIncorrectFormatData = await models.processModel.findAll({
        where: {
            data: {$like: models.Sequelize.literal(`'"%'`)}
        }
    })
    for (const flow of flowsOfIncorrectFormatData) {
        const result = await models.processModel.update({
            data: JSON.parse(flow.data)
        }, {
            where: {
                processInstanceId: flow.processInstanceId
            }
        })
    }
    const flowsOfIncorrectFormatOverallProcessFlow = await models.processModel.findAll({
        where: {
            overallprocessflow: {$like: models.Sequelize.literal(`'"%'`)}
        }
    })
    for (const flow of flowsOfIncorrectFormatOverallProcessFlow) {
        await models.processModel.update({
            overallprocessflow: JSON.parse(flow.overallprocessflow)
        }, {
            where: {
                processInstanceId: flow.processInstanceId
            }
        })
    }
}

//查询采购任务统计
const getProcurementProcessStatistics = async (startDate, endDate) => {
    return await models.sequelize.query(
        `SELECT u.nickname,
                IFNULL(sum(a.field_value), 0) adoptNumber,
                count(a.field_value)          totalNumber

         FROM (SELECT DISTINCT a.originator_name,
                               a.process_instance_id,
                               a.title,
                               IF
                                   ((SELECT pd.field_value
                                     FROM process_details pd
                                     WHERE pd.field_name = "运营是否选中"
                                       AND pd.field_value = "选中"
                                       AND pd.process_instance_id = a.process_instance_id
                                     GROUP BY pd.field_value) = '选中',
                                    1,
                                    0
                                   ) AS field_value,
                               REPLACE(
                                       JSON_EXTRACT((SELECT DISTINCT pd.field_value
                                                     FROM process_details pd
                                                     WHERE pd.field_id = "employeeField_lssfx9gb"
                                                       AND pd.process_instance_id = a.process_instance_id), "$[0]"),
                                       '"',
                                       ''
                                   ) AS userName
               FROM process a
                        INNER JOIN flowfroms f ON f.flow_form_id = a.form_uuid
                        INNER JOIN process_details pd ON pd.process_instance_id = a.process_instance_id
               WHERE f.flow_form_name IN ("采购任务运营发布（全平台）", "采购任务运营发布")
                 AND a.done_time between '${startDate}' and '${endDate}'
               GROUP BY pd.process_instance_id) a
                  RIGHT JOIN users u ON u.nickname = a.userName
                  INNER JOIN depts_users du ON du.user_id = u.dingding_user_id
         WHERE du.dept_id = "902880862"
           AND u.nickname NOT IN ('崔竹','刘雪红')
         GROUP BY u.nickname`,
        {
            raw: true,
            type: QueryTypes.SELECT,
            logging: true
        }
    )
}
//采购创建数量 已完成表
const getProcurementProcessCreateNumber = async (nickname, startDate, endDate) => {
    return await models.sequelize.query(
        `SELECT count(DISTINCT a.process_instance_id) number
         FROM process a
                  INNER JOIN flowfroms f ON f.flow_form_id = a.form_uuid
                  INNER JOIN process_details pd ON pd.process_instance_id = a.process_instance_id
         WHERE f.flow_form_name IN ("采购任务运营发布（全平台）", "采购任务运营发布")
           AND a.create_time between '${startDate}' and '${endDate}'
           AND pd.field_name = "开发接任务人员"
           and pd.field_value LIKE "%${nickname}%"
        `
        ,
        {
            raw: true,
            type: QueryTypes.SELECT,
            logging: true
        }
    )
}
//采购创建数量 进行中表
const getProcurementProcessTmpCreateNumber = async (nickname, startDate, endDate) => {
    return await models.sequelize.query(
        `SELECT count(DISTINCT a.process_instance_id) number
         FROM process_tmp a
                  INNER JOIN flowfroms f ON f.flow_form_id = a.form_uuid
                  INNER JOIN process_details_tmp pd ON pd.process_instance_id = a.process_instance_id
         WHERE f.flow_form_name IN ("采购任务运营发布（全平台）", "采购任务运营发布")
           AND a.create_time between '${startDate}' and '${endDate}'
           AND pd.field_name = "开发接任务人员"
           and pd.field_value LIKE "%${nickname}%"
        `
        ,
        {
            raw: true,
            type: QueryTypes.SELECT,
            logging: true
        }
    )
}
//采购进行中数量
const getProcurementProcessConductNumber = async (nickname, startDate, endDate) => {
    return await models.sequelize.query(
        `SELECT count(DISTINCT a.process_instance_id) number
         FROM process_tmp a
                  INNER JOIN flowfroms f ON f.flow_form_id = a.form_uuid
                  INNER JOIN process_details_tmp pd ON pd.process_instance_id = a.process_instance_id
             AND pd.field_name = "开发接任务人员"
             and pd.field_value LIKE "%${nickname}%"
        `
        ,
        {
            raw: true,
            type: QueryTypes.SELECT,
            logging: true
        }
    )
}
// 查询已完成的ids
const getProcessIdsData = async (date, startDate, endDate,isName) => {
    return await models.sequelize.query(
        `SELECT DISTINCT
                a.process_instance_id
            FROM
                process a
                    INNER JOIN flowfroms f ON f.flow_form_id = a.form_uuid
                    INNER JOIN process_details pd ON pd.process_instance_id = a.process_instance_id
            WHERE
                f.flow_form_name IN ( "采购任务运营发布（全平台）", "采购任务运营发布" )
              AND ${date} between '${startDate}' and '${endDate}'
              and (pd.field_name = '运营是否选中' or pd.field_name = '开发接任务人员')
             ${isName}
             GROUP BY
                     pd.process_instance_id
`
        ,
        {
            raw: true,
            type: QueryTypes.SELECT,
            logging: true
        }
    )
}
// 查询已完成的ids 选中/未选中
const getProcessIdsData2 = async (date, startDate, endDate,fieldValue,isName) => {
    return await models.sequelize.query(
        `SELECT DISTINCT
             a.process_instance_id
         FROM
             (
                 SELECT
                     a.process_instance_id
                 FROM
                     process a
                         INNER JOIN flowfroms f ON f.flow_form_id = a.form_uuid
                         INNER JOIN process_details pd ON pd.process_instance_id = a.process_instance_id
                 WHERE
                     f.flow_form_name IN ( "采购任务运营发布（全平台）", "采购任务运营发布" )
                   AND ${date} between '${startDate}' and '${endDate}'
                   AND  pd.field_name in ("运营是否选中","开发接任务人员" )
                   AND ( ${isName} )
             ) a
                 INNER JOIN process_details pd ON pd.process_instance_id = a.process_instance_id
         ${fieldValue}`
        ,
        {
            raw: true,
            type: QueryTypes.SELECT,
            logging: true
        }
    )
}
// 查询进行中的流程ids
const getProcessIdsTmpData = async (date, startDate, endDate,isName) => {
    return await models.sequelize.query(
        `SELECT DISTINCT
                a.process_instance_id
            FROM
                process_tmp a
                    INNER JOIN flowfroms f ON f.flow_form_id = a.form_uuid
                    INNER JOIN process_details_tmp pd ON pd.process_instance_id = a.process_instance_id
            WHERE
                 
               ${date}
                f.flow_form_name IN ( "采购任务运营发布（全平台）", "采购任务运营发布" )
                   AND  pd.field_name in ("运营是否选中","开发接任务人员" )
             AND ( ${isName} )
             GROUP BY
                     pd.process_instance_id
`
        ,
        {
            raw: true,
            type: QueryTypes.SELECT,
            logging: true
        }
    )
}

module.exports = {
    getLatestModifiedProcess,
    saveProcess,
    correctStrFieldToJson,
    getProcurementProcessStatistics,
    getProcurementProcessConductNumber,
    getProcurementProcessCreateNumber,
    getProcurementProcessTmpCreateNumber,
    getProcessIdsData,
    getProcessIdsData2,
    getProcessIdsTmpData,
    getProcessByProcessInstanceId
}