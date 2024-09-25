const { query } = require('../model/newDbConn')
const {
    item,
    action,
    actionItem,
    actionItem2,
    actionFilter,
    statItem,
    statItem1,
    statItem2,
    statItem2Type,
    statItem3,
    statItem4,
    totalName,
    totalCode,
    totalStat,
    totalStatType,
    typeFilter,
    fullActionFilter,
    nameFilter,
    statLeaderItem,
    leaderItemField
} = require('../const/newFormConst')
const moment = require('moment')

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

    let sql = `select a.id, vft.type, a.action_exit from (
            select id, field_id, form_id, show_name, action_exit, type 
            from vision_personal where tag = '${tag}'
                and (operator_name = ? or v1 = ? or v2 = ? ???) 
                and operate_time >= '${startDate}' 
                and operate_time <= '${endDate}'
            group by id, field_id, form_id, show_name, action_exit, type
        ) a left join vision_field_type vft on vft.form_id = a.form_id 
            left join form_field_data ffd on ffd.id = vft.ffd_id 
            join form_fields ff2 on ff2.field_id = a.field_id 
                and ffd.form_field_id = ff2.id
            where a.type like concat('%', ffd.value, '%') 
            order by a.id, 
                case a.action_exit 
                when 'agree' then 2 
                when 'doing' then 1 
                else 0 end`
            
    let sql1 = `select ifnull(sum(a.count), 0) as count, a.action_exit from (
            select vp.id, vp.field_id, vp.form_id, vp.show_name, vp.action_exit, 
                cast(ifnull(if(piv3.value is null, replace(pis2.value, '"', ''), replace(piv3.value, '"', '')), 0) as decimal) as count, vp.type
            from vision_personal vp 
            left join vision_activity_field vaf on vp.vt_form_id = vaf.form_id
                and vaf.activity_id = vp.va_id
                and if(vp.action_exit = 'agree', vaf.type = 1, vaf.type = 0)
            left join process_instance_values piv3 on piv3.instance_id = vp.id 
                and piv3.field_id = vaf.field_id 
                and vaf.is_sub = 0
                and if(vp.is_sub = 1 and exists(select pis3.id from process_instance_sub_values pis3 
                    where pis3.instance_id = vp.id
                ), false, true)
            left join process_instance_sub_values pis2 on pis2.instance_id = vp.id 
                and pis2.field_id = vaf.field_id 
                and vaf.is_sub = 1
                and vp.index = pis2.index

            where vp.tag = '${tag}' 
                and (((vp.operator_name = ? or vp.v1 = ? ????) and piv3.id is not null) 
                    or (vp.v2 = ? and pis2.id is not null ?????)) 
                and vp.operate_time >= '${startDate}' 
                and vp.operate_time <= '${endDate}'

            group by vp.id, vp.field_id, vp.form_id, vp.action_exit, vp.show_name, 
                piv3.field_id, piv3.value, pis2.field_id, pis2.value, vp.type
        ) a left join vision_field_type vft on vft.form_id = a.form_id 
            left join form_field_data ffd on ffd.id = vft.ffd_id 
            where a.type like concat('%', ffd.value, '%')
        group by a.action_exit`
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
            tmp = tmp.replace('???', 'or operator_name = ? or v1 = ? or v2 = ?')
            tmp1 = tmp1.replace('????', 'or vp.operator_name = ? or vp.v1 = ?')
                .replace('?????', 'or vp.v2 = ? and pis2.id is not null')
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

const getStat = async function (startDate, endDate) {
    let result = []
    for (let i = 0; i < statItem1.length; i++) {
        let info = JSON.parse(JSON.stringify(statItem))
        info.actionName = statItem1[i].name
        info.actionCode = statItem1[i].code
        for (let j = 0; j < statItem2.length; j++) {
            let child = JSON.parse(JSON.stringify(statItem))
            child.actionName = statItem2[j].name
            for (let k = 0; k < statItem3.length; k++) {
                let chil = JSON.parse(JSON.stringify(statItem))
                chil.actionName = statItem3[k].name
                chil.actionCode = statItem3[k].code
                for (let h = 0; h < statItem4.length; h++) {
                    let chi = JSON.parse(JSON.stringify(statItem))
                    chi.actionName = statItem4[h].name
                    chi.actionCode = statItem4[h].code
                    chil.children.push(chi)
                }
                child.children.push(chil)
            }
            info.children.push(child)
        }
        result.push(info)
    }

    let info = JSON.parse(JSON.stringify(statItem))
    info.actionCode = totalCode
    info.actionName = totalName
    for (let i = 0; i < totalStat.length; i++) {
        let child = JSON.parse(JSON.stringify(statItem))
        for (let j = 0; j < statItem4.length; j++) {
            let chil = JSON.parse(JSON.stringify(statItem))
            for (let k = 0; k < statItem2.length; k++) {
                let chi = JSON.parse(JSON.stringify(statItem))
                chi.actionName = statItem2[k].name
                chil.children.push(chi)
            }
            chil.actionName = statItem4[j].name
            chil.actionCode = statItem4[j].code
            child.children.push(chil)
        }
        child.actionName = totalStat[i].name
        info.children.push(child)
    }
    result.push(info)

    for (let i = 0; i < statItem2.length; i++) {
        let child = JSON.parse(JSON.stringify(statItem))
        for (let j = 0; j < totalStat.length; j++) {
            let chil = JSON.parse(JSON.stringify(statItem))
            for (let k = 0; k < statItem4.length; k++) {
                let chi = JSON.parse(JSON.stringify(statItem))
                chi.actionName = statItem4[k].name
                chi.actionCode = statItem4[k].code
                chil.children.push(chi)
            }
            chil.actionName = totalStat[j].name
            child.children.push(chil)
        }
        child.actionName = statItem2[i].name
        result.push(child)
    }

    let sql =  `select count(1) as count, 0 as id, vision_type, type from vision_nodes
            where tag = 'total' and operate_time >= '${startDate}'
                and operate_time <= '${endDate}'
                and if(v1 is null, v2, v1) like concat('%', v3, '%')
            group by type, vision_type
        
        union all 

        select count(1) as count, 2 as id, vision_type, type from vision_nodes vn
            where tag = 'inside' and operate_time >= '${startDate}'
                and operate_time <= '${endDate}'
                and if(v1 is null, v2, v1) like concat('%', v3, '%')
                and exists (
                    select pir.id from process_instance_records pir 
                    join vision_activity va on va.form_id = vn.form_id
                        and va.activity_id = pir.activity_id
                        and va.activity_name = pir.show_name
                        and va.tag in ('insideArt', 'insidePhoto')
                    where pir.instance_id = vn.id
                )
            group by type, vision_type
        
        union all 
            
        select count(1) as count, 1 as id, vision_type, type from vision_nodes vn
            where tag = 'out' and operate_time >= '${startDate}'
                and operate_time <= '${endDate}'
                and if(v1 is null, v2, v1) like concat('%', v3, '%')
                and exists (
                    select pir.id from process_instance_records pir 
                    join vision_activity va on va.form_id = vn.form_id
                        and va.activity_id = pir.activity_id
                        and va.activity_name = pir.show_name
                        and va.tag in ('outArt', 'outPhoto')
                    where pir.instance_id = vn.id
                )
            group by type, vision_type`

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

    sql = `select id, activity_id, field_id, tag, type, value, action_exit 
        from vision_node_works where operate_time >= '${startDate}' 
            and operate_time <= '${endDate}'
            and if(v1 is null, v2, v1) like concat('%', v3, '%')
        order by id`

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
                result[3].children[totalStatType[row[i].tag][row[i].action_exit]]
                    .children[1]
                    .children[statItem2Type[row[i].type][k]]
                    .sum += value
                result[3].children[totalStatType[row[i].tag][row[i].action_exit]]
                    .children[1]
                    .sum += value
                result[3].children[totalStatType[row[i].tag][row[i].action_exit]]
                    .sum += value
            }
        }
        result[3].sum += value
        for (let j = 4; j < 8; j++) {
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
    let sql = `select f.id, f.title as flowFormName, f.form_uuid as flowFormId 
        from vision_type vt join forms f on vt.form_id = f.id where 1=1`
    if (params.tag) {
        sql = `${sql} and vt.tag = '${params.tag}'`
    }
    if (params.id) {
        sql = `${sql} and f.id = ${params.id}`
    }
    sql = `${sql} group by f.id, f.title, f.form_uuid order by f.id desc, f.title, f.form_uuid`
    let row = await query(sql)
    if (row?.length) {
        for (let i = 0; i < row.length; i++) {
            sql = `select id, parent_id, (case component when 'AssociationFormField' 
                then concat(field_id, '_id') else field_id end) as fieldId, title 
                as fieldName from form_fields where form_id = ?`
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
    let presql = `select count(1) as count from (`
    let subsql = `select id, processInstanceId, title, instanceStatus, createTime, operateTime 
        from vision_process where form_id = ?`
    p1.push(parseInt(params.id))
    if (params.tag) subsql = `${subsql} and tag = "${params.tag}"`
    if (params.visionTag) {
        subsql = `${subsql} and tag = '${params.visionTag}'`
    }
    if (params.operator) {
        if (!nameFilter.hasOwnProperty(params.operator)) {
            subsql = `${subsql} and (operator_name = ? or v1 = ? or v2 = ?)`
            p1.push(params.operator, params.operator, params.operator)
        } else {
            subsql = `${subsql} and (operator_name = ? or v1 = ? or v2 = ? 
                or operator_name = ? or v1 = ? or v2 = ?)`
            p1.push(params.operator, params.operator, params.operator, 
                nameFilter[params.operator], nameFilter[params.operator], nameFilter[params.operator]
            )
        }
    }
    if (params.startDate) {
        subsql = `${subsql} and operate_time >= ?`
        p1.push(moment(params.startDate).format('YYYY-MM-DD') + ' 00:00:00')
    }
    if (params.endDate) {
        subsql = `${subsql} and operate_time <= ?`
        p1.push(moment(params.endDate).format('YYYY-MM-DD') + ' 23:59:59')
    }
    if (params.action) {
        subsql = `${subsql} and action_exit in (${actionFilter[params.action].map(() => '?').join(',')})`
        p1.push(...actionFilter[params.action])
    }
    if (params.fullAction) {
        subsql = `${subsql} and vn_type = ${fullActionFilter[params.fullAction]}`
    }
    if (params.type) {
        if (typeFilter[params.type]) {
            subsql = `${subsql} and vision_type in (${typeFilter[params.type].map(() => '?').join(',')})
                and type like concat('%', value, '%')`
            p1.push(...typeFilter[params.type])
        }
    }
    subsql = `${subsql}
            group by id, processInstanceId, title, \`status\`, createTime, operateTime`
    let search = `${presql}${subsql}) a`
    let row = await query(search, p1)
    if (row?.length && row[0].count) {
        result.total = row[0].count
        if (limit) {
            search = `select * from (${subsql}) a limit ${offset}, ${limit}`
        } else {
            search = `select * from (${subsql}) a`
        }
        row = await query(search, p1)
        if (row?.length) {
            for (let i = 0; i < row.length; i++) {
                search = `select field_id as fieldId, \`value\` as fieldValue from 
                    process_instance_values where instance_id = ?`
                row[i]['data'] = await query(search, [row[i].id]) || []
                search = `select show_name, operator_name from process_instance_records 
                    where instance_id = ? order by 
                    if(action_exit is null, 2, if(action_exit in ('next', 'doing'), 0, 1)), 
                    operate_time desc, id desc limit 1`
                let row1 = await query(search, [row[i].id])
                if (row1?.length) {
                    row[i]['action'] = row1[0].show_name
                    row[i]['operator'] = row1[0].operator_name
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
    let presql = `select count(1) as count from (`
    let subsql = `select pi.id,
            pi.instance_id as processInstanceId,
            pi.title,
            pi.status as instanceStatus,
            pi.create_time as createTime,
            pi.update_time as operateTime
        from processes p
        join vision_leader vl on p.form_id = vl.form_id
        join vision_type vt on vl.form_id = vt.form_id
            and vt.tag = 'visionLeader'
        left join vision_leader_field vlf on vlf.tag = vt.tag
            and vlf.form_id = vl.form_id
        join process_instances pi on pi.process_id = p.id
            and pi.status in ('COMPLETED', 'RUNNING')
        left join process_instance_values piv on piv.instance_id = pi.id
            and piv.field_id = vlf.field_id
        left join process_instance_values piv1 on piv1.instance_id = pi.id
            and piv1.field_id = vt.field_id
            and vt.type = 0
        left join process_receipt pr on pr.process_id = pi.id
        left join receipt_instance_values riv on riv.instance_id = pr.receipt_id
            and riv.field_id = vt.field_id
            and vt.type = 1
        join process_instance_records pir on pir.instance_id = pi.id
            and pir.show_name = vl.activity_name
            and pir.activity_id = vl.activity_id
            and pir.action_exit = vl.action_exit
            and pir.id in (
                select max(p2.id) from process_instance_records p2
                where p2.instance_id = pi.id
                group by p2.instance_id, p2.show_name, p2.activity_id
            )
        where vl.form_id = ?`
    p1.push(parseInt(params.id))
    if (params.startDate) {
        subsql = `${subsql} and pir.operate_time >= ?`
        p1.push(moment(params.startDate).format('YYYY-MM-DD') + ' 00:00:00')
    }
    if (params.endDate) {
        subsql = `${subsql} and pir.operate_time <= ?`
        p1.push(moment(params.endDate).format('YYYY-MM-DD') + ' 23:59:59')
    }
    if (params.action) {
        subsql = `${subsql} and vl.type = ?`
        p1.push(fullActionFilter[params.action])
    }
    if (params.fieldType) {
        if (params.type != undefined) {
            subsql = `${subsql} and exists(
                    select vft.id from vision_field_type vft 
                    join form_field_data ffd on ffd.id = vft.ffd_id
                    where vl.form_id = vft.form_id 
                        and if(piv1.value is null, riv.value, piv1.value) like concat('"', ffd.value, '"')
                        and vft.type in (${typeFilter[params.fieldType].map(() => '?')})
                )`
            p1.push(...typeFilter[params.fieldType])
        } else {
            subsql = `${subsql} and vlf.type = ?`
            p1.push(params.fieldType)
        }
    }
    if (params.leaderType) {
        subsql = `${subsql} and vl.vision_type = ?`
        p1.push(params.leaderType)
    }
    subsql = `${subsql}
        group by pi.id, pi.instance_id, pi.status, pi.title,  pi.create_time, pi.update_time`
    let search = `${presql}${subsql}) a`
    let row = await query(search, p1)
    if (row?.length && row[0].count) {
        result.total = row[0].count
        if (limit) {
            search = `select * from (${subsql}) a limit ${offset}, ${limit}`
        } else {
            search = `select * from (${subsql}) a`
        }
        row = await query(search, p1)
        if (row?.length) {
            for (let i = 0; i < row.length; i++) {
                search = `select field_id as fieldId, \`value\` as fieldValue from 
                    process_instance_values where instance_id = ?`
                row[i]['data'] = await query(search, [row[i].id]) || []
                search = `select show_name, operator_name from process_instance_records 
                    where instance_id = ? order by 
                    if(action_exit is null, 2, if(action_exit in ('next', 'doing'), 0, 1)), 
                    operate_time desc, id desc limit 1`
                let row1 = await query(search, [row[i].id])
                if (row1?.length) {
                    row[i]['action'] = row1[0].show_name
                    row[i]['operator'] = row1[0].operator_name
                }
            }
            result.data = row
        }
    }
    return result
}

const getFlowActions = async function (id) {
    let sql = `select * from process_instance_records where instance_id = ? order by 
        if(action_exit is null, 2, if(action_exit in ('next', 'doing'), 1, 0)), operate_time, id`
    let row = await query(sql, [id])
    let result = [], j = 0, ids = {}
    for (let i = 0; i < row.length; i++) {
        let info = JSON.parse(JSON.stringify(row[i]))
        info.children = []
        if (row[i].parent_id == 0) {
            result.push(info)
            ids[row[i].id] = {
                offset: j,
                root: 0
            }
            j = j + 1
        } else {
            result[ids[row[i].parent_id].offset].children.push(info)
            ids[row[i].id] = {
                offset: result[ids[row[i].parent_id].offset].children.length,
                root: row[i].parent_id
            }
        }
    }
    return result
}

const getLeaderStat = async function (tag, start, end) {
    let result = []
    for (let i = 0; i < statLeaderItem.length; i++) {
        let info = JSON.parse(JSON.stringify(statItem))
        info.actionName = statLeaderItem[i].name
        info.actionCode = statLeaderItem[i].code
        for (let j = 0; j < statLeaderItem[i].child.length; j++) {
            let child = JSON.parse(JSON.stringify(statItem))
            child.actionName = statItem3[statLeaderItem[i].child[j]].name
            child.actionCode = statItem3[statLeaderItem[i].child[j]].code
            let child_key = statLeaderItem[i].child[j]
            for (let k = 0; k < statLeaderItem[i].childItem[child_key]?.length; k++) {
                let field_key = statLeaderItem[i].childItem[child_key][k]
                if (leaderItemField[field_key].display == 0) {
                    let childInfo = await getVisionField(start, end, tag, child_key, i, field_key)
                    for (let h = 0; h < childInfo.length; h++) {
                        let cItem = JSON.parse(JSON.stringify(statItem))
                        cItem.actionName = childInfo[h].value
                        cItem.type = field_key
                        cItem.sum = childInfo[h].count
                        child.children.push(cItem)
                    }
                } else if (leaderItemField[field_key].display == 2) {
                    let childInfo = await getVisionField(start, end, tag, child_key, i, field_key)
                    let cItem = JSON.parse(JSON.stringify(statItem))
                    cItem.actionName = leaderItemField[field_key].name                    
                    cItem.type = field_key
                    for (let h = 0; h < childInfo.length; h++) {
                        if (leaderItemField[field_key].map == 'like') {
                            if (childInfo[h].value.indexOf(leaderItemField[field_key].data) == -1)
                                cItem.sum += childInfo[h].count
                        } else {
                            if (childInfo[h].value == leaderItemField[field_key].data)
                                cItem.sum += childInfo[h].count
                        }
                    }
                    child.children.push(cItem)
                } else {
                    let childInfo = await getVisionType(start, end, tag, child_key, i)
                    let cInfo = []
                    for (let h = 0; h < leaderItemField[field_key].data.length; h++) {
                        let cItem = JSON.parse(JSON.stringify(statItem))
                        cItem.actionName = leaderItemField[field_key].data[h]                        
                        cItem.type = field_key
                        cItem.field_type = h
                        cInfo.push(cItem)
                    }
                    for (let h = 0; h < childInfo.length; h++) {
                        for (let l = 0; l < leaderItemField[field_key].map[childInfo[h].vision_type].length; l++) {
                            let iInfo = leaderItemField[field_key].map[childInfo[h].vision_type][l]
                            cInfo[iInfo].sum += childInfo[h].count
                        }
                    }
                    child.children.push(...cInfo)
                }
            }            
            info.children.push(child)
        }
        result.push(info)
    }

    let sql = `select count(1) as count, type, leader_type from 
        (select type, leader_type from vision_leaders
            where if(type = 2 or leader_type > 0, if(v1 is null, v2, v1) like concat('%', v3, '%'), 1=1)
                and operate_time >= ? 
                and operate_time <= ?
                and tag = 'visionLeader'
            group by id, type, leader_type
        ) a group by type, leader_type`
    let row = await query(sql, [start, end])
    for (let i = 0; i < row.length; i++) {
        let child_key = statLeaderItem[row[i].leader_type].childMap[row[i].type]
        result[row[i].leader_type].children[child_key].sum += row[i].count
        result[row[i].leader_type].sum += row[i].count
    }

    return result
}

const getVisionType = async function (start, end, tag, type, leader_type) {
    let sql = `select count(1) as count, vision_type from vision_leaders
        where if(v1 is null, v2, v1) like concat('%', v3, '%')
            and tag = ? 
            and type = ? 
            and leader_type = ?
            and operate_time >= ? 
            and operate_time <= ?
        group by vision_type`
    let row = await query(sql, [tag, type, leader_type, start, end])
    return row || []
}

const getVisionField = async function (start, end, tag, type, leader_type, field_type) {
    let sql = `select replace(a.value, '"', '') as value, count(1) as count from (
        select vl.id, piv.value from vision_leaders vl
        join vision_leader_field vlf on vl.form_id = vlf.form_id
            and vl.tag = vlf.tag
        join process_instance_values piv on piv.instance_id = vl.id
            and piv.field_id = vlf.field_id
        where vl.tag = ? 
            and vl.type = ?
            and vl.leader_type = ?`
    let params = [tag, type, leader_type]
    if (field_type != null) {
        sql = `${sql} and vlf.type = ?`
        params.push(field_type)
    }     
    sql = `${sql} and vl.operate_time >= ? 
                and vl.operate_time <= ? 
            group by pi.id, piv.value
        ) a group by a.value`
    params.push(start, end)
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
    let sql = `select ff.id, ff.field_id, ff.title from vision_leader vl
        join vision_pannel vp on vp.form_id = vl.form_id
            and vl.vision_type = vp.type
        join form_fields ff on ff.form_id = vp.form_id
            and vp.field_id = ff.field_id
        where vl.vision_type = ${type}
        group by ff.id, ff.field_id, ff.title order by ff.id`
    let row = await query(sql)
    if (row?.length) result.columns = result.columns.concat(row)
    sql = `select pi.instance_id, pi.title, ff.field_id, pi.id, 
        (case vl.type when 0 then '待转入' else '进行中' end) as type, 
        replace(piv.value, '"', '') as value from vision_leader vl
        join processes p on p.form_id = vl.form_id
        left join process_instances pi on pi.process_id = p.id
            and pi.status in ('COMPLETED', 'RUNNING')
        join vision_pannel vp on vp.form_id = vl.form_id 
            and vp.type = vl.vision_type
		join process_instance_records pir on pir.instance_id = pi.id
			and pir.show_name = vl.activity_name 
			and pir.activity_id = vl.activity_id
			and pir.action_exit = vl.action_exit
        left join process_instance_values piv on piv.instance_id = pi.id
            and piv.field_id = vp.field_id
        join form_fields ff on ff.form_id = vl.form_id 
            and ff.field_id = vp.field_id
        where vl.type in (0, 1) and vl.vision_type = ${type}
        order by pi.id, vl.type, ff.field_id`
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

module.exports = {
    getProcessStat,
    getFlowInstances,
    getFlowProcessInstances,
    getVisionProcessInstances,
    getFlowActions,
    getStat,
    getLeaderStat,
    getVisionInfo
}