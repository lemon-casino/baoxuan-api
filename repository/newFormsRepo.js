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
    fullActionFilter
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
            select pi.id, vt.field_id, f.id as form_id, pir.show_name, pir.action_exit, 
            if(piv.value is not null, piv.value, riv.value) as type 
            from vision_type vt
            join forms f on if(vt.type = 0, f.id = vt.form_id, f.id = vt.sub_form_id)
            join processes p on vt.form_id = p.form_id
            left join process_instances pi on pi.process_id = p.id
            left join process_receipt pr on pr.process_id = pi.id
            left join receipt_instance_values riv on pr.receipt_id = riv.instance_id and riv.field_id = vt.field_id
            left join process_instance_values piv on piv.instance_id = pi.id and piv.field_id = vt.field_id
            left join process_instance_records pir on pir.instance_id = pi.id and pir.action_exit in ('doing', 'next', 'agree')
            join vision_activity va on va.form_id = vt.form_id and va.tag = vt.tag
            and pir.activity_id = va.activity_id and pir.show_name = va.activity_name
            left join vision_out_field vof on vof.tag = vt.tag and vof.form_id = vt.form_id
            left join process_instance_values piv2 on piv2.instance_id = pi.id and piv2.field_id = vof.field_id
            left join process_instance_sub_values pis on pis.instance_id = pi.id and pis.field_id = va.sub_field
            where vt.tag = '${tag}' and pi.status in ('RUNNING', 'COMPLETED') 
            and (pir.operator_name = ? or piv2.value = ? or pis.value = ?) 
            and pir.operate_time >= '${startDate}' 
            and pir.operate_time <= '${endDate}'
            group by pi.id, vt.field_id, f.id, pir.show_name, pir.action_exit, 
            if(piv.value is not null, piv.value, riv.value)
        ) a left join vision_field_type vft 
            on vft.form_id = a.form_id 
            left join form_field_data ffd on ffd.id = vft.ffd_id 
            join form_fields ff2 on ff2.field_id = a.field_id and ffd.form_field_id = ff2.id
            where a.type like concat('%', ffd.value, '%') 
            order by a.id, case a.action_exit when 'agree' then 2 when 'doing' then 1 else 0 end`
            
    let sql1 = `select ifnull(sum(a.count), 0) as count, a.action_exit from (
            select pi.id, vt.field_id, f.id as form_id, pir.show_name, pir.action_exit, 
            cast(ifnull(if(piv3.value is null, replace(pis2.value, '"', ''), replace(piv3.value, '"', '')), 0) as signed) as count, 
            if(piv.value is not null, piv.value, riv.value) as type
            from vision_type vt
            join forms f on if(vt.type = 0, f.id = vt.form_id, f.id = vt.sub_form_id)
            join processes p on vt.form_id = p.form_id
            left join process_instances pi on pi.process_id = p.id
            left join process_receipt pr on pr.process_id = pi.id
            left join receipt_instance_values riv on pr.receipt_id = riv.instance_id and riv.field_id = vt.field_id
            left join process_instance_values piv on piv.instance_id = pi.id and piv.field_id = vt.field_id
            left join process_instance_records pir on pir.instance_id = pi.id and pir.action_exit in ('doing', 'next', 'agree')
            join vision_activity va on va.form_id = vt.form_id and va.tag = vt.tag
            and pir.activity_id = va.activity_id and pir.show_name = va.activity_name
            left join vision_out_field vof on vof.tag = vt.tag and vof.form_id = vt.form_id
            left join process_instance_values piv2 on piv2.instance_id = pi.id and piv2.field_id = vof.field_id
            left join process_instance_sub_values pis on pis.instance_id = pi.id and pis.field_id = va.sub_field

            left join vision_activity_field vaf on vt.form_id = vaf.form_id
            and vaf.activity_id = va.id
            left join process_instance_values piv3 on piv3.instance_id = pi.id and piv3.field_id = vaf.field_id and vaf.is_sub = 0
            left join process_instance_sub_values pis2 on pis2.instance_id = pi.id and pis2.field_id = vaf.field_id and vaf.is_sub = 1

            where vt.tag = '${tag}' and pi.status in ('RUNNING', 'COMPLETED') 
            and (pir.operator_name = ? or piv2.value = ? or pis.value = ?) 
            and pir.operate_time >= '${startDate}' 
            and pir.operate_time <= '${endDate}'

            group by pi.id, vt.field_id, f.id, pir.action_exit, pir.show_name, 
            piv3.field_id, piv3.value, pis2.field_id, pis2.value, 
            if(piv.value is not null, piv.value, riv.value)
        ) a left join vision_field_type vft 
            on vft.form_id = a.form_id 
            left join form_field_data ffd on ffd.id = vft.ffd_id 
            join form_fields ff2 on ff2.field_id = a.field_id and ffd.form_field_id = ff2.id
            where a.type like concat('%', ffd.value, '%')
        group by a.action_exit`
   
    for (let i = 0; i < userNames.length; i++) {
        let user = JSON.parse(JSON.stringify(item)), userItem = JSON.parse(JSON.stringify(actionItem))
        user.actionName = userNames[i]
        userItem.actionName = action.next.value
        user.children.push(JSON.parse(JSON.stringify(userItem)))
        userItem.actionName = action.doing.value
        user.children.push(JSON.parse(JSON.stringify(userItem)))
        userItem.actionName = action.agree.value
        user.children.push(JSON.parse(JSON.stringify(userItem)))
        user.children.push(JSON.parse(JSON.stringify(actionItem2)))
        params = [userNames[i], userNames[i], userNames[i]]

        let row = await query(sql, params)
        if (row?.length) {
            for (let j = 0; j < row.length; j++) {
                for (let k = 0; k < statItem2Type[row[j].type].length; k++) {
                    user.children[action[row[j].action_exit].type]
                        .children[1]
                        .children[statItem2Type[row[j].type][k]]
                        .sum += 1
                }
                
                if (j == 0 || (j > 0 && row[j - 1].id != row[j].id)) {
                    user.children[action[row[j].action_exit].type]
                        .children[1]
                        .sum += 1
                    user.children[action[row[j].action_exit].type]
                        .sum += 1
                }
            }
        }

        row = await query(sql1, params)
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

    let sql =  `select count(1) as count, 0 as id, vft.type as vision_type, a.type from (
            select pi.id, f.id as form_id, vt.field_id, vn.type, 
                if(piv.value is null, riv.value, piv.value) as vision_type 
            from vision_type vt left join vision_node vn on vt.form_id = vn.form_id
            join forms f on if(vt.type = 0, vt.form_id = f.id, vt.sub_form_id = f.id)
            join processes p on vn.form_id = p.form_id
            left join process_instances pi on p.id = pi.process_id
            join process_instance_records pir on pir.instance_id = pi.id 
                and pir.activity_id = vn.activity_id 
                and pir.show_name = vn.activity_name
                and pir.action_exit = vn.action_exit
            left join process_instance_values piv on vt.field_id = piv.field_id 
                and piv.instance_id = pi.id
            left join process_receipt pr on pr.process_id = pi.id
            left join receipt_instance_values riv on vt.field_id = riv.field_id 
                and riv.instance_id = pr.receipt_id
            where vt.tag = 'total' and pir.operate_time >= '${startDate}'
                and pir.operate_time <= '${endDate}'
                and pi.status in ('RUNNING', 'COMPLETED')
            group by pi.id, f.id, vt.field_id, vn.type, 
                if(piv.value is null, riv.value, piv.value)
        ) a left join vision_field_type vft on vft.form_id = a.form_id 
            left join form_field_data ffd on ffd.id = vft.ffd_id 
            join form_fields ff2 on ff2.field_id = a.field_id 
                and ffd.form_field_id = ff2.id
            where a.vision_type like concat('%', ffd.value, '%')
            group by vft.type, a.type
        
        union all 

        select count(1) as count, 2 as id, vft.type as vision_type, a.type from (
            select pi.id, f.id as form_id, vt.field_id, vn.type, 
                if(piv.value is null, riv.value, piv.value) as vision_type 
            from vision_type vt left join vision_node vn on vt.form_id = vn.form_id
            join forms f on if(vt.type = 0, vt.form_id = f.id, vt.sub_form_id = f.id)
            join processes p on vn.form_id = p.form_id
            left join process_instances pi on p.id = pi.process_id
            join process_instance_records pir on pir.instance_id = pi.id 
                and pir.activity_id = vn.activity_id 
                and pir.show_name = vn.activity_name
                and pir.action_exit = vn.action_exit
            left join process_instance_values piv on vt.field_id = piv.field_id 
                and piv.instance_id = pi.id
            left join process_receipt pr on pr.process_id = pi.id
            left join receipt_instance_values riv on vt.field_id = riv.field_id 
                and riv.instance_id = pr.receipt_id
            where vt.tag = 'inside' and pir.operate_time >= '${startDate}'
                and pir.operate_time <= '${endDate}'
                and pi.status in ('RUNNING', 'COMPLETED')
            group by pi.id, f.id, vt.field_id, vn.type, 
                if(piv.value is null, riv.value, piv.value)
        ) a left join vision_field_type vft on vft.form_id = a.form_id 
            left join form_field_data ffd on ffd.id = vft.ffd_id 
            join form_fields ff2 on ff2.field_id = a.field_id 
                and ffd.form_field_id = ff2.id
            where a.vision_type like concat('%', ffd.value, '%')
            group by vft.type, a.type
        
        union all 
            
        select count(1) as count, 1 as id, vft.type as vision_type, a.type from (
            select pi.id, f.id as form_id, vt.field_id, vn.type, 
                if(piv.value is null, riv.value, piv.value) as vision_type 
            from vision_type vt left join vision_node vn on vt.form_id = vn.form_id
            join forms f on if(vt.type = 0, vt.form_id = f.id, vt.sub_form_id = f.id)
            join processes p on vn.form_id = p.form_id
            left join process_instances pi on p.id = pi.process_id
            join process_instance_records pir on pir.instance_id = pi.id 
                and pir.activity_id = vn.activity_id 
                and pir.show_name = vn.activity_name
                and pir.action_exit = vn.action_exit
            left join process_instance_values piv on vt.field_id = piv.field_id 
                and piv.instance_id = pi.id
            left join process_receipt pr on pr.process_id = pi.id
            left join receipt_instance_values riv on vt.field_id = riv.field_id 
                and riv.instance_id = pr.receipt_id
            where vt.tag = 'out' and pir.operate_time >= '${startDate}'
                and pir.operate_time <= '${endDate}'
                and pi.status in ('RUNNING', 'COMPLETED')
            group by pi.id, f.id, vt.field_id, vn.type, 
                if(piv.value is null, riv.value, piv.value)
        ) a left join vision_field_type vft on vft.form_id = a.form_id 
            left join form_field_data ffd on ffd.id = vft.ffd_id 
            join form_fields ff2 on ff2.field_id = a.field_id 
                and ffd.form_field_id = ff2.id
            where a.vision_type like concat('%', ffd.value, '%')
            group by vft.type, a.type
        `

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

    sql = `select vt.tag, vft.type, piv2.value, pir.action_exit from vision_type vt
        join forms f on if(vt.type = 0, f.id = vt.form_id, f.id = vt.sub_form_id)
        join processes p on vt.form_id = p.form_id
        left join process_instances pi on pi.process_id = p.id
        
        left join process_instance_values piv on piv.instance_id = pi.id and piv.field_id = vt.field_id
        left join process_receipt pr on pr.process_id = pi.id
        left join receipt_instance_values riv on pr.receipt_id = riv.instance_id and riv.field_id = vt.field_id
        
        left join process_instance_records pir on pir.instance_id = pi.id and pir.action_exit in ('doing', 'next', 'agree')
        join vision_activity va on va.form_id = vt.form_id
            and va.tag = vt.tag
            and pir.activity_id = va.activity_id 
            and pir.show_name = va.activity_name
        left join vision_activity_field vaf on vaf.activity_id = va.id
        join process_instance_values piv2 on piv2.instance_id = pi.id and piv2.field_id = vaf.field_id
        
        left join vision_field_type vft on vft.form_id = f.id 
        left join form_field_data ffd on ffd.id = vft.ffd_id 
        join form_fields ff on ffd.form_field_id = ff.id and ff.form_id = f.id
        where pir.operate_time >= '${startDate}' 
            and pi.status in ('RUNNING', 'COMPLETED')
            and pir.operate_time <= '${endDate}'
            and if(piv.value is null, riv.value, piv.value) like concat('%', ffd.value, '%')`

    row = await query(sql)
    for (let i = 0; i < row.length; i++) {
        let value = row[i].value instanceof Number ? row[i].value : parseInt(row[i].value.replace(/"/g, ''))
        if (!value) value = 0
        
        for (let k = 0; k < statItem2Type[row[i].type].length; k++) {
            if (totalStatType[row[i].tag]) {
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
            if (totalStatType[row[i].tag] && statItem2Type[row[i].type].includes(j - 4)) {
                
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
        from vision_type vt join forms f on vt.form_id = f.id group by
        f.id, f.title, f.form_uuid`
    if (params.tag) {
        sql = `${sql} and vt.tag = '${params.tag}'`
    }
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
    let subsql = `select pi.id, pi.instance_id as processInstanceId, pi.title, 
            if(pi.status = 'COMPLETED', '已完成', '运行中') as instanceStatus, 
            pi.create_time as createTime, 
            pi.update_time as operateTime 
        from process_instances pi left join processes p on pi.process_id = p.id
        left join vision_type vt on vt.form_id = p.form_id
        join forms f on if(vt.type = 0, vt.form_id = f.id, vt.sub_form_id = f.id)
        left join process_instance_values piv on piv.field_id = vt.field_id and piv.instance_id = pi.id
        left join process_receipt pr on pr.process_id = pi.id
        left join receipt_instance_values riv on pr.receipt_id = riv.instance_id
        left join vision_field_type vft on f.id = vft.form_id
        join form_field_data ffd on ffd.id = vft.ffd_id
        left join vision_activity va on va.form_id = vt.form_id and va.tag = vt.tag
        left join vision_node vn on vn.form_id = vt.form_id
        left join process_instance_records pir on pir.instance_id = pi.id 
            and pir.action_exit in ('doing', 'next', 'agree') 
            and if(va.id is null, 
                pir.activity_id = vn.activity_id 
                    and pir.show_name = vn.activity_name 
                    and pir.action_exit = vn.action_exit, 
                pir.activity_id = va.activity_id 
                    and pir.show_name = va.activity_name) 
        left join vision_out_field vof on vof.tag = vt.tag and vof.form_id = vt.form_id
        left join process_instance_values piv2 on piv2.instance_id = pi.id 
            and piv2.field_id = vof.field_id
        left join process_instance_sub_values pis on pis.instance_id = pi.id 
            and pis.field_id = va.sub_field
        where p.form_id = ? and pi.status in ('RUNNING', 'COMPLETED')`
    p1.push(parseInt(params.id))
    if (params.tag) subsql = `${subsql} and vt.tag in ("${params.tag.join('","')}")`
    if (params.visionTag) {
        subsql = `${subsql} and vt.tag = '${params.visionTag}'`
    }
    if (params.operator) {
        subsql = `${subsql} and (pir.operator_name = ? or piv2.value = ? or pis.value = ?)`
        p1.push(params.operator, params.operator, params.operator)
    }
    if (params.startDate) {
        subsql = `${subsql} and pir.operate_time >= ?`
        p1.push(moment(params.startDate).format('YYYY-MM-DD') + ' 00:00:00')
    }
    if (params.endDate) {
        subsql = `${subsql} and pir.operate_time <= ?`
        p1.push(moment(params.endDate).format('YYYY-MM-DD') + ' 23:59:59')
    }
    if (params.action) {
        subsql = `${subsql} and pir.action_exit in (${actionFilter[params.action].map(() => '?').join(',')})`
        p1.push(...actionFilter[params.action])
    }
    if (params.fullAction) {
        subsql = `${subsql} and vn.type = ${fullActionFilter[params.fullAction]}`
    }
    if (params.type) {
        if (typeFilter[params.type]) {
            subsql = `${subsql} and vft.type in (${typeFilter[params.type].map(() => '?').join(',')})
                and if(piv.value is null, riv.value, piv.value) like concat('%', ffd.value, '%')`
            p1.push(...typeFilter[params.type])
        }
    }
    subsql = `${subsql}
            group by pi.id, pi.instance_id, pi.title, pi.status, pi.create_time, pi.update_time`
    let search = `${presql}${subsql}) a`
    let row = await query(search, p1)
    if (row?.length && row[0].count) {
        result.total = row[0].count
        search = `select * from (${subsql}) a limit ${offset}, ${limit}`
        row = await query(search, p1)
        if (row?.length) {
            for (let i = 0; i < row.length; i++) {
                search = `select field_id as fieldId, \`value\` as fieldValue from 
                    process_instance_values where instance_id = ?`
                row[i]['data'] = await query(search, [row[i].id]) || []
            }
            result.data = row
        }
    }
    return result
}

const getFlowActions = async function (id) {
    let sql = `select * from process_instance_records where instance_id = ? 
        order by operate_time, task_id desc, id`
    let row = await query(sql, [id])
    return row || []
}

module.exports = {
    getProcessStat,
    getFlowInstances,
    getFlowProcessInstances,
    getFlowActions,
    getStat
}