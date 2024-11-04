const { query } = require('../model/newDbConn')
const {
    item,
    action,
    actionItem,
    actionItem2,
    actionFilter,
    statItem2Type,
    totalStatType,
    typeFilter,
    fullActionFilter,
    nameFilter,
    statLeaderItem,
    leaderItemField,
    visionList,
    visionFilter,
    retouchList
} = require('../const/newFormConst')
const moment = require('moment')
const userRepo = require('./userRepo')

/**
 * 计算个人的流程逻辑
 * @param {*} userNames 
 * @param {*} tag 
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns 
 */
const getProcessStat = async function (userNames, tag, startDate, endDate) {
    let result = [], params = []

    let sql = `SELECT a.id, vft.type, a.action_exit FROM (
            SELECT id, field_id, form_id, show_name, action_exit, type 
            FROM vision_personal WHERE tag = '${tag}'
                AND (operator_name = ? OR v1 = ? OR v2 = ? ???) 
                AND operate_time >= '${startDate}' 
                AND operate_time <= '${endDate}'
            GROUP BY id, field_id, form_id, show_name, action_exit, type
        ) a LEFT JOIN vision_field_type vft ON vft.form_id = a.form_id 
            LEFT JOIN form_field_data ffd ON ffd.id = vft.ffd_id 
            JOIN form_fields ff2 ON ff2.field_id = a.field_id 
                AND ffd.form_field_id = ff2.id
            WHERE a.type LIKE CONCAT('%', ffd.value, '%') 
            ORDER BY a.id, 
                CASE a.action_exit 
                WHEN 'agree' THEN 2 
                WHEN 'doing' THEN 1 
                ELSE 0 END`
            
    let sql1 = `SELECT IFNULL(SUM(a.count), 0) AS count, a.action_exit FROM (
            SELECT vp.id, vp.field_id, vp.form_id, vp.show_name, vp.action_exit, 
                CAST(IFNULL(IF(piv3.value IS NULL, REPLACE(pis2.value, '"', ''), REPLACE(piv3.value, '"', '')), 0) AS DECIMAL) AS count, vp.type
            FROM vision_personal vp 
            LEFT JOIN vision_activity_field vaf ON vp.vt_form_id = vaf.form_id
                AND vaf.activity_id = vp.va_id
                AND IF(vp.action_exit = 'agree', vaf.type = 1, vaf.type = 0)
            LEFT JOIN process_instance_values piv3 ON piv3.instance_id = vp.id 
                AND piv3.field_id = vaf.field_id 
                AND vaf.is_sub = 0
                AND IF(vp.is_sub = 1 AND EXISTS(SELECT pis3.id FROM process_instance_sub_values pis3 
                    WHERE pis3.instance_id = vp.id
                ), FALSE, TRUE)
            LEFT JOIN process_instance_sub_values pis2 ON pis2.instance_id = vp.id 
                AND pis2.field_id = vaf.field_id 
                AND vaf.is_sub = 1
                AND vp.index = pis2.index

            WHERE vp.tag = '${tag}' 
                AND (((vp.operator_name = ? OR vp.v1 = ? ????) AND piv3.id IS NOT NULL) 
                    OR (vp.v2 = ? AND pis2.id IS NOT NULL ?????)) 
                AND vp.operate_time >= '${startDate}' 
                AND vp.operate_time <= '${endDate}'

            GROUP BY vp.id, vp.field_id, vp.form_id, vp.action_exit, vp.show_name, 
                piv3.field_id, piv3.value, pis2.field_id, pis2.value, vp.type
        ) a LEFT JOIN vision_field_type vft ON vft.form_id = a.form_id 
            LEFT JOIN form_field_data ffd ON ffd.id = vft.ffd_id 
            WHERE a.type LIKE CONCAT('%', ffd.value, '%')
        GROUP BY a.action_exit`
    let tmp, tmp1
   
    for (let i = 0; i < userNames.length; i++) {
        tmp = `${sql}`
        tmp1 = `${sql1}`
        let user = JSON.parse(JSON.stringify(item)), userItem = JSON.parse(JSON.stringify(actionItem))
        user.actionName = userNames[i]
        userItem.actionName = action.next.value
        user.children.push(JSON.parse(JSON.stringify(userItem)))
        userItem.actionName = action.doing.value
        user.children.push(JSON.parse(JSON.stringify(userItem)))
        userItem.actionName = action.agree.value
        user.children.push(JSON.parse(JSON.stringify(userItem)))
        user.children.push(JSON.parse(JSON.stringify(actionItem2)))
        if (nameFilter.hasOwnProperty(userNames[i])) {
            tmp = tmp.replace('???', 'OR operator_name = ? OR v1 = ? OR v2 = ?')
            tmp1 = tmp1.replace('????', 'OR vp.operator_name = ? OR vp.v1 = ?')
                .replace('?????', 'OR vp.v2 = ? AND pis2.id IS NOT NULL')
            params = [
                userNames[i], userNames[i],
                nameFilter[userNames[i]], nameFilter[userNames[i]], 
                userNames[i], nameFilter[userNames[i]]
            ]
        } else {
            tmp = tmp.replace('???', '')
            tmp1 = tmp1.replace('????', '').replace('?????', '')
            params = [userNames[i], userNames[i], userNames[i]]
        }

        let row = await query(tmp, params)
        if (row?.length) {
            for (let j = 0; j < row.length; j++) {
                for (let k = 0; k < statItem2Type[row[j].type].length; k++) {
                    if (j == 0 || (j > 0 && row[j - 1].id != row[j].id)) {
                        user.children[action[row[j].action_exit].type]
                            .children[1]
                            .children[statItem2Type[row[j].type][k]]
                            .sum += 1
                        user.children[action[row[j].action_exit].type]
                            .children[1]
                            .sum += 1
                        user.children[action[row[j].action_exit].type]
                            .sum += 1
                    }
                }
            }
        }

        row = await query(tmp1, params)
        if (row?.length) {
            for (let j = 0; j < row.length; j++) {
                user.children[3].children[row[j].action_exit == action.agree.key ? 1 : 0].sum += parseInt(row[j].count)
                user.children[3].sum += parseInt(row[j].count)
            }
        }

        result.push(user)
    }

    return result
}

const getStat = async function (result, startDate, endDate) {
    let sql =  `SELECT COUNT(1) AS count, 0 AS id, vision_type, type FROM vision_nodes
            WHERE tag = 'total' AND operate_time >= '${startDate}'
                AND operate_time <= '${endDate}'
                AND IF(v1 IS NULL, v2, v1) LIKE CONCAT('%', v3, '%')
            GROUP BY type, vision_type
        
        UNION ALL 

        SELECT COUNT(1) AS count, 2 AS id, vision_type, type FROM vision_nodes vn
            WHERE tag = 'inside' AND operate_time >= '${startDate}'
                AND operate_time <= '${endDate}'
                AND IF(v1 IS NULL, v2, v1) LIKE CONCAT('%', v3, '%')
                AND EXISTS (
                    SELECT pir.id FROM process_instance_records pir 
                    JOIN vision_activity va ON va.form_id = vn.form_id
                        AND va.activity_id = pir.activity_id
                        AND va.activity_name = pir.show_name
                        AND va.tag IN ('insideArt', 'insidePhoto')
                        AND pir.action_exit IN ('next', 'doing', 'agree')
                    WHERE pir.instance_id = vn.id
                )
            GROUP BY type, vision_type
        
        UNION ALL 
            
        SELECT COUNT(1) AS count, 1 AS id, vision_type, type FROM vision_nodes vn
            WHERE tag = 'out' AND operate_time >= '${startDate}'
                AND operate_time <= '${endDate}'
                AND IF(v1 IS NULL, v2, v1) LIKE CONCAT('%', v3, '%')
                AND EXISTS (
                    SELECT pir.id FROM process_instance_records pir 
                    JOIN vision_activity va ON va.form_id = vn.form_id
                        AND va.activity_id = pir.activity_id
                        AND va.activity_name = pir.show_name
                        AND va.tag IN ('outArt', 'outPhoto')
                        AND pir.action_exit IN ('next', 'doing', 'agree')
                    WHERE pir.instance_id = vn.id
                )
            GROUP BY type, vision_type 
        
        UNION ALL 
        
        SELECT COUNT(1) AS count, 3 AS id, vision_type, type FROM vision_nodes
            WHERE tag = 'retouch' AND operate_time >= '${startDate}'
                AND operate_time <= '${endDate}'
                AND IF(v1 IS NULL, v2, v1) LIKE CONCAT('%', v3, '%')
            GROUP BY type, vision_type`

    let row = await query(sql)
    for (let i = 0; i < row.length; i++) {
        if (statItem2Type[row[i].vision_type]) {
            for (let j = 0; j < statItem2Type[row[i].vision_type].length; j++) {
                result[row[i].id].children[statItem2Type[row[i].vision_type][j]]
                    .children[row[i].type]
                    .children[1]
                    .sum += parseInt(row[i].count)
                result[row[i].id].children[statItem2Type[row[i].vision_type][j]]
                    .children[row[i].type]
                    .sum += parseInt(row[i].count)
                result[row[i].id].children[statItem2Type[row[i].vision_type][j]]
                    .sum += parseInt(row[i].count)
            }
        }
        result[row[i].id].sum += parseInt(row[i].count)
    }

    sql = `SELECT COUNT(1) AS count, 1 AS id FROM (
            SELECT vn.id FROM vision_nodes vn
            WHERE tag = 'retouch' AND operate_time >= '${startDate}'
                AND operate_time <= '${endDate}'
                AND IF(v1 IS NULL, v2, v1) LIKE CONCAT('%', v3, '%')
                AND EXISTS (
                    SELECT pir.id FROM process_instance_records pir 
                    JOIN vision_activity va ON va.form_id = vn.form_id
                        AND va.activity_id = pir.activity_id
                        AND va.activity_name = pir.show_name
                        AND va.tag IN ('outArt', 'outPhoto')
                        AND pir.action_exit IN ('next', 'doing', 'agree')
                    WHERE pir.instance_id = vn.id
                )
            GROUP BY vn.id
        ) a 
        
        UNION ALL
        
        SELECT COUNT(1) AS count, 2 AS id FROM (
            SELECT vn.id FROM vision_nodes vn
            WHERE tag = 'retouch' AND operate_time >= '${startDate}'
                AND operate_time <= '${endDate}'
                AND IF(v1 IS NULL, v2, v1) LIKE CONCAT('%', v3, '%')
                AND EXISTS (
                    SELECT pir.id FROM process_instance_records pir 
                    JOIN vision_activity va ON va.form_id = vn.form_id
                        AND va.activity_id = pir.activity_id
                        AND va.activity_name = pir.show_name
                        AND va.tag IN ('insideArt', 'insidePhoto')
                        AND pir.action_exit IN ('next', 'doing', 'agree')
                    WHERE pir.instance_id = vn.id
                )
            GROUP BY vn.id
        ) a`
    row = await query(sql)
    for (let i = 0; i < row.length; i++) {
        let child_key = result[3].children.length - row[i].id
        result[3].children[child_key].sum = row[i].count
    }

    sql = `SELECT id, activity_id, field_id, tag, type, value, action_exit 
        FROM vision_node_works WHERE operate_time >= '${startDate}' 
            AND operate_time <= '${endDate}'
            AND IF(v1 IS NULL, v2, v1) LIKE CONCAT('%', v3, '%')
        ORDER BY id`

    row = await query(sql)
    for (let i = 0; i < row.length; i++) {
        let value = row[i].value instanceof Number ? row[i].value : parseInt(row[i].value.replace(/"/g, ''))
        if (!value) value = 0
        
        for (let k = 0; k < statItem2Type[row[i].type].length; k++) {
            if (totalStatType[row[i].tag] && (
                i == 0 || 
                !(row[i - 1].id == row[i].id && 
                    row[i - 1].activity_id == row[i].activity_id &&
                    row[i - 1].field_id == row[i].field_id)
            )) {
                result[4].children[totalStatType[row[i].tag][row[i].action_exit]]
                    .children[1]
                    .children[statItem2Type[row[i].type][k]]
                    .sum += value
                result[4].children[totalStatType[row[i].tag][row[i].action_exit]]
                    .children[1]
                    .sum += value
                result[4].children[totalStatType[row[i].tag][row[i].action_exit]]
                    .sum += value
            }
        }
        result[4].sum += value
        for (let j = 5; j < 9; j++) {
            if (totalStatType[row[i].tag] && 
                statItem2Type[row[i].type].includes(j - 4) && (
                    i == 0 || 
                    !(row[i - 1].id == row[i].id && 
                        row[i - 1].activity_id == row[i].activity_id &&
                        row[i - 1].field_id == row[i].field_id)
                )) {
                result[j].children[totalStatType[row[i].tag][row[i].action_exit]]
                    .children[1]
                    .sum += value
                result[j].children[totalStatType[row[i].tag][row[i].action_exit]]
                    .sum += value
                result[j].sum += value
            }
        }
    }
    return result
}

const getFlowInstances = async function (params) {
    let result = []
    let sql = `SELECT f.id, f.title AS flowFormName, f.form_uuid AS flowFormId 
        FROM vision_type vt JOIN forms f ON vt.form_id = f.id WHERE 1=1`
    if (params.tag) {
        sql = `${sql} AND vt.tag = '${params.tag}'`
    }
    if (params.id) {
        sql = `${sql} AND f.id = ${params.id}`
    }
    sql = `${sql} GROUP BY f.id, f.title, f.form_uuid ORDER BY f.id DESC, f.title, f.form_uuid`
    let row = await query(sql)
    if (row?.length) {
        for (let i = 0; i < row.length; i++) {
            sql = `SELECT id, parent_id, (CASE component WHEN 'AssociationFormField' 
                THEN CONCAT(field_id, '_id') ELSE field_id END) AS fieldId, title 
                AS fieldName FROM form_fields WHERE form_id = ?`
            let row1 = await query(sql, [row[i].id])
            row[i]['flowFormDetails'] = row1 || []
        }
        result.push(...row)
    }
    return result
}

const getOperationFlowInstances = async function (params) {
    let result = []
    let sql = `SELECT f.id, f.title AS flowFormName, f.form_uuid AS flowFormId 
        FROM operation_type ot JOIN forms f ON ot.form_id = f.id WHERE 1=1`
    if (params.ids) {
        sql = `${sql} AND f.id IN (${params.ids})`
    }
    sql = `${sql} GROUP BY f.id, f.title, f.form_uuid ORDER BY f.id DESC, f.title, f.form_uuid`
    let row = await query(sql)
    if (row?.length) {
        for (let i = 0; i < row.length; i++) {
            sql = `SELECT id, parent_id, (CASE component WHEN 'AssociationFormField' 
                THEN CONCAT(field_id, '_id') ELSE field_id END) AS fieldId, title 
                AS fieldName FROM form_fields WHERE form_id = ?`
            let row1 = await query(sql, [row[i].id])
            row[i]['flowFormDetails'] = row1 || []
        }
        result.push(...row)
    }
    return result
}

const getFlowProcessInstances = async function (params, offset, limit) {
    let p1 = [], result = {
        data: [],
        total: 0
    }
    let presql = `SELECT COUNT(1) AS count FROM (`
    let subsql = `SELECT id, creator, processInstanceId, title, instanceStatus, createTime, operateTime 
        FROM vision_process vp WHERE form_id = ?`
    p1.push(parseInt(params.id))
    if (params.tag) {
        subsql = `${subsql} AND tag = "${params.tag}"`
        if (visionList.includes(params.tag)) {
            subsql = `${subsql} AND EXISTS(
                SELECT pir.id FROM process_instance_records pir 
                JOIN vision_activity va ON pir.instance_id = vp.id
                    AND pir.activity_id = va.activity_id 
                    AND va.activity_name = pir.show_name
                WHERE va.form_id = vp.form_id
                    AND va.tag IN ("${visionFilter[params.tag].join('","')}")
            )`
        }
    }
    if (params.operator) {
        if (!nameFilter.hasOwnProperty(params.operator)) {
            subsql = `${subsql} AND (operator_name = ? OR v1 = ? OR v2 = ?)`
            p1.push(params.operator, params.operator, params.operator)
        } else {
            subsql = `${subsql} AND (operator_name = ? OR v1 = ? OR v2 = ? 
                OR operator_name = ? OR v1 = ? OR v2 = ?)`
            p1.push(params.operator, params.operator, params.operator, 
                nameFilter[params.operator], nameFilter[params.operator], nameFilter[params.operator]
            )
        }
    }
    if (params.startDate) {
        subsql = `${subsql} AND operate_time >= ?`
        p1.push(moment(params.startDate).format('YYYY-MM-DD') + ' 00:00:00')
    }
    if (params.endDate) {
        subsql = `${subsql} AND operate_time <= ?`
        p1.push(moment(params.endDate).format('YYYY-MM-DD') + ' 23:59:59')
    }
    if (params.action) {
        subsql = `${subsql} AND action_exit IN (${actionFilter[params.action].map(() => '?').join(',')})`
        p1.push(...actionFilter[params.action])
    }
    if (params.fullAction) {
        subsql = `${subsql} AND vn_type = ${fullActionFilter[params.fullAction]}`
    }
    if (params.type) {
        if (params.tag == 'retouch') {
            for (let i = 0; i < retouchList.length; i++) {
                if (params.type == retouchList[i].name) {                    
                    subsql = `${subsql} AND EXISTS (
                        SELECT pir.id FROM process_instance_records pir 
                        JOIN vision_activity va ON va.form_id = vp.form_id
                            AND va.activity_id = pir.activity_id
                            AND va.activity_name = pir.show_name
                            AND va.tag IN ('${retouchList[i].child.join("','")}')
                            AND pir.action_exit IN ('next', 'doing', 'agree')
                        WHERE pir.instance_id = vp.id
                    )`
                    break
                }
            }
        }
        if (typeFilter[params.type]) {
            subsql = `${subsql} AND vision_type IN (${typeFilter[params.type].map(() => '?').join(',')})
                AND type LIKE CONCAT('%', value, '%')`
            p1.push(...typeFilter[params.type])
        }
    }
    subsql = `${subsql}
            GROUP BY id, processInstanceId, title, \`status\`, createTime, operateTime`
    let search = `${presql}${subsql}) a`
    let row = await query(search, p1)
    if (row?.length && row[0].count) {
        result.total = row[0].count
        if (limit) {
            search = `SELECT * FROM (${subsql}) a LIMIT ${offset}, ${limit}`
        } else {
            search = `SELECT * FROM (${subsql}) a`
        }
        row = await query(search, p1)
        if (row?.length) {
            for (let i = 0; i < row.length; i++) {
                search = `SELECT field_id AS fieldId, \`value\` AS fieldValue FROM 
                    process_instance_values WHERE instance_id = ?`
                row[i]['data'] = await query(search, [row[i].id]) || []
                search = `SELECT show_name, operator_name FROM process_instance_records 
                    WHERE instance_id = ? ORDER BY 
                    IF(action_exit IS NULL, 2, IF(action_exit IN ('next', 'doing'), 0, 1)), 
                    operate_time DESC, id DESC LIMIT 1`
                let row1 = await query(search, [row[i].id])
                if (row1?.length) {
                    row[i]['action'] = row1[0].show_name
                    row[i]['operator'] = row1[0].operator_name
                }
                let user = await userRepo.getUserByDingdingUserId(row[i].creator)
                if (user?.length) {
                    row[i]['creator'] = user[0].nickname
                }
            }
            result.data = row
        }
    }
    return result
}

const getOperationProcessInstances = async function (params, offset, limit) {
    let p1 = [], result = {
        data: [],
        total: 0
    }
    let presql = `SELECT COUNT(1) AS count FROM (`
    let subsql = `SELECT pi.id,
            pi.instance_id AS processInstanceId,
            pi.title,
            pi.status AS instanceStatus,
            pi.create_time AS createTime,
            pi.update_time AS operateTime, 
            pi.creator 
        FROM processes p
        JOIN operation_type ot ON p.form_id = ot.form_id
        JOIN operation_type_activity ota ON ot.id = ota.type_id
        JOIN process_instances pi ON pi.process_id = p.id
        JOIN process_instance_records pir ON pi.id = pir.instance_id
            AND pir.show_name = ota.activity_name
            AND pir.activity_id = ota.activity_id
            AND pir.action_exit = ota.action_exit
            AND pir.id = (
                SELECT MAX(p2.id) FROM process_instance_records p2
                WHERE p2.instance_id = pi.id
                    AND p2.show_name = ota.activity_name
                    AND p2.activity_id = ota.activity_id
            )
        WHERE pi.status IN ('COMPLETED', 'RUNNING') 
            AND ota.type = ? `
    p1.push(params.type)
    if (params.startDate) {
        subsql = `${subsql} AND pir.operate_time >= ?`
        p1.push(moment(params.startDate).format('YYYY-MM-DD') + ' 00:00:00')
    }
    if (params.endDate) {
        subsql = `${subsql} AND pir.operate_time <= ?`
        p1.push(moment(params.endDate).format('YYYY-MM-DD') + ' 23:59:59')
    }
    if (params.operateType) {
        subsql = `${subsql} AND ot.operate_type = ?`
        p1.push(params.operateType)
    }
    if (params.nickname) {
        subsql = `${subsql} AND pir.operate_name = ?`
        p1.push(params.nickname)
    }
    if (params.action) {
        subsql = `${subsql} AND ot.type = ?`
        p1.push(fullActionFilter[params.action])
    }
    if (params.id) {
        subsql = `${subsql} AND p.form_id = ?`
        p1.push(params.id)
    }
    subsql = `${subsql}
        GROUP BY pi.id, pi.instance_id, pi.status, pi.title,  pi.create_time, pi.update_time`
    let search = `${presql}${subsql}) a`
    let row = await query(search, p1)
    if (row?.length && row[0].count) {
        result.total = row[0].count
        if (limit) {
            search = `SELECT * FROM (${subsql}) a LIMIT ${offset}, ${limit}`
        } else {
            search = `SELECT * FROM (${subsql}) a`
        }
        row = await query(search, p1)
        if (row?.length) {
            for (let i = 0; i < row.length; i++) {
                search = `SELECT field_id AS fieldId, \`value\` AS fieldValue FROM 
                    process_instance_values WHERE instance_id = ?`
                row[i]['data'] = await query(search, [row[i].id]) || []
                search = `SELECT show_name, operator_name FROM process_instance_records 
                    WHERE instance_id = ? ORDER BY 
                    IF(action_exit IS NULL, 2, IF(action_exit IN ('next', 'doing'), 0, 1)), 
                    operate_time DESC, id DESC LIMIT 1`
                let row1 = await query(search, [row[i].id])
                if (row1?.length) {
                    row[i]['action'] = row1[0].show_name
                    row[i]['operator'] = row1[0].operator_name
                }
                let user = await userRepo.getUserByDingdingUserId(row[i].creator)
                if (user?.length) {
                    row[i]['creator'] = user[0].nickname
                }
            }
            result.data = row
        }
    }
    return result
}

const getVisionProcessInstances = async function (params, offset, limit) {
    let p1 = [], result = {
        data: [],
        total: 0
    }
    let presql = `SELECT COUNT(1) AS count FROM (`
    let subsql = `SELECT pi.id,
            pi.instance_id AS processInstanceId,
            pi.title,
            pi.status AS instanceStatus,
            pi.create_time AS createTime,
            pi.update_time AS operateTime, 
            pi.creator 
        FROM processes p
        JOIN vision_leader vl ON p.form_id = vl.form_id
        JOIN vision_type vt ON vl.form_id = vt.form_id
            AND vt.tag = 'visionLeader'
        LEFT JOIN vision_leader_field vlf ON vlf.tag = vt.tag
            AND vlf.form_id = vl.form_id
        JOIN process_instances pi ON pi.process_id = p.id
            AND pi.status IN ('COMPLETED', 'RUNNING')
        LEFT JOIN process_instance_values piv ON piv.instance_id = pi.id
            AND vlf.field_id LIKE CONCAT('%', piv.field_id, '%') 
        LEFT JOIN process_instance_values piv1 ON piv1.instance_id = pi.id
            AND piv1.field_id = vt.field_id
            AND vt.type = 0
        LEFT JOIN process_receipt pr ON pr.process_id = pi.id
        LEFT JOIN receipt_instance_values riv ON riv.instance_id = pr.receipt_id
            AND riv.field_id = vt.field_id
            AND vt.type = 1
        JOIN process_instance_records pir ON pir.instance_id = pi.id
            AND pir.show_name = vl.activity_name
            AND pir.activity_id = vl.activity_id
            AND pir.action_exit = vl.action_exit
            AND pir.id = (
                SELECT MAX(p2.id) FROM process_instance_records p2
                WHERE p2.instance_id = pi.id
                    AND p2.show_name = vl.activity_name
                    AND p2.activity_id = vl.activity_id)
        JOIN form_fields ff ON ff.form_id = IF(vt.type = 0, vt.form_id, vt.sub_form_id)
            AND vt.field_id = ff.field_id
        LEFT JOIN vision_field_type vft ON vft.form_id = ff.form_id
        LEFT JOIN form_field_data ffd ON ffd.id = vft.ffd_id
        WHERE vl.form_id = ? 
            AND IF(vl.type = 2 OR vl.vision_type, 
                IF(piv1.value IS NULL, riv.value, piv1.value) LIKE CONCAT('%', ffd.value, '%'), 1)
                AND vft.type NOT IN (0, 4) `
    p1.push(parseInt(params.id))
    if (params.startDate) {
        subsql = `${subsql} AND pir.operate_time >= ?`
        p1.push(moment(params.startDate).format('YYYY-MM-DD') + ' 00:00:00')
    }
    if (params.endDate) {
        subsql = `${subsql} AND pir.operate_time <= ?`
        p1.push(moment(params.endDate).format('YYYY-MM-DD') + ' 23:59:59')
    }
    if (params.action) {
        subsql = `${subsql} AND vl.type = ?`
        p1.push(fullActionFilter[params.action])
    }
    if (params.userNames) {
        if (params.is_designer) {
            subsql = `${subsql} AND EXISTS(
                SELECT pir2.id FROM process_instance_records pir2 
                JOIN vision_leader vl1 ON vl1.form_id = vl.form_id
                    AND vl1.vision_type = 1
                    AND vl.vision_type = 2
                    AND vl.id > vl1.id
                WHERE pi.id = pir2.instance_id
                    AND pir2.operator_name IN (${params.userNames.map(() => '?').join(',')})
                    AND pir2.activity_id = vl1.activity_id
                    AND pir2.show_name = vl1.activity_name
                    AND pir2.action_exit = vl1.action_exit
                    AND pir2.id = (
                        SELECT MAX(p2.id) FROM process_instance_records p2
                        WHERE p2.instance_id = pi.id
                            AND p2.activity_id = vl1.activity_id 
                            AND p2.show_name = vl1.activity_name))`
            p1.push(...params.userNames)
        } else {
            subsql = `${subsql} AND EXISTS(
                SELECT pir2.id FROM process_instance_records pir2 
                WHERE pi.id = pir2.instance_id 
                    AND pir2.operator_name IN (${params.userNames.map(() => '?').join(',')})
                    AND pir2.id IN (
                        SELECT MAX(p2.id) FROM process_instance_records p2
                        WHERE p2.instance_id = pi.id
                        GROUP BY p2.instance_id, p2.show_name, p2.activity_id))`
            p1.push(...params.userNames)
        }
    }
    if (params.fieldType && params.type != undefined) {
        if (leaderItemField[params.type].display == 1) {
            subsql = `${subsql} AND EXISTS(
                    SELECT vft.id FROM vision_field_type vft 
                    JOIN form_field_data ffd ON ffd.id = vft.ffd_id
                    WHERE if (vt.type = 0, vt.form_id, vt.sub_form_id) = vft.form_id 
                        AND IF(piv1.value IS NULL, riv.value, piv1.value) LIKE CONCAT('"', ffd.value, '"')
                        AND vft.type IN (${typeFilter[params.fieldType].map(() => '?')})
                )`
            p1.push(...typeFilter[params.fieldType])
        } else if (leaderItemField[params.type].map == 'like') {
            subsql = `${subsql} AND vlf.type = ? AND piv.value LIKE '%${params.fieldType}%'`
            p1.push(params.type)
        } else if (leaderItemField[params.type].map == 'equal') {
            subsql = `${subsql} AND vlf.type = ? AND piv.value = ?`
            p1.push(params.type, `"${leaderItemField[params.type].data}"`)
        } else if (leaderItemField[params.type].map == 'more than') {
            subsql = `${subsql} AND vlf.type = ? AND piv.value > 0 
                AND NOT EXISTS(
                    SELECT vlf1.id FROM vision_leader_field vlf1 
                    JOIN process_instance_values piv2 ON vlf1.field_id = piv2.field_id 
                        AND piv2.instance_id = pi.id
                    WHERE piv2.value > 0 
                        AND vlf1.type < vlf.type
                        AND vlf1.form_id = vl.form_id
                        AND vlf1.type IN (7,8)
                )`
            p1.push(params.type)
        } else if (leaderItemField[params.type].map == 'same') {
            subsql = `${subsql} AND vlf.type = ? AND (piv.value = 0 OR NOT EXISTS(
                    SELECT piv2.id FROM process_instance_values piv2 WHERE piv2.instance_id = pi.id
                        AND piv.field_id = piv2.field_id
                )) AND NOT EXISTS(
                    SELECT piv2.id FROM process_instance_values piv2 WHERE piv2.instance_id = pi.id
                        AND piv.field_id != piv2.field_id 
                        AND vlf.field_id LIKE CONCAT('%', piv2.field_id, '%')
                        AND piv2.value > 0
                )`
            p1.push(params.type)
        } else {
            subsql = `${subsql} AND vlf.type = ? AND piv.value = ?`
            p1.push(params.type, `"${params.fieldType}"`)
        }
    }
    if (params.leaderType) {
        subsql = `${subsql} AND vl.vision_type = ?`
        p1.push(params.leaderType)
    }
    subsql = `${subsql}
        GROUP BY pi.id, pi.instance_id, pi.status, pi.title,  pi.create_time, pi.update_time`
    let search = `${presql}${subsql}) a`
    let row = await query(search, p1)
    if (row?.length && row[0].count) {
        result.total = row[0].count
        if (limit) {
            search = `SELECT * FROM (${subsql}) a LIMIT ${offset}, ${limit}`
        } else {
            search = `SELECT * FROM (${subsql}) a`
        }
        row = await query(search, p1)
        if (row?.length) {
            for (let i = 0; i < row.length; i++) {
                search = `SELECT field_id AS fieldId, \`value\` AS fieldValue FROM 
                    process_instance_values WHERE instance_id = ?`
                row[i]['data'] = await query(search, [row[i].id]) || []
                search = `SELECT show_name, operator_name FROM process_instance_records 
                    WHERE instance_id = ? ORDER BY 
                    IF(action_exit IS NULL, 2, IF(action_exit IN ('next', 'doing'), 0, 1)), 
                    operate_time DESC, id DESC LIMIT 1`
                let row1 = await query(search, [row[i].id])
                if (row1?.length) {
                    row[i]['action'] = row1[0].show_name
                    row[i]['operator'] = row1[0].operator_name
                }
                let user = await userRepo.getUserByDingdingUserId(row[i].creator)
                if (user?.length) {
                    row[i]['creator'] = user[0].nickname
                }
            }
            result.data = row
        }
    }
    return result
}

const getFlowActions = async function (id) {
    let sql = `SELECT * FROM process_instance_records WHERE instance_id = ? ORDER BY 
        IF(action_exit IS NULL, 2, IF(action_exit IN ('next', 'doing'), 1, 0)), operate_time, id`
    const result = await query(sql, [id])
    
    return result || []
}

const getLeaderStat = async function (result, start, end) {
    let sql = `SELECT COUNT(1) AS count, type, leader_type FROM 
        (SELECT type, leader_type FROM vision_leaders
            WHERE IF(type = 2 OR leader_type > 0, IF(v1 IS NULL, v2, v1) LIKE CONCAT('%', v3, '%'), 1=1)
                AND operate_time >= ? 
                AND operate_time <= ?
                AND tag = 'visionLeader'
            GROUP BY id, type, leader_type
        ) a GROUP BY type, leader_type`
    let row = await query(sql, [start, end])
    for (let i = 0; i < row.length; i++) {
        let child_key = statLeaderItem[row[i].leader_type].childMap[row[i].type]
        result[row[i].leader_type].children[child_key].sum += row[i].count
        result[row[i].leader_type].sum += row[i].count
    }

    return result
}

const getDesignerFlowStat = async function (users, start, end) {
    let result = []
    for (let i = 0; i < users.length; i++) {
        if (nameFilter[users[i]]) {
            users.push(nameFilter[users[i]])
        }
    }
    let sql = `SELECT COUNT(1) AS count, operator_name, type FROM (
        SELECT pir2.operator_name, vl1.type FROM vision_leader vl1 
        JOIN processes p ON p.form_id = vl1.form_id
        JOIN process_instances pi ON p.id = pi.process_id
            AND pi.status IN ('RUNNING', 'COMPLETED')
        JOIN vision_leader vl2 ON vl1.form_id = vl2.form_id
            AND vl2.action_exit = 'agree'
            AND vl1.vision_type = 2
            AND vl2.vision_type = 1
            AND vl1.id > vl2.id
        JOIN process_instance_records pir1 ON pir1.instance_id = pi.id
            AND pir1.activity_id = vl1.activity_id
            AND pir1.show_name = vl1.activity_name
            AND pir1.action_exit = vl1.action_exit
            AND pir1.id = (
                SELECT MAX(p2.id) FROM process_instance_records p2
                WHERE p2.instance_id = pi.id 
                    AND p2.activity_id = vl1.activity_id 
                    AND p2.show_name = vl1.activity_name)
        JOIN process_instance_records pir2 ON pir2.instance_id = pi.id
            AND pir2.activity_id = vl2.activity_id
            AND pir2.show_name = vl2.activity_name
            AND pir2.action_exit = vl2.action_exit
            AND pir2.id = (
                SELECT MAX(p2.id) FROM process_instance_records p2
                WHERE p2.instance_id = pi.id 
                    AND p2.activity_id = vl2.activity_id 
                    AND p2.show_name = vl2.activity_name)
        JOIN vision_type vt ON vt.form_id = vl1.form_id 
        LEFT JOIN process_instance_values piv1 ON piv1.instance_id = pi.id
            AND piv1.field_id = vt.field_id
            AND vt.type = 0
        LEFT JOIN process_receipt pr ON pr.process_id = pi.id
        LEFT JOIN receipt_instance_values riv ON riv.field_id = vt.field_id
            AND riv.instance_id = pr.receipt_id
        JOIN form_fields ff ON ff.form_id = IF(vt.type = 0, vt.form_id, vt.sub_form_id)
            AND vt.field_id = ff.field_id
        LEFT JOIN vision_field_type vft ON vft.form_id = ff.form_id
        LEFT JOIN form_field_data ffd ON ffd.id = vft.ffd_id
        WHERE pir1.operate_time >= ?
            AND pir1.operate_time <= ? 
            AND IF(piv1.value IS NULL, riv.value, piv1.value) LIKE CONCAT('%', ffd.value, '%')
            AND vft.type NOT IN (0, 4) 
            AND pir2.operator_name IN (${users.map(() => '?').join(',')})      
        GROUP BY pi.id, pir2.operator_name, vl1.type
    ) a GROUP BY operator_name, type  
    ORDER BY operator_name, type`, 
    params = [start, end, ...users]
    result = await query(sql, params)
    return result || []
}

const getPhotographerFlowStat = async function (users, start, end) {
    let result = []
    let sql = `SELECT COUNT(1) AS count, type FROM (
        SELECT vl.type FROM vision_leader vl
        JOIN processes p ON p.form_id = vl.form_id
        JOIN process_instances pi ON p.id = pi.process_id
            AND pi.status IN ('COMPLETED', 'RUNNING')
        JOIN process_instance_records pir ON pi.id = pir.instance_id
                AND pir.activity_id = vl.activity_id
                AND pir.show_name = vl.activity_name
                AND pir.action_exit = vl.action_exit
                AND pir.id = (
                    SELECT MAX(p2.id) FROM process_instance_records p2
                    WHERE p2.instance_id = pi.id 
                        AND p2.activity_id = vl.activity_id 
                        AND p2.show_name = vl.activity_name)
        JOIN vision_type vt ON vt.form_id = vl.form_id 
        LEFT JOIN process_instance_values piv1 ON piv1.instance_id = pi.id
            AND piv1.field_id = vt.field_id
            AND vt.type = 0
        LEFT JOIN process_receipt pr ON pr.process_id = pi.id
        LEFT JOIN receipt_instance_values riv ON riv.field_id = vt.field_id
            AND riv.instance_id = pr.receipt_id
        JOIN form_fields ff ON ff.form_id = IF(vt.type = 0, vt.form_id, vt.sub_form_id)
            AND vt.field_id = ff.field_id
        LEFT JOIN vision_field_type vft ON vft.form_id = ff.form_id
        LEFT JOIN form_field_data ffd ON ffd.id = vft.ffd_id
        WHERE vl.vision_type = 2
            AND pir.operate_time >= ?
            AND pir.operate_time <= ? 
            AND IF(piv1.value IS NULL, riv.value, piv1.value) LIKE CONCAT('%', ffd.value, '%')
            AND vft.type NOT IN (0, 4) 
            AND EXISTS (
                SELECT pir2.id FROM process_instance_records pir2 
                WHERE pi.id = pir2.instance_id 
                    AND pir2.operator_name IN (${users.map(() => '?').join(',')})            
            ) GROUP BY pi.id, vl.type
        ) a GROUP BY type`, params = [start, end, ...users]
    result = await query(sql, params)
    return result || []
}

const getDesignerNodeStat = async function (group, start, end) {
    let result = []
    let presql = `SELECT COUNT(1) AS count, vision_type, type`, 
    sql = `FROM (SELECT MIN(vision_type) AS vision_type, id, type FROM (
	    SELECT pi.id, vl1.type, vlf.type AS vision_type FROM vision_leader vl1 
        JOIN vision_leader_field vlf ON vlf.form_id = vl1.form_id
            AND vlf.type IN (7,8,9)  
            AND vlf.tag = 'visionLeader'
        JOIN processes p ON p.form_id = vl1.form_id
        JOIN process_instances pi ON p.id = pi.process_id
            AND pi.status IN ('RUNNING', 'COMPLETED')
        JOIN vision_leader vl2 ON vl1.form_id = vl2.form_id
            AND vl1.vision_type = 2
            AND vl2.vision_type = 1
            AND vl1.id > vl2.id
        JOIN process_instance_records pir1 ON pir1.instance_id = pi.id
            AND pir1.activity_id = vl1.activity_id
            AND pir1.show_name = vl1.activity_name
            AND pir1.action_exit = vl1.action_exit
            AND pir1.id = (
                SELECT MAX(p2.id) FROM process_instance_records p2
                WHERE p2.instance_id = pi.id 
                    AND p2.activity_id = vl1.activity_id 
                    AND p2.show_name = vl1.activity_name)
        JOIN process_instance_records pir2 ON pir2.instance_id = pi.id
            AND pir2.activity_id = vl2.activity_id
            AND pir2.show_name = vl2.activity_name
            AND pir2.action_exit = vl2.action_exit
            AND pir2.id = (
                SELECT MAX(p2.id) FROM process_instance_records p2
                WHERE p2.instance_id = pi.id 
                    AND p2.activity_id = vl2.activity_id 
                    AND p2.show_name = vl2.activity_name)
        JOIN vision_type vt ON vt.form_id = vl1.form_id 
        LEFT JOIN process_instance_values piv1 ON piv1.instance_id = pi.id
            AND piv1.field_id = vt.field_id
            AND vt.type = 0
        LEFT JOIN process_receipt pr ON pr.process_id = pi.id
        LEFT JOIN receipt_instance_values riv ON riv.field_id = vt.field_id
            AND riv.instance_id = pr.receipt_id
        JOIN form_fields ff ON ff.form_id = IF(vt.type = 0, vt.form_id, vt.sub_form_id)
            AND vt.field_id = ff.field_id
        LEFT JOIN vision_field_type vft ON vft.form_id = ff.form_id
        LEFT JOIN form_field_data ffd ON ffd.id = vft.ffd_id
        WHERE pir1.operate_time >= ? 
            AND pir1.operate_time < ?
            AND IF(piv1.value IS NULL, riv.value, piv1.value) LIKE CONCAT('%', ffd.value, '%')
            AND vft.type NOT IN (0, 4)
            AND IF(vlf.is_reverse = 0, 
                EXISTS(
                    SELECT piv.id FROM process_instance_values piv 
                    WHERE piv.instance_id = pi.id
                        AND vlf.field_id = piv.field_id
                        AND piv.value > 0
                ) AND NOT EXISTS(
                    SELECT vlf1.id FROM vision_leader_field vlf1 
                    JOIN process_instance_values piv ON piv.instance_id = pi.id 
                        AND vlf1.field_id = piv.field_id
                    WHERE vlf1.type < vlf.type
                        AND vlf1.type IN (7,8)
                        AND piv.value > 0), 
                NOT EXISTS(
                    SELECT piv.id FROM process_instance_values piv 
                    WHERE piv.instance_id = pi.id
                        AND vlf.field_id LIKE CONCAT('%', piv.field_id, '%')
                        AND piv.value > 0))
            AND pir2.operator_name IN `,
    subsql = `ORDER BY group_id, type, vision_type`,
    params = [], search = ''
    for (let i = 0; i < group.length; i++) {
        let name = group[i].actionName
        let users = [name]
        if (nameFilter[name]) {
            users.push(nameFilter[name])
        }
        search = `${search}${presql}, ${i} AS group_id ${sql}
                (${users.map(() => '?').join(',')}) 
                GROUP BY pi.id, vl1.type, vlf.type
            ) a GROUP BY a.id, a.type
            ) b GROUP BY b.type, b.vision_type union all `
        params.push(start, end, ...users)
    }
    search = search.substring(0, search.length - 10)
    search = `${search}${subsql}`
    result = await query(search, params)
    return result
}

const getPhotographerNodeStat = async function (users, start, end) {
    let result = []
    let sql = `SELECT COUNT(1) AS count, type, vision_type FROM (
        SELECT vl.type, vlf.type AS vision_type FROM vision_leader vl
        JOIN vision_leader_field vlf ON vl.form_id = vl.form_id
            AND vlf.type IN (4,5) 
            AND vlf.tag = 'visionLeader'
        JOIN processes p ON p.form_id = vl.form_id
        JOIN process_instances pi ON p.id = pi.process_id
            AND pi.status IN ('COMPLETED', 'RUNNING')
        JOIN process_instance_records pir ON pi.id = pir.instance_id
                AND pir.activity_id = vl.activity_id
                AND pir.show_name = vl.activity_name
                AND pir.action_exit = vl.action_exit
                AND pir.id = (
                    SELECT MAX(p2.id) FROM process_instance_records p2
                    WHERE p2.instance_id = pi.id 
                        AND p2.activity_id = vl.activity_id 
                        AND p2.show_name = vl.activity_name)
        JOIN process_instance_values piv ON piv.instance_id = pi.id
            AND piv.field_id = vlf.field_id
            AND piv.value = '"是"'
        JOIN vision_type vt ON vt.form_id = vl.form_id 
        LEFT JOIN process_instance_values piv1 ON piv1.instance_id = pi.id
            AND piv1.field_id = vt.field_id
            AND vt.type = 0
        LEFT JOIN process_receipt pr ON pr.process_id = pi.id
        LEFT JOIN receipt_instance_values riv ON riv.field_id = vt.field_id
            AND riv.instance_id = pr.receipt_id
        JOIN form_fields ff ON ff.form_id = IF(vt.type = 0, vt.form_id, vt.sub_form_id)
            AND vt.field_id = ff.field_id
        LEFT JOIN vision_field_type vft ON vft.form_id = ff.form_id
        LEFT JOIN form_field_data ffd ON ffd.id = vft.ffd_id
        WHERE vl.vision_type = 2 
            AND pir.operate_time >= ? 
            AND pir.operate_time <= ? 
            AND IF(piv1.value IS NULL, riv.value, piv1.value) LIKE CONCAT('%', ffd.value, '%') 
            AND vft.type NOT IN (0, 4) 
            AND EXISTS (
                SELECT pir2.id FROM process_instance_records pir2 
                WHERE pi.id = pir2.instance_id
                    AND pir2.operator_name IN (${users.map(() => '?').join(',')}) 
            ) GROUP BY pi.id, vl.type, vlf.type
        ) a GROUP BY type, vision_type`, params = [start, end, ...users]
    result = await query(sql, params)
    return result || []
}

const getDesignerStat = async function (user, type, start, end) {
    let usernames = [user]
    for (let name in nameFilter) {
        if (user == name) {
            usernames.push(nameFilter[name])
        }
    }    
    let sql = `SELECT SUM(a.count) AS count, a.operator_name, a.title FROM (
            SELECT p1.operator_name, ff.title, CAST(IFNULL(IF(piv.value IS NULL, 
                REPLACE(pis.value, '"', ''), 
                REPLACE(piv.value, '"', '')), 0) AS DECIMAL) AS count FROM 
            vision_leader vl1 
            JOIN processes p ON p.form_id = vl1.form_id
            JOIN process_instances pi ON p.id = pi.process_id
                AND pi.status IN ('RUNNING', 'COMPLETED')
            JOIN vision_leader vl2 ON vl1.form_id = vl2.form_id
                AND vl2.action_exit = 'agree'
                AND vl1.vision_type = 2
                AND vl2.vision_type = 1
                AND vl1.id > vl2.id
            JOIN process_instance_records pir1 ON pir1.instance_id = pi.id
                AND pir1.activity_id = vl1.activity_id
                AND pir1.show_name = vl1.activity_name
                AND pir1.action_exit = vl1.action_exit
                AND pir1.id = (
                    SELECT MAX(p2.id) FROM process_instance_records p2
                    WHERE p2.instance_id = pi.id 
                        AND p2.activity_id = vl1.activity_id 
                        AND p2.show_name = vl1.activity_name)
            JOIN process_instance_records pir2 ON pir2.instance_id = pi.id
                AND pir2.activity_id = vl2.activity_id
                AND pir2.show_name = vl2.activity_name
                AND pir2.action_exit = vl2.action_exit
                AND pir2.id = (
                    SELECT MAX(p2.id) FROM process_instance_records p2
                    WHERE p2.instance_id = pi.id
                        AND p2.activity_id = vl2.activity_id
                        AND p2.show_name = vl2.activity_name)
            JOIN vision_activity va ON va.form_id = vl1.form_id
            JOIN vision_activity_field vaf ON vaf.activity_id = va.id 
                AND vaf.type = 1
            JOIN process_instance_records p1 ON p1.instance_id = pi.id
                    AND va.activity_id = p1.activity_id
                    AND va.activity_name = p1.show_name
                    AND p1.action_exit = 'agree' 
                    AND p1.id = (
						SELECT MAX(p2.id) FROM process_instance_records p2
						WHERE p2.instance_id = pi.id
							AND p2.activity_id = va.activity_id
							AND p2.show_name = va.activity_name)
            LEFT JOIN process_instance_values piv ON piv.instance_id = pi.id
                AND piv.field_id = vaf.field_id
                AND vaf.is_sub = 0
                AND IF(va.is_sub = 1 AND EXISTS(
                    SELECT pis2.id FROM process_instance_sub_values pis2 
                    WHERE pis2.instance_id = pi.id
                ), FALSE, TRUE)
            LEFT JOIN process_instance_sub_values pis1 ON pis1.instance_id = pi.id
                AND pis1.field_id = va.sub_field
                AND pis1.value = pir1.operator_name 
            LEFT JOIN process_instance_sub_values pis ON pis.instance_id = pi.id
                AND pis.field_id = vaf.field_id
                AND vaf.is_sub = 1
                AND pis.index = pis1.index
            JOIN form_fields ff ON ff.form_id = vl1.form_id
                AND ff.field_id = IF(pis.id IS NOT NULL, pis.field_id, piv.field_id)
            JOIN vision_type vt ON vt.form_id = vl1.form_id 
                AND vt.tag = va.tag
            LEFT JOIN process_instance_values piv1 ON piv1.instance_id = pi.id
                AND piv1.field_id = vt.field_id
                AND vt.type = 0
            LEFT JOIN process_receipt pr ON pr.process_id = pi.id
            LEFT JOIN receipt_instance_values riv ON riv.field_id = vt.field_id
                AND riv.instance_id = pr.receipt_id
            JOIN form_fields ff1 ON ff1.form_id = IF(vt.type = 0, vt.form_id, vt.sub_form_id)
                AND vt.field_id = ff1.field_id
            LEFT JOIN vision_field_type vft ON vft.form_id = ff1.form_id
            LEFT JOIN form_field_data ffd ON ffd.id = vft.ffd_id
            WHERE pir1.operate_time >= ?
                AND pir1.operate_time <= ? 
                AND IF(piv1.value IS NULL, riv.value, piv1.value) LIKE CONCAT('%', ffd.value, '%') 
                AND vft.type NOT IN (0, 4) 
                AND vl1.type = ?
                AND va.tag = 'insideArt'
                AND pir2.operator_name IN (${usernames.map(() => '?').join(',')})      
        ) a GROUP BY a.operator_name, a.title`, params = [start, end, type, ...usernames]
    let result = []
    let row = await query(sql, params)
    if (row?.length) result = row
    return result
}

const getPhotographerStat = async function (user, type, start, end) {
    let sql = `SELECT SUM(a.count) AS count, a.title FROM (
            SELECT ff.title, CAST(IFNULL(IF(piv.value IS NULL, 
                    REPLACE(pis.value, '"', ''), 
                    REPLACE(piv.value, '"', '')), 0) AS DECIMAL) AS count 
            FROM vision_leader vl
            JOIN vision_activity va ON va.form_id = vl.form_id
            JOIN vision_activity_field vaf ON vaf.activity_id = va.id
                AND vaf.type = 1
            JOIN processes p ON p.form_id = vl.form_id
            JOIN process_instances pi ON pi.process_id = p.id
                AND pi.status IN ('RUNNING', 'COMPLETED')
            JOIN process_instance_records pir ON pir.instance_id = pi.id
                AND vl.activity_id = pir.activity_id
                AND vl.activity_name = pir.show_name
                AND vl.action_exit = pir.action_exit
                AND pir.id = (
                    SELECT MAX(p2.id) FROM process_instance_records p2
                    WHERE p2.instance_id = pi.id 
                        AND p2.activity_id = vl.activity_id 
                        AND p2.show_name = vl.activity_name)
            JOIN process_instance_records p1 ON p1.instance_id = pi.id
                AND va.activity_id = p1.activity_id
                AND va.activity_name = p1.show_name
                AND p1.action_exit IN ('next', 'doing', 'agree')
            LEFT JOIN process_instance_values piv ON piv.instance_id = pi.id
                AND piv.field_id = vaf.field_id
                AND vaf.is_sub = 0
                AND IF(va.is_sub = 1 AND EXISTS(
                    SELECT pis2.id FROM process_instance_sub_values pis2 
                    WHERE pis2.instance_id = pi.id
                ), FALSE, TRUE)
            LEFT JOIN process_instance_sub_values pis1 ON pis1.instance_id = pi.id
                AND pis1.field_id = va.sub_field
                AND pis1.value = p1.operator_name
            LEFT JOIN process_instance_sub_values pis ON pis.instance_id = pi.id
                AND pis.field_id = vaf.field_id
                AND vaf.is_sub = 1
                AND pis.index = pis1.index
            JOIN form_fields ff ON ff.form_id = vl.form_id
                AND ff.field_id = IF(pis.id IS NOT NULL, pis.field_id, piv.field_id)
            WHERE vl.vision_type = 2 
                AND va.tag = 'insidePhoto'
                AND pir.operate_time >= ?
                AND pir.operate_time <= ?
                AND vl.type = ? 
                AND ((p1.operator_name = ? AND pis1.id IS NULL) OR pis1.value = ?)
                AND vaf.type = 1
            GROUP BY pi.id, piv.id, pis.id, ff.title, piv.value, pis.value
        ) a GROUP BY a.title`, params = [start, end, type, user, user]
    let result = []
    let row = await query(sql, params)
    if (row?.length) result = row
    return result
}

const getVisionFieldName = async function (tag) {
    let sql = `SELECT ff.title FROM vision_leader vl
        JOIN vision_activity va ON va.form_id = vl.form_id
        JOIN vision_activity_field vaf ON vaf.activity_id = va.id
        JOIN form_fields ff ON ff.form_id = vl.form_id
            AND ff.field_id = vaf.field_id
        WHERE vl.vision_type = 2
            AND vaf.type = 1
            AND va.tag = ?
        GROUP BY ff.title`
    let result = await query(sql, tag)
    return result || []
}

const getVisionType = async function (start, end, tag, type, leader_type) {
    let sql = `SELECT COUNT(1) AS count, vision_type FROM vision_leaders
        WHERE IF(v1 IS NULL, v2, v1) LIKE CONCAT('%', v3, '%')
            AND tag = ? 
            AND type = ? 
            AND leader_type = ?
            AND operate_time >= ? 
            AND operate_time <= ?
        GROUP BY vision_type`
    let row = await query(sql, [tag, type, leader_type, start, end])
    return row || []
}

const getVisionField = async function (start, end, tag, type, leader_type, field_type) {
    let sql = `SELECT REPLACE(a.value, '"', '') AS value, COUNT(1) AS count FROM (
        SELECT vl.id, piv.value FROM vision_leaders vl
        JOIN vision_leader_field vlf ON vl.form_id = vlf.form_id
            AND vl.tag = vlf.tag
        JOIN process_instance_values piv ON piv.instance_id = vl.id
            AND piv.field_id = vlf.field_id
        WHERE vl.tag = ? 
            AND vl.type = ?
            AND vl.leader_type = ?
            AND IF(v1 IS NULL, v2, v1) LIKE CONCAT('%', v3, '%')`
    let params = [tag, type, leader_type]
    if (field_type != null) {
        sql = `${sql} AND vlf.type = ?`
        params.push(field_type)
    }     
    sql = `${sql} AND vl.operate_time >= ? 
                AND vl.operate_time <= ? 
            GROUP BY pi.id, piv.value
        ) a GROUP BY a.value`
    params.push(start, end)
    let row = await query(sql, params)
    return row || []
}

const getVisionFieldValue = async function (start, end, tag, type, leader_type, field_type) {
    let sql = `SELECT COUNT(1) AS count FROM (
        SELECT vl.id, MIN(vlf.type) AS type FROM vision_leaders vl
        JOIN vision_leader_field vlf ON vl.form_id = vlf.form_id
            AND vl.tag = vlf.tag
        WHERE vl.tag = ? 
            AND vl.type = ?
            AND vl.leader_type = ? 
            AND vlf.type = ? 
            AND IF(v1 IS null, v2, v1) LIKE CONCAT('%', v3, '%') 
            AND IF(vlf.is_reverse = 0, 
                EXISTS(SELECT piv.id FROM process_instance_values piv 
                    WHERE piv.instance_id = vl.id 
                        AND vlf.field_id = piv.field_id
                        AND piv.value > 0
                ) AND NOT EXISTS(
                    SELECT vlf1.id FROM vision_leader_field vlf1 
                    JOIN process_instance_values piv ON piv.instance_id = vl.id 
                        AND vlf1.field_id = piv.field_id
                    WHERE vlf1.type < vlf.type
                        AND vlf1.type IN (7,8)
                        AND piv.value > 0), 
                NOT EXISTS( 
                    SELECT piv.id FROM process_instance_values piv 
                    WHERE piv.instance_id = vl.id 
                        AND vlf.field_id LIKE CONCAT('%', piv.field_id, '%')
                        AND piv.value > 0)) 
            AND vl.operate_time >= ? 
            AND vl.operate_time <= ? 
            GROUP BY vl.id
        ) a`
    let params = [tag, type, leader_type, field_type, start, end]
    let row = await query(sql, params)
    return row || []
}

const getVisionInfo = async function (type) {
    let result = {
        columns: [
            {
                field_id: 'title',
                title: '流程名称'
            }, {
                field_id: 'type',
                title: type == 0 ? '预审状态' : '方案状态'
            }
        ],
        data: []
    }
    let sql = `SELECT ff.id, ff.field_id, ff.title FROM vision_leader vl
        JOIN vision_pannel vp ON vp.form_id = vl.form_id
            AND vl.vision_type = vp.type
        JOIN form_fields ff ON ff.form_id = vp.form_id
            AND vp.field_id = ff.field_id
        WHERE vl.vision_type = ${type}
        GROUP BY ff.id, ff.field_id, ff.title ORDER BY ff.id`
    let row = await query(sql)
    if (row?.length) result.columns = result.columns.concat(row)
    sql = `SELECT pi.instance_id, pi.title, ff.field_id, pi.id, 
        (CASE vl.type WHEN 0 THEN '待转入' ELSE '进行中' END) AS type, 
        REPLACE(piv.value, '"', '') AS value FROM vision_leader vl
        JOIN processes p ON p.form_id = vl.form_id
        LEFT JOIN process_instances pi ON pi.process_id = p.id
            AND pi.status IN ('COMPLETED', 'RUNNING')
        JOIN vision_pannel vp ON vp.form_id = vl.form_id 
            AND vp.type = vl.vision_type
		JOIN process_instance_records pir ON pir.instance_id = pi.id
			AND pir.show_name = vl.activity_name 
			AND pir.activity_id = vl.activity_id
			AND pir.action_exit = vl.action_exit
        LEFT JOIN process_instance_values piv ON piv.instance_id = pi.id
            AND piv.field_id = vp.field_id
        JOIN form_fields ff ON ff.form_id = vl.form_id 
            AND ff.field_id = vp.field_id
        WHERE vl.type IN (0, 1) AND vl.vision_type = ${type}
        ORDER BY pi.id, vl.type, ff.field_id`
    row = await query(sql)
    if (row?.length) {
        let info = {}
        for (let i = 0; i < row.length; i++) {
            if (i == 0 || !(row[i].id == row[i-1].id && 
                row[i].field_id == row[i-1].field_id)) {
                if (!info[row[i].instance_id]) {
                    info[row[i].instance_id] = {
                        title: row[i].title,
                        instance_id: row[i].instance_id,
                        type: row[i].type
                    }
                    info[row[i].instance_id][row[i].field_id] = row[i].value
                } else {
                    info[row[i].instance_id][row[i].field_id] = row[i].value
                }
            }
        }
        for (let index in info) {
            result.data.push(info[index])
        }
    }
    return result
}

const getOperateSelection = async function (start, end, title, page, size, form_id, p) {
    let params = [], search = '', total = 0, data = []
    let presql = `SELECT COUNT(1) AS count FROM (`
    let sql = `SELECT pi.id, pi.instance_id, pi.title, pi.create_time, ot.form_id 
        FROM operation_type ot 
        JOIN operation_type_activity ota ON ota.type_id = ot.id 
        JOIN processes p ON p.form_id = ot.form_id
        JOIN process_instances pi ON pi.process_id = p.id
            AND pi.status IN ('COMPLETED', 'RUNNING')
		JOIN process_instance_records pir ON pir.instance_id = pi.id
			AND pir.show_name = ota.activity_name 
			AND pir.activity_id = ota.activity_id
			AND pir.action_exit = ota.action_exit
        WHERE ot.form_id = ${form_id} 
            AND ot.operate_type = 1`
    if (start) {
        sql = `${sql} 
            AND pi.create_time >= ?`
        params.push(start)
    }
    if (end) {
        sql = `${sql} 
            AND pi.create_time <= ?`
        params.push(end)
    }
    if (title) {
        sql = `${sql} 
            AND pi.title like '%${title}%'`
    }
    if (p) {
        let sql1 = `SELECT id FROM form_fields WHERE form_id = ${form_id} AND field_id = ?`
        for(let index in p) {
            let find = await query(sql1, index)
            if (!find?.length) return {data, total}
            sql = `${sql}
                AND EXISTS(
                    SELECT piv1.id FROM process_instance_values piv1
                    WHERE piv1.instance_id = pi.id
                        AND piv1.field_id = "${index}" 
                        AND piv1.value LIKE '%${p[index]}%')`
        }
    }
    sql = `${sql}
            GROUP BY pi.id, pi.instance_id, pi.title, pi.create_time, ot.form_id`
    search = `${presql}
        ${sql}) a`
    let row = await query(search, params)
    if (row?.length && row[0].count) {
        total = row[0].count
        search = `SELECT a.id, a.instance_id, a.title, ff.field_id, 
            REPLACE(piv.value, '"', '') AS value, 
            DATE_FORMAT(a.create_time, '%Y-%m-%d') AS create_time FROM (
                ${sql}
                LIMIT ${(page - 1) * size}, ${size}) a            
            JOIN operation_pannel op ON a.form_id = op.form_id 
                AND op.type = 1 
            JOIN process_instance_values piv ON piv.instance_id = a.id
                AND piv.field_id = op.field_id
            JOIN form_fields ff ON ff.form_id = a.form_id 
                AND ff.field_id = op.field_id 
            GROUP BY a.id, a.instance_id, a.title, a.create_time, ff.field_id, piv.value 
            ORDER BY a.id`
        row = await query(search, params)
        if (row?.length) data = row
    }
    return {data, total}
}

const getOperateSubField = async function (form_id, field_id) {
    let sql = `SELECT ff.id, ff.field_id, ff.title FROM form_fields ff
        JOIN form_fields ff1 ON ff.parent_id = ff1.id 
        WHERE ff1.form_id = ${form_id} 
            AND ff1.field_id = ?
        ORDER BY ff.id DESC`
    let row = await query(sql, [field_id])
    return row || []
}

const getOperateSelectionHeader = async function (form_id) {
    let columns = []
    let sql = `SELECT ff.id, ff.field_id, ff.title, ffd.value FROM operation_type ot
        JOIN operation_pannel op ON ot.form_id = op.form_id 
        JOIN form_fields ff ON ff.form_id = op.form_id 
            AND ff.field_id = op.field_id 
        LEFT JOIN form_field_data ffd ON ff.id = ffd.form_field_id
        WHERE ot.form_id = ${form_id}
            AND ot.operate_type = 1 
        GROUP BY ff.id, ff.field_id, ff.title, ffd.value 
        ORDER BY ff.id`
    let row = await query(sql)
    if (row?.length) columns = row
    return columns
}

const getOperationWork = async function (start, end, params) {
    let sql = `SELECT COUNT(1) AS count, (
            SELECT title FROM forms WHERE id = form_id
        ) AS title, form_id, type, operate_type FROM (
        SELECT p.form_id, pi.id, ot.operate_type, MIN(ot.type) AS type 
        FROM operation_type ot
        JOIN operation_type_activity ota ON ot.id = ota.type_id
        JOIN processes p ON p.form_id = ot.form_id
        JOIN process_instances pi ON p.id = pi.process_id
        JOIN process_instance_records pir ON pi.id = pir.instance_id
            AND pir.show_name = ota.activity_name
            AND pir.activity_id = ota.activity_id
            AND pir.action_exit = ota.action_exit
            AND pir.id = (
                SELECT MAX(p2.id) FROM process_instance_records p2
                WHERE p2.instance_id = pi.id
                    AND p2.show_name = ota.activity_name
                    AND p2.activity_id = ota.activity_id
            )
        WHERE pi.status IN ('COMPLETED', 'RUNNING')
            AND pir.operate_time >= ?
            AND pir.operate_time <= ?
            AND ota.type = ?`
    let p = [start, end, params.type]
    if (params.nickname) {
        sql = `${sql}
                AND pir.operate_name = ?`
        p.push(params.nickname)
    }
    sql = `${sql}
            GROUP BY p.form_id, pi.id, ot.type, ot.operate_type
        ) a GROUP BY form_id, type, operate_type`
    let result = await query(sql, p)
    return result || []
}

const getOperationAnalysisStats = async function (instance_id) {
    let sql = `SELECT COUNT(1) AS count, replace(piv1.value, '"', '') AS platform 
        FROM process_instances pi JOIN processes p ON p.id = pi.process_id 
        JOIN process_instance_values piv ON piv.instance_id = pi.id 
            AND piv.field_id = 'textField_m2pxi0qq'
        JOIN process_instance_values piv1 ON piv1.instance_id = pi.id 
            AND piv1.field_id = 'radioField_m1g24ev1'
        WHERE p.form_id = 355 
            AND pi.status IN ('RUNNING', 'COMPLETED') 
            AND piv.value = ?
        GROUP BY piv1.value`
    let row = await query(sql, [`"${instance_id}"`])
    return row
}

const checkOperationNodes = async function (instance_id, activity, userId) {
    let sql = `SELECT * FROM process_instance_records pir 
        JOIN process_instance_records pir1 ON pir.instance_id = pir1.instance_id
            AND pir.activity_id = pir1.activity_id
            AND pir.show_name = pir1.show_name
        WHERE pir.instance_id = ? 
            AND pir.show_name = ? 
            AND pir.activity_id = ? 
            AND pir.action_exit = 'doing' 
            AND pir1.operator = ?
            AND (pir1.action_exit = 'doing' OR pir1.action_exit IS NULL)`
    let row = await query(sql, [
        instance_id, 
        activity.activity_name,
        activity.activity_id,
        userId
    ])
    return row?.length ? true : false
}

module.exports = {
    getProcessStat,
    getFlowInstances,
    getOperationFlowInstances,
    getFlowProcessInstances,
    getOperationProcessInstances,
    getVisionProcessInstances,
    getFlowActions,
    getStat,
    getLeaderStat,
    getVisionInfo,
    getDesignerFlowStat,
    getPhotographerFlowStat,
    getDesignerNodeStat,
    getPhotographerNodeStat,
    getDesignerStat,
    getPhotographerStat,
    getVisionFieldName,
    getVisionType,
    getVisionField,
    getVisionFieldValue,
    getOperationWork,
    getOperateSelection,
    getOperateSubField,
    getOperateSelectionHeader,
    getOperationAnalysisStats,
    checkOperationNodes
}