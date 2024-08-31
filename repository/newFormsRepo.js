const { query } = require('../model/newDbConn')
const {
    item,
    action,
    actionItem,
    actionItem2,
    deptAction,
    deptField,
    deptPreField,
    actionFilter,
    artField
} = require('../const/newFormConst')
const moment = require('moment')

// const getProcessStats = async function (userNames, tag, key, startDate, endDate) {
//     let result = []
//     if (moment(startDate).diff('2024-06-20') > 0) {
//         let sql1 = `select ifnull(sum(if(v like '%全套%' or v like '%套图%', 1, 0)), 0) as total, 
//             ifnull(sum(if(v like '%半套%', 1, 0)), 0) as half, 
//             ifnull(sum(if(v like '%散图%' or v like '%部分%', 1, 0)), 0) as little, 
//             ifnull(sum(if(v like '%视频%', 1, 0)), 0) as video 
//             from (select fiv.value as v from (`
//         let sql2 = `select ifnull(sum(v), 0) as total from (select 
//             convert(trim(both '"' from fiv.value), float) as v from (`
//         let sql = `select b.* from process_instance_records as b join (
//             select operator, instance_id, activity_id 
//             from process_instance_records 
//             where operator_name = ? 
//             and action_exit in `
//         let subsql = ` and operate_type != 'NEW_PROCESS'
//                     group by operator, instance_id, activity_id) as a
//                 on a.instance_id = b.instance_id 
//                 and a.activity_id = b.activity_id 
//                 and a.operator = b.operator
//                 where b.operate_type = 'EXECUTE_TASK_NORMAL'
//                 order by b.id desc) as pir
//             join process_instances pi on pir.instance_id = pi.id
//             join processes p on p.id = pi.process_id
//             join form_instances fi on fi.instance_id = pi.instance_id
//             left join form_instance_values fiv on fi.id = fiv.instance_id
//             left join form_fields fd on fd.field_id = fiv.field_id and fd.form_id = fi.form_id
//             where pi.status in ('RUNNING', 'COMPLETED') and pir.show_name in `
//         let subsql1 = ` and fd.title in ('视觉性质（可多选）', '视觉性质', '拍摄需求', '视觉类别', '视觉属性', '任务属性') 
//             and fiv.value != ''
//             and fi.create_time > '2024-06-20'
//             and pir.operate_time >= ? 
//             and pir.operate_time <= ?) bb`
//         let subsql2 = ` and fd.title like '%数量%' and fd.title like '%${key}%' 
//             and fd.title not like '%预计%'
//             and fd.title not in (
//             '实际3D场景建模数量',
//             '实际3D产品建模数量',
//             '实际简单3D场景数量',
//             '实际复杂3D场景数量',
//             '实际简单3D产品数量',
//             '实际复杂3D产品数量',
//             '实际简单3D场景渲染数量',
//             '实际复杂3D场景渲染数量',
//             '实际简单3D产品渲染数量',
//             '实际复杂3D产品渲染数量',
//             '美编链图云上传数量',
//             '拍摄链图云上传数量',
//             '上传链图云数量'
//             )
//             and fiv.value != ''
//             and fi.create_time > '2024-06-20'
//             and pir.operate_time >= ? 
//             and pir.operate_time <= ?) bb`
//         let params = [], row = null, row1 = null, select = ''
//         for (let i = 0; i < userNames.length; i++) {
//             let user = JSON.parse(JSON.stringify(item)), userItem = JSON.parse(JSON.stringify(actionItem))
//             user.actionName = userNames[i]
//             userItem.actionName = '待转入'
//             user.children.push(JSON.parse(JSON.stringify(userItem)))
//             userItem.actionName = '进行中'
//             user.children.push(JSON.parse(JSON.stringify(userItem)))
//             userItem.actionName = '已完成'
//             user.children.push(JSON.parse(JSON.stringify(userItem)))
//             user.children.push(JSON.parse(JSON.stringify(actionItem2)))
//             let sumCount = [0, 0, 0]
//             for (let ii = 0; ii < action.length; ii++) {
//                 let actions = `(${action[ii].map(() => '?')})`
//                 let acts = `(${activities[tag].map(() => '?')})`
//                 let total = 0
//                 params = [userNames[i], ...action[ii], ...activities[tag], startDate, endDate]
//                 select = `${sql1}${sql}${actions}${subsql}${acts}${subsql1}`
//                 row = await query(select, params)
//                 if (row?.length) {
//                     user.children[ii].children[1].children[0].sum += parseInt(row[0].total)
//                     user.children[ii].children[1].children[1].sum += parseInt(row[0].half)
//                     user.children[ii].children[1].children[2].sum += parseInt(row[0].little)
//                     user.children[ii].children[1].children[3].sum += parseInt(row[0].video)
//                     total = parseInt(row[0].total) + parseInt(row[0].half) + parseInt(row[0].little) + parseInt(row[0].video)
//                     user.children[ii].children[1].sum += total
//                     user.children[ii].sum += total
//                     user.sum += total
//                     console.log(user)
//                 }
//                 select = `${sql2}${sql}${actions}${subsql}${acts}${subsql2}`
//                 row1 = await query(select, params)
//                 if (row1?.length) {
//                     sumCount[ii] += row1[0].total
//                 }
//             }
//             user.children[3].children[0].sum +=  sumCount[0] + sumCount[1]
//             user.children[3].children[1].sum += sumCount[2]
//             user.children[3].sum += sumCount[0] + sumCount[1] + sumCount[2]
//             result.push(JSON.parse(JSON.stringify(user)))
//             item.children = []
//         }
//     } else {
//         for (let i = 0; i < userNames.length; i++) {
//             let user = {...item}, userItem = {...actionItem}
//             user.actionName = userNames[i]
//             userItem.actionName = '待转入'
//             user.children.push({...userItem})
//             userItem.actionName = '进行中'
//             user.children.push({...userItem})
//             userItem.actionName = '已完成'
//             user.children.push({...userItem})
//             user.children.push({...actionItem2})
//             result.push(user)
//         }
//     }
    
//     return result
// }

const getProcessStat = async function (userNames, tag, startDate, endDate) {
    let result = [], realAction, realField, search, search1, params = []
    
    let sql1 = `select ifnull(sum(piv.value), 0) as total, 
        if(ifnull(sum(piv.value), 0) >= 20, 1, 0) as full,
        if(ifnull(sum(piv.value), 0) >= 10 and ifnull(sum(piv.value), 0) < 20, 1, 0) as half, 
        if(ifnull(sum(piv.value), 0) >= 1 and ifnull(sum(piv.value), 0) < 10, 1, 0) as little`
    let sql2 = `select ifnull(sum(piv.value), 0) as total`
    let sql3 = `select ifnull(sum(pis.value), 0) as total, 
        if(ifnull(sum(pis.value), 0) >= 20, 1, 0) as full,
        if(ifnull(sum(pis.value), 0) >= 10 and ifnull(sum(pis.value), 0) < 20, 1, 0) as half, 
        if(ifnull(sum(pis.value), 0) >= 1 and ifnull(sum(pis.value), 0) < 10, 1, 0) as little`
    let sql = ` from process_instance_records pir
        join process_instances pi on pir.instance_id = pi.id
        join processes p on p.id = pi.process_id
        left join process_instance_values piv on piv.instance_id = pi.id`
    let subsql = ` where p.form_id = 119 and pir.show_name in ` 
    let subsql1 = ` and pir.action_exit = ? and piv.field_id in `
    let subsql2 = ` and pir.action_exit = ? and pis.field_id in `
    let finalsql = ` and pir.operate_time >= '${startDate}' 
        and pir.operate_time <= '${endDate}' 
        and pir.operator_name = ? group by pi.id`
    let finalsql1 = ` and pir.operate_time >= '${startDate}' 
        and pir.operate_time <= '${endDate}' 
        and pis2.value = ? group by pi.id`
    let searchsql = `select ifnull(sum(total), 0) as total, 
        ifnull(sum(full), 0) as full, 
        ifnull(sum(half), 0) as half, 
        ifnull(sum(little), 0) as little`

    if (tag == 'insideArt') {
        realAction = {
            normal: deptAction[tag].normal.join('","'),
            airetouch: deptAction[tag].airetouch.join('","'),
            video: deptAction[tag].video.join('","'),
            render: deptAction[tag].render.join('","')
        }
        realField = {
            normal: deptField[tag].normal.join('","'),
            airetouch: deptField[tag].airetouch.join('","'),
            video: deptField[tag].video.join('","'),
            render: deptField[tag].render.join('","'),
            subretouch: artField.field.join('","')
        }
        search = `${searchsql}, 0 as type from (
                ${sql1}${sql}${subsql}("${realAction.normal}")${subsql1}("${realField.normal}")${finalsql}
                union all
                ${sql1}${sql}${subsql}("${realAction.airetouch}")${subsql1}("${realField.airetouch}")${finalsql}
                union all
                ${sql1}${sql}${subsql}("${realAction.render}")${subsql1}("${realField.render}")${finalsql}) a
            union all
            ${searchsql}, 1 as type from (
                ${sql1}${sql}${subsql}("${realAction.normal}")${subsql1}("${realField.normal}")${finalsql}
                union all
                ${sql1}${sql}${subsql}("${realAction.airetouch}")${subsql1}("${realField.airetouch}")${finalsql}
                union all
                ${sql1}${sql}${subsql}("${realAction.render}")${subsql1}("${realField.render}")${finalsql}) b
            union all
            ${searchsql}, 2 as type from (
                ${sql1}${sql}
                left join process_instance_values piv2 on piv2.instance_id = pi.id
                ${subsql}("${realAction.normal}")${subsql1}("${realField.normal}")
                and piv2.field_id = '${artField.judge.key}' and piv2.value = '${artField.judge.neq}'
                ${finalsql}
                union all
                ${sql1}${sql}${subsql}("${realAction.airetouch}")${subsql1}("${realField.airetouch}")${finalsql}
                union all
                ${sql1}${sql}${subsql}("${realAction.render}")${subsql1}("${realField.render}")${finalsql}
                union all
                ${sql3}${sql}
                left join process_instance_sub_values pis on pis.instance_id = pi.id
                left join process_instance_sub_values pis2 on pis2.instance_id = pi.id 
                and pis2.index = pis.index
                ${subsql}("${realAction.normal}")${subsql2}("${realField.subretouch}")
                and piv.field_id = '${artField.judge.key}' and piv.value = '${artField.judge.eq}'
                ${finalsql1}) c`
    } else {
        realAction = deptAction[tag].join('","')
        realField = {
            normal: deptField[tag].normal.join('","'),
            video: deptField[tag].video.join('","')
        }
        search = `${searchsql}, 0 as type from (
                ${sql1}${sql}${subsql}("${realAction}")${subsql1}("${realField.normal}")${finalsql}) a
            union all
            ${searchsql}, 1 as type from (
                ${sql1}${sql}${subsql}("${realAction}")${subsql1}("${realField.normal}")${finalsql}) b
            union all
            ${searchsql}, 2 as type from (
                ${sql1}${sql}${subsql}("${realAction}")${subsql1}("${realField.normal}")${finalsql}) c`
    }
    search1 = `${sql2}, 0 as type${sql}${subsql}("${realAction}")${subsql1}("${realField.video}")${finalsql}
            union all
                ${sql2}, 1 as type${sql}${subsql}("${realAction}")${subsql1}("${realField.video}")${finalsql}
            union all
                ${sql2}, 2 as type${sql}${subsql}("${realAction}")${subsql1}("${realField.video}")${finalsql}`
    for (let i = 0; i < userNames.length; i++) {
        let user = JSON.parse(JSON.stringify(item)), userItem = JSON.parse(JSON.stringify(actionItem))
        user.actionName = userNames[i]
        userItem.actionName = action.next.value
        user.children.push(JSON.parse(JSON.stringify(userItem)))
        userItem.actionName = action.doing.value
        user.children.push(JSON.parse(JSON.stringify(userItem)))
        userItem.actionName = action.complete.value
        user.children.push(JSON.parse(JSON.stringify(userItem)))
        user.children.push(JSON.parse(JSON.stringify(actionItem2)))
        params = [
            action.next.key, 
            userNames[i], 
            action.doing.key, 
            userNames[i], 
            action.complete.key, 
            userNames[i]
        ]
        if (tag == 'insideArt') {
            params = [
                action.next.key, 
                userNames[i], 
                action.next.key, 
                userNames[i], 
                action.next.key, 
                userNames[i], 
                action.doing.key, 
                userNames[i], 
                action.doing.key, 
                userNames[i], 
                action.doing.key, 
                userNames[i], 
                action.complete.key, 
                userNames[i],
                action.complete.key, 
                userNames[i],
                action.complete.key, 
                userNames[i], 
                action.complete.key, 
                userNames[i]
            ]
        }

        let row = await query(search, params)
        if (row?.length) {
            for (let j = 0; j < row.length; j++) {
                user.children[row[j].type].children[1].children[0].sum += parseInt(row[j].full)
                user.children[row[j].type].children[1].children[1].sum += parseInt(row[j].half)
                user.children[row[j].type].children[1].children[2].sum += parseInt(row[j].little)
                let total = parseInt(row[j].full) + parseInt(row[j].half) + parseInt(row[j].little)
                user.children[row[j].type].children[1].sum += total
                user.children[row[j].type].sum += total
                user.children[3].children[row[j].type > 1 ? 1 : 0].sum += parseInt(row[j].total)
                user.children[3].sum += parseInt(row[j].total)
            }
        }

        params = [
            action.next.key, 
            userNames[i], 
            action.doing.key, 
            userNames[i], 
            action.complete.key, 
            userNames[i]
        ]
        row = await query(search1, params)
        if (row?.length) {
            for (let j = 0; j < row.length; j++) {
                user.children[row[j].type].children[1].children[3].sum += parseInt(row[j].total)
                user.children[row[j].type].children[1].sum += parseInt(row[j].total)
                user.children[row[j].type].sum += parseInt(row[j].total)
                user.children[3].children[row[j].type > 1 ? 1 : 0].sum += parseInt(row[j].total)
                user.children[3].sum += parseInt(row[j].total)
            }
        }

        result.push(user)
    }

    return result
}

const getFlowInstances = async function (params) {
    let result = []
    //暂时只查询3d+拍摄+美编
    let sql = `select id, title as flowFormName, form_uuid as flowFormId 
        from forms where id = 119`
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
    let subsql = '', p1 = [], result = {
        data: [],
        total: 0
    }
    let sql = `select count(1) as count from process_instances pi join 
        processes p on p.id = pi.process_id where p.form_id = ?`
    p1.push(params.id)
    if (params.operator) {
        if (params.tag == 'insideArt') { 
            subsql = `${subsql} and exists(
                select pir.id from process_instance_records pir
                left join process_instance_sub_values pis on pis.instance_id = pi.id
                where pi.id = pir.instance_id and 
                (pir.operator_name = ? or pis.value = ?)
                and pir.show_name in 
                ("${deptAction[params.tag].normal.join('","')}", 
                "${deptAction[params.tag].airetouch.join('","')}", 
                "${deptAction[params.tag].video.join('","')}", 
                "${deptAction[params.tag].render.join('","')}")`
            p1.push(params.operator)
        } else {
            subsql = `${subsql} and exists(
                select pir.id from process_instance_records pir where 
                pi.id = pir.instance_id and pir.operator_name = ? and pir.show_name in 
                ("${deptAction[params.tag].join('","')}")`
        }
        
        p1.push(params.operator)
        if (params.startDate) {
            subsql = `${subsql} and pir.operate_time >= ?`
            p1.push(moment(params.startDate).format('YYYY-MM-DD') + ' 00:00:00')
        }
        if (params.endDate) {
            subsql = `${subsql} and pir.operate_time <= ?`
            p1.push(moment(params.endDate).format('YYYY-MM-DD') + ' 23:59:59')
        }
        if (params.action) {
            subsql = `${subsql} and pir.action_exit in 
            (${actionFilter[params.action].map(() => '?').join(',')})`
            p1.push(...actionFilter[params.action])
        }
        subsql = `${subsql})`
    }
    sql = `${sql}${subsql}`
    let row = await query(sql, p1)
    if (row?.length && row[0].count) {
        result.total = row[0].count
        sql = `select pi.id, pi.instance_id as processInstanceId, pi.title, 
            pi.status as instanceStatus, pi.create_time as createTime, 
            pi.update_time as operateTime from process_instances pi join 
            processes p on p.id = pi.process_id where p.form_id = ? ${subsql}
            limit ${offset}, ${limit}`
        row = await query(sql, p1)
        if (row?.length) {
            for (let i = 0; i < row.length; i++) {
                sql = `select field_id as fieldId, \`value\` as fieldValue from 
                    process_instance_values where instance_id = ?`
                row[i]['data'] = await query(sql, [row[i].id]) || []
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
    getFlowActions
}