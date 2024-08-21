const { query } = require('../model/newDbConn')
const {
    item,
    action,
    actionItem,
    actionItem2,
    deptAction,
    deptField,
    deptPreField
} = require('../const/newFormConst')

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
    let result = []
    let sql1 = `select ifnull(sum(fiv.value), 0) as total, 
        ifnull(sum(if(fiv.value >= 20, 1, 0)), 0) as full,
        ifnull(sum(if(fiv.value >= 10 and fiv.value < 20, 1, 0)), 0) as half, 
        ifnull(sum(if(fiv.value >= 1 and fiv.value < 10, 1, 0)), 0) as little`
    let sql2 = `select ifnull(sum(fiv.value), 0) as total`
    let sql = ` from process_instance_records pir
        join process_instances pi on pir.instance_id = pi.id
        join processes p on p.id = pi.process_id
        left join form_instances fi on fi.form_id = p.form_id
        and fi.instance_id = pi.instance_id
        left join form_instance_values fiv on fiv.instance_id = fi.id
        where p.form_id = 119 and pir.show_name in ` 
    let subsql = ` and pir.action_exit = ? and fiv.field_id in `
    let finalsql = ` and pir.operate_time >= '${startDate}' 
        and pir.operate_time <= '${endDate}' 
        and pir.operator_name = ?`
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
        let search = `${sql1}, 0 as type ${sql}("${deptAction[tag].join('","')}")${subsql}("${deptPreField[tag].normal.join('","')}")${finalsql}`
        let params = [action.next.key, userNames[i]]
        search = `${search} union all ${sql1}, 1 as type ${sql}("${deptAction[tag].join('","')}")${subsql}("${deptPreField[tag].normal.join('","')}")${finalsql}`
        params.push(action.doing.key, userNames[i])
        search = `${search} union all ${sql1}, 2 as type ${sql}("${deptAction[tag].join('","')}")${subsql}("${deptField[tag].normal.join('","')}")${finalsql}`
        params.push(action.complete.key, userNames[i])

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

        search = `${sql2}, 0 as type ${sql}("${deptAction[tag].join('","')}")${subsql}("${deptPreField[tag].video.join('","')}")${finalsql}`
        params = [action.next.key, userNames[i]]
        search = `${search} union all ${sql2}, 1 as type ${sql}("${deptAction[tag].join('","')}")${subsql}("${deptPreField[tag].video.join('","')}")${finalsql}`
        params.push(action.doing.key, userNames[i])
        search = `${search} union all ${sql2}, 2 as type ${sql}("${deptAction[tag].join('","')}")${subsql}("${deptField[tag].video.join('","')}")${finalsql}`
        params.push(action.complete.key, userNames[i])
        row = await query(search, params)
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

module.exports = {
    getProcessStat
}