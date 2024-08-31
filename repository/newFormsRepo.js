const { query } = require('../model/newDbConn')
const {
    item,
    action,
    actionItem,
    actionItem2,
    deptAction,
    actionFilter,
    statItem,
    statItem1,
    statItem2,
    statItem3,
    statItem4,
    statItem5,
    totalName,
    totalCode,
    totalStat,
    totalStat1
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

    let sql = `select a.count, vft.type, a.action_exit from (
            select vt.form_id, vt.field_id, pir.action_exit, 
            if(piv.value is not null, piv.value, riv.value) as type, count(1) as count 
            from vision_type vt
            join forms f1 on if(vt.type = 0, f1.id = vt.form_id, f1.id = vt.sub_form_id)
            join processes p on vt.form_id = p.form_id
            left join process_instances pi on pi.process_id = p.id
            left join process_receipt pr on pr.process_id = pi.id
            left join receipt_instance_values riv on pr.receipt_id = riv.instance_id and riv.field_id = vt.field_id
            left join process_instance_values piv on piv.instance_id = pi.id and piv.field_id = vt.field_id
            left join process_instance_records pir on pir.instance_id = pi.id and pir.action_exit in ('doing', 'next', 'agree')
            join vision_activity va on va.form_id = vt.form_id and va.tag = vt.tag
            and pir.activity_id = va.activity_id and pir.show_name = va.activity_name
            where vt.tag = '${tag}' 
            and pir.operator_name = ? 
            and pir.operate_time >= '${startDate}' 
            and pir.operate_time <= '${endDate}'
            group by vt.form_id, vt.field_id, pir.action_exit, if(piv.value is not null, piv.value, riv.value)
        ) a left join vision_field_type vft 
            on vft.form_id = a.form_id 
            left join form_field_data ffd on ffd.id = vft.ffd_id 
            join form_fields ff2 on ff2.field_id = a.field_id and ffd.form_field_id = ff2.id
            where a.type like concat('%', ffd.value, '%')`
            
    let sql1 = `select pir.action_exit, ifnull(sum(cast(piv.value as signed)), 0) count
            from vision_type vt
            join processes p on vt.form_id = p.form_id
            left join process_instances pi on pi.process_id = p.id
            left join process_instance_records pir on pir.instance_id = pi.id and pir.action_exit in ('agree')
            join vision_activity va on va.form_id = vt.form_id and va.tag = vt.tag
            and pir.activity_id = va.activity_id and pir.show_name = va.activity_name
            left join process_instance_values piv on piv.instance_id = pi.id
            join vision_activity_field vaf on vaf.activity_id = va.id and vaf.is_sub = 0 and piv.field_id = vaf.field_id and vaf.type = 1
            where vt.tag = '${tag}' 
            and pir.operator_name = ? 
            and pir.operate_time >= '${startDate}' 
            and pir.operate_time <= '${endDate}'

            union all 

            select pir.action_exit, ifnull(sum(cast(piv.value as signed)), 0) count
            from vision_type vt
            join processes p on vt.form_id = p.form_id
            left join process_instances pi on pi.process_id = p.id
            left join process_instance_records pir on pir.instance_id = pi.id and pir.action_exit in ('doing', 'next')
            join vision_activity va on va.form_id = vt.form_id and va.tag = vt.tag
            and pir.activity_id = va.activity_id and pir.show_name = va.activity_name            
            left join process_instance_values piv on piv.instance_id = pi.id
            join vision_activity_field vaf on vaf.activity_id = va.id and vaf.is_sub = 0 and piv.field_id = vaf.field_id and vaf.type = 0
            where vt.tag = '${tag}' 
            and pir.operator_name = ? 
            and pir.operate_time >= '${startDate}' 
            and pir.operate_time <= '${endDate}'
            group by pir.action_exit`

    let sql2 = `select pir.action_exit, ifnull(sum(cast(pis2.value as signed)), 0) count
            from vision_type vt
            join processes p on vt.form_id = p.form_id
            left join process_instances pi on pi.process_id = p.id
            left join process_instance_records pir on pir.instance_id = pi.id and pir.action_exit in ('agree')
            join vision_activity va on va.form_id = vt.form_id and va.tag = vt.tag
            and pir.activity_id = va.activity_id and pir.show_name = va.activity_name
            left join process_instance_sub_values pis1 on pis1.instance_id = pi.id and pis1.field_id = va.sub_field
            left join process_instance_sub_values pis2 on pis2.instance_id = pi.id
            join vision_activity_field vaf on vaf.activity_id = va.id and vaf.is_sub = 1 and pis2.field_id = vaf.field_id and vaf.type = 1
            where vt.tag = '${tag}'
            and pis1.value = ?
            and pir.operate_time >= '${startDate}' 
            and pir.operate_time <= '${endDate}'`
   
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
        params = [userNames[i]]

        let row = await query(sql, params)
        if (row?.length) {
            for (let j = 0; j < row.length; j++) {
                switch (row[j].action_exit) {
                    case action.next.key:
                        switch (row[j].type) {
                            case '1':
                                user.children[0].children[1].children[0].sum += parseInt(row[j].count)
                                break
                            case '2':
                                user.children[0].children[1].children[1].sum += parseInt(row[j].count)
                                break
                            case '3':
                                user.children[0].children[1].children[2].sum += parseInt(row[j].count)
                                break
                            case '4':
                                user.children[0].children[1].children[3].sum += parseInt(row[j].count)
                                break
                            case '5':
                                user.children[0].children[1].children[0].sum += parseInt(row[j].count)
                                user.children[0].children[1].children[3].sum += parseInt(row[j].count)
                                break
                            default:
                        }
                        user.children[0].children[1].sum += parseInt(row[j].count)
                        user.children[0].sum += parseInt(row[j].count)
                        break
                    case action.doing.key:
                        switch (row[j].type) {
                            case '1':
                                user.children[1].children[1].children[0].sum += parseInt(row[j].count)
                                break
                            case '2':
                                user.children[1].children[1].children[1].sum += parseInt(row[j].count)
                                break
                            case '3':
                                user.children[1].children[1].children[2].sum += parseInt(row[j].count)
                                break
                            case '4':
                                user.children[1].children[1].children[3].sum += parseInt(row[j].count)
                                break
                            case '5':
                                user.children[1].children[1].children[0].sum += parseInt(row[j].count)
                                user.children[1].children[1].children[3].sum += parseInt(row[j].count)
                                break
                            default:
                        }
                        user.children[1].children[1].sum += parseInt(row[j].count)
                        user.children[1].sum += parseInt(row[j].count)
                        break
                    case action.complete.key:
                        switch (row[j].type) {
                            case '1':
                                user.children[2].children[1].children[0].sum += parseInt(row[j].count)
                                break
                            case '2':
                                user.children[2].children[1].children[1].sum += parseInt(row[j].count)
                                break
                            case '3':
                                user.children[2].children[1].children[2].sum += parseInt(row[j].count)
                                break
                            case '4':
                                user.children[2].children[1].children[3].sum += parseInt(row[j].count)
                                break
                            case '5':
                                user.children[2].children[1].children[0].sum += parseInt(row[j].count)
                                user.children[2].children[1].children[3].sum += parseInt(row[j].count)
                                break
                            default:
                        }                        
                        user.children[2].children[1].sum += parseInt(row[j].count)
                        user.children[2].sum += parseInt(row[j].count)
                        break
                    default:
                }
            }
        }

        params = [userNames[i], userNames[i]]
        if (tag == 'insideArt') {
            sql1 = `${sql1}
                union all
                ${sql2}`
            params.push(userNames[i])
        }
        row = await query(sql1, params)
        if (row?.length) {
            for (let j = 0; j < row.length; j++) {
                user.children[3].children[row[j].action_exit == action.complete.key ? 1 : 0].sum += parseInt(row[j].count)
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
                    for (let n = 0; n < statItem5.length; n++) {
                        let ch = JSON.parse(JSON.stringify(statItem))
                        ch.actionName = statItem5[n].name
                        chi.children.push(ch)
                    }
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

    let sql = `select a.count, a.tag, vft.type, a.action_exit from (
            select vt.tag, vt.form_id, vt.field_id, pir.action_exit, 
            if(piv.value is not null, piv.value, riv.value) as type, count(1) as count 
            from vision_type vt
            join forms f1 on if(vt.type = 0, f1.id = vt.form_id, f1.id = vt.sub_form_id)
            join processes p on vt.form_id = p.form_id
            left join process_instances pi on pi.process_id = p.id
            left join process_receipt pr on pr.process_id = pi.id
            left join receipt_instance_values riv on pr.receipt_id = riv.instance_id and riv.field_id = vt.field_id
            left join process_instance_values piv on piv.instance_id = pi.id and piv.field_id = vt.field_id
            left join process_instance_records pir on pir.instance_id = pi.id and pir.action_exit in ('doing', 'next', 'agree')
            join vision_activity va on va.form_id = vt.form_id and va.tag = vt.tag
            and pir.activity_id = va.activity_id and pir.show_name = va.activity_name
            and pir.operate_time >= '${startDate}' 
            and pir.operate_time <= '${endDate}'
            group by vt.form_id, vt.tag, vt.field_id, pir.action_exit, if(piv.value is not null, piv.value, riv.value)
            ) a left join vision_field_type vft 
            on vft.form_id = a.form_id 
            left join form_field_data ffd on ffd.id = vft.ffd_id 
            join form_fields ff2 on ff2.field_id = a.field_id and ffd.form_field_id = ff2.id
            where a.type like concat('%', ffd.value, '%')`
    let row = await query(sql)
    for (let i = 0; i < row.length; i++) {
        switch (row[i].type) {
            case '1':
                switch (row[i].action_exit) {
                    case 'next':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[0].children[0].children[1].children[0].sum += row[i].count
                            result[2].children[0].children[0].children[1].children[0].sum += row[i].count

                            result[2].children[0].children[0].children[1].sum += row[i].count
                            result[2].children[0].children[0].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[0].children[1].children[0].sum += row[i].count
                            result[3].children[0].children[1].sum += row[i].count
                            result[3].children[0].sum += row[i].count
                            result[3].sum += row[i].count

                            result[4].children[0].children[1].sum += row[i].count
                            result[4].children[0].sum += row[i].count
                            result[4].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[0].children[0].children[1].children[1].sum += row[i].count
                            result[2].children[0].children[0].children[1].children[1].sum += row[i].count

                            result[2].children[0].children[0].children[1].sum += row[i].count
                            result[2].children[0].children[0].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[3].children[1].children[0].sum += row[i].count
                            result[3].children[3].children[1].sum += row[i].count
                            result[3].children[3].sum += row[i].count
                            result[3].sum += row[i].count

                            result[4].children[3].children[1].sum += row[i].count
                            result[4].children[3].sum += row[i].count
                            result[4].sum += row[i].count
                        } else {
                            result[0].children[0].children[0].children[1].children[2].sum += row[i].count
                            result[1].children[0].children[0].children[1].children[2].sum += row[i].count

                            result[1].children[0].children[0].children[1].sum += row[i].count
                            result[1].children[0].children[0].sum += row[i].count
                            result[1].children[0].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[0].children[0].children[1].sum += row[i].count
                        result[0].children[0].children[0].sum += row[i].count
                        result[0].children[0].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    case 'doing':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[0].children[1].children[1].children[0].sum += row[i].count
                            result[2].children[0].children[1].children[1].children[0].sum += row[i].count

                            result[2].children[0].children[1].children[1].sum += row[i].count
                            result[2].children[0].children[1].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[1].children[1].children[0].sum += row[i].count
                            result[3].children[1].children[1].sum += row[i].count
                            result[3].children[1].sum += row[i].count
                            result[3].sum += row[i].count

                            result[4].children[1].children[1].sum += row[i].count
                            result[4].children[1].sum += row[i].count
                            result[4].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[0].children[1].children[1].children[1].sum += row[i].count
                            result[2].children[0].children[1].children[1].children[0].sum += row[i].count

                            result[2].children[0].children[1].children[1].sum += row[i].count
                            result[2].children[0].children[1].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[4].children[1].children[0].sum += row[i].count
                            result[3].children[4].children[1].sum += row[i].count
                            result[3].children[4].sum += row[i].count
                            result[3].sum += row[i].count

                            result[4].children[4].children[1].sum += row[i].count
                            result[4].children[4].sum += row[i].count
                            result[4].sum += row[i].count
                        } else {
                            result[0].children[0].children[1].children[1].children[2].sum += row[i].count
                            result[1].children[0].children[1].children[1].children[0].sum += row[i].count

                            result[1].children[0].children[1].children[1].sum += row[i].count
                            result[1].children[0].children[1].sum += row[i].count
                            result[1].children[0].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[0].children[1].children[1].sum += row[i].count
                        result[0].children[0].children[1].sum += row[i].count
                        result[0].children[0].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    case 'agree':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[0].children[2].children[1].children[0].sum += row[i].count
                            result[2].children[0].children[2].children[1].children[0].sum += row[i].count

                            result[2].children[0].children[2].children[1].sum += row[i].count
                            result[2].children[0].children[2].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[2].children[1].children[0].sum += row[i].count
                            result[3].children[2].children[1].sum += row[i].count
                            result[3].children[2].sum += row[i].count
                            result[3].sum += row[i].count

                            result[4].children[2].children[1].sum += row[i].count
                            result[4].children[2].sum += row[i].count
                            result[4].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[0].children[2].children[1].children[1].sum += row[i].count
                            result[2].children[0].children[2].children[1].children[0].sum += row[i].count

                            result[2].children[0].children[2].children[1].sum += row[i].count
                            result[2].children[0].children[2].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[5].children[1].children[0].sum += row[i].count
                            result[3].children[5].children[1].sum += row[i].count
                            result[3].children[5].sum += row[i].count
                            result[3].sum += row[i].count

                            result[4].children[5].children[1].sum += row[i].count
                            result[4].children[5].sum += row[i].count
                            result[4].sum += row[i].count
                        } else {
                            result[0].children[0].children[2].children[1].children[1].sum += row[i].count
                            result[1].children[0].children[2].children[1].children[0].sum += row[i].count

                            result[1].children[0].children[2].children[1].sum += row[i].count
                            result[1].children[0].children[2].sum += row[i].count
                            result[1].children[0].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[0].children[2].children[1].sum += row[i].count
                        result[0].children[0].children[2].sum += row[i].count
                        result[0].children[0].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    default:
                }
                break
            case '2':
                switch (row[i].action_exit) {
                    case 'next':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[1].children[0].children[1].children[0].sum += row[i].count
                            result[2].children[1].children[0].children[1].children[0].sum += row[i].count

                            result[2].children[1].children[0].children[1].sum += row[i].count
                            result[2].children[1].children[0].sum += row[i].count
                            result[2].children[1].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[0].children[1].children[1].sum += row[i].count
                            result[3].children[0].children[1].sum += row[i].count
                            result[3].children[0].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[0].children[1].sum += row[i].count
                            result[5].children[0].sum += row[i].count
                            result[5].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[1].children[0].children[1].children[1].sum += row[i].count
                            result[2].children[1].children[0].children[1].children[1].sum += row[i].count

                            result[2].children[1].children[0].children[1].sum += row[i].count
                            result[2].children[1].children[0].sum += row[i].count
                            result[2].children[1].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[3].children[1].children[1].sum += row[i].count
                            result[3].children[3].children[1].sum += row[i].count
                            result[3].children[3].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[3].children[1].sum += row[i].count
                            result[5].children[3].sum += row[i].count
                            result[5].sum += row[i].count
                        } else {
                            result[0].children[1].children[0].children[1].children[2].sum += row[i].count
                            result[1].children[1].children[0].children[1].children[2].sum += row[i].count

                            result[1].children[1].children[0].children[1].sum += row[i].count
                            result[1].children[1].children[0].sum += row[i].count
                            result[1].children[1].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[1].children[0].children[1].sum += row[i].count
                        result[0].children[1].children[0].sum += row[i].count
                        result[0].children[1].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    case 'doing':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[1].children[1].children[1].children[0].sum += row[i].count
                            result[2].children[1].children[1].children[1].children[0].sum += row[i].count

                            result[2].children[1].children[1].children[1].sum += row[i].count
                            result[2].children[1].children[1].sum += row[i].count
                            result[2].children[1].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[1].children[1].children[1].sum += row[i].count
                            result[3].children[1].children[1].sum += row[i].count
                            result[3].children[1].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[1].children[1].sum += row[i].count
                            result[5].children[1].sum += row[i].count
                            result[5].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[1].children[1].children[1].children[1].sum += row[i].count
                            result[2].children[1].children[1].children[1].children[0].sum += row[i].count

                            result[2].children[1].children[1].children[1].sum += row[i].count
                            result[2].children[1].children[1].sum += row[i].count
                            result[2].children[1].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[4].children[1].children[1].sum += row[i].count
                            result[3].children[4].children[1].sum += row[i].count
                            result[3].children[4].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[4].children[1].sum += row[i].count
                            result[5].children[4].sum += row[i].count
                            result[5].sum += row[i].count
                        } else {
                            result[0].children[1].children[1].children[1].children[2].sum += row[i].count
                            result[1].children[1].children[1].children[1].children[0].sum += row[i].count

                            result[1].children[1].children[1].children[1].sum += row[i].count
                            result[1].children[1].children[1].sum += row[i].count
                            result[1].children[1].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[1].children[1].children[1].sum += row[i].count
                        result[0].children[1].children[1].sum += row[i].count
                        result[0].children[1].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    case 'agree':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[1].children[2].children[1].children[0].sum += row[i].count
                            result[2].children[1].children[2].children[1].children[0].sum += row[i].count

                            result[2].children[1].children[2].children[1].sum += row[i].count
                            result[2].children[1].children[2].sum += row[i].count
                            result[2].children[1].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[2].children[1].children[1].sum += row[i].count
                            result[3].children[2].children[1].sum += row[i].count
                            result[3].children[2].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[2].children[1].sum += row[i].count
                            result[5].children[2].sum += row[i].count
                            result[5].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[1].children[2].children[1].children[1].sum += row[i].count
                            result[2].children[1].children[2].children[1].children[0].sum += row[i].count

                            result[2].children[1].children[2].children[1].sum += row[i].count
                            result[2].children[1].children[2].sum += row[i].count
                            result[2].children[1].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[5].children[1].children[1].sum += row[i].count
                            result[3].children[5].children[1].sum += row[i].count
                            result[3].children[5].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[5].children[1].sum += row[i].count
                            result[5].children[5].sum += row[i].count
                            result[5].sum += row[i].count
                        } else {
                            result[0].children[1].children[2].children[1].children[1].sum += row[i].count
                            result[1].children[1].children[2].children[1].children[0].sum += row[i].count

                            result[1].children[1].children[2].children[1].sum += row[i].count
                            result[1].children[1].children[2].sum += row[i].count
                            result[1].children[1].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[1].children[2].children[1].sum += row[i].count
                        result[0].children[1].children[2].sum += row[i].count
                        result[0].children[1].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    default:
                }
                break
            case '3':
                switch (row[i].action_exit) {
                    case 'next':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[2].children[0].children[1].children[0].sum += row[i].count
                            result[2].children[2].children[0].children[1].children[0].sum += row[i].count

                            result[2].children[2].children[0].children[1].sum += row[i].count
                            result[2].children[2].children[0].sum += row[i].count
                            result[2].children[2].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[0].children[1].children[2].sum += row[i].count
                            result[3].children[0].children[1].sum += row[i].count
                            result[3].children[0].sum += row[i].count
                            result[3].sum += row[i].count

                            result[6].children[0].children[1].sum += row[i].count
                            result[6].children[0].sum += row[i].count
                            result[6].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[2].children[0].children[1].children[1].sum += row[i].count
                            result[2].children[2].children[0].children[1].children[1].sum += row[i].count

                            result[2].children[2].children[0].children[1].sum += row[i].count
                            result[2].children[2].children[0].sum += row[i].count
                            result[2].children[2].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[3].children[1].children[2].sum += row[i].count
                            result[3].children[3].children[1].sum += row[i].count
                            result[3].children[3].sum += row[i].count
                            result[3].sum += row[i].count

                            result[6].children[3].children[1].sum += row[i].count
                            result[6].children[3].sum += row[i].count
                            result[6].sum += row[i].count
                        } else {
                            result[0].children[2].children[0].children[1].children[2].sum += row[i].count
                            result[1].children[2].children[0].children[1].children[2].sum += row[i].count

                            result[1].children[2].children[0].children[1].sum += row[i].count
                            result[1].children[2].children[0].sum += row[i].count
                            result[1].children[2].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[2].children[0].children[1].sum += row[i].count
                        result[0].children[2].children[0].sum += row[i].count
                        result[0].children[2].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    case 'doing':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[2].children[1].children[1].children[0].sum += row[i].count
                            result[2].children[2].children[1].children[1].children[0].sum += row[i].count

                            result[2].children[2].children[1].children[1].sum += row[i].count
                            result[2].children[2].children[1].sum += row[i].count
                            result[2].children[2].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[1].children[1].children[2].sum += row[i].count
                            result[3].children[1].children[1].sum += row[i].count
                            result[3].children[1].sum += row[i].count
                            result[3].sum += row[i].count

                            result[6].children[1].children[1].sum += row[i].count
                            result[6].children[1].sum += row[i].count
                            result[6].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[2].children[1].children[1].children[1].sum += row[i].count
                            result[2].children[2].children[1].children[1].children[0].sum += row[i].count

                            result[2].children[2].children[1].children[1].sum += row[i].count
                            result[2].children[2].children[1].sum += row[i].count
                            result[2].children[2].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[4].children[1].children[2].sum += row[i].count
                            result[3].children[4].children[1].sum += row[i].count
                            result[3].children[4].sum += row[i].count
                            result[3].sum += row[i].count

                            result[6].children[4].children[1].sum += row[i].count
                            result[6].children[4].sum += row[i].count
                            result[6].sum += row[i].count
                        } else {
                            result[0].children[2].children[1].children[1].children[2].sum += row[i].count
                            result[1].children[2].children[1].children[1].children[0].sum += row[i].count

                            result[1].children[2].children[1].children[1].sum += row[i].count
                            result[1].children[2].children[1].sum += row[i].count
                            result[1].children[2].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[2].children[1].children[1].sum += row[i].count
                        result[0].children[2].children[1].sum += row[i].count
                        result[0].children[2].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    case 'agree':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[2].children[2].children[1].children[0].sum += row[i].count
                            result[2].children[2].children[2].children[1].children[0].sum += row[i].count

                            result[2].children[2].children[2].children[1].sum += row[i].count
                            result[2].children[2].children[2].sum += row[i].count
                            result[2].children[2].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[2].children[1].children[2].sum += row[i].count
                            result[3].children[2].children[1].sum += row[i].count
                            result[3].children[2].sum += row[i].count
                            result[3].sum += row[i].count

                            result[6].children[2].children[1].sum += row[i].count
                            result[6].children[2].sum += row[i].count
                            result[6].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[2].children[2].children[1].children[1].sum += row[i].count
                            result[2].children[2].children[2].children[1].children[0].sum += row[i].count

                            result[2].children[2].children[2].children[1].sum += row[i].count
                            result[2].children[2].children[2].sum += row[i].count
                            result[2].children[2].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[5].children[1].children[2].sum += row[i].count
                            result[3].children[5].children[1].sum += row[i].count
                            result[3].children[5].sum += row[i].count
                            result[3].sum += row[i].count

                            result[6].children[5].children[1].sum += row[i].count
                            result[6].children[5].sum += row[i].count
                            result[6].sum += row[i].count
                        } else {
                            result[0].children[2].children[2].children[1].children[1].sum += row[i].count
                            result[1].children[2].children[2].children[1].children[0].sum += row[i].count

                            result[1].children[2].children[2].children[1].sum += row[i].count
                            result[1].children[2].children[2].sum += row[i].count
                            result[1].children[2].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[2].children[2].children[1].sum += row[i].count
                        result[0].children[2].children[2].sum += row[i].count
                        result[0].children[2].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    default:
                }
                break
            case '4':
                switch (row[i].action_exit) {
                    case 'next':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[3].children[0].children[1].children[0].sum += row[i].count
                            result[2].children[3].children[0].children[1].children[0].sum += row[i].count

                            result[2].children[3].children[0].children[1].sum += row[i].count
                            result[2].children[3].children[0].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[0].children[1].children[3].sum += row[i].count
                            result[3].children[0].children[1].sum += row[i].count
                            result[3].children[0].sum += row[i].count
                            result[3].sum += row[i].count

                            result[7].children[0].children[1].sum += row[i].count
                            result[7].children[0].sum += row[i].count
                            result[7].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[3].children[0].children[1].children[1].sum += row[i].count
                            result[2].children[3].children[0].children[1].children[1].sum += row[i].count

                            result[2].children[3].children[0].children[1].sum += row[i].count
                            result[2].children[3].children[0].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[3].children[1].children[3].sum += row[i].count
                            result[3].children[3].children[1].sum += row[i].count
                            result[3].children[3].sum += row[i].count
                            result[3].sum += row[i].count

                            result[7].children[3].children[1].sum += row[i].count
                            result[7].children[3].sum += row[i].count
                            result[7].sum += row[i].count
                        } else {
                            result[0].children[3].children[0].children[1].children[2].sum += row[i].count
                            result[1].children[3].children[0].children[1].children[2].sum += row[i].count

                            result[1].children[3].children[0].children[1].sum += row[i].count
                            result[1].children[3].children[0].sum += row[i].count
                            result[1].children[3].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[3].children[0].children[1].sum += row[i].count
                        result[0].children[3].children[0].sum += row[i].count
                        result[0].children[3].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    case 'doing':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[3].children[1].children[1].children[0].sum += row[i].count
                            result[2].children[3].children[1].children[1].children[0].sum += row[i].count

                            result[2].children[3].children[1].children[1].sum += row[i].count
                            result[2].children[3].children[1].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[1].children[1].children[3].sum += row[i].count
                            result[3].children[1].children[1].sum += row[i].count
                            result[3].children[1].sum += row[i].count
                            result[3].sum += row[i].count

                            result[7].children[1].children[1].sum += row[i].count
                            result[7].children[1].sum += row[i].count
                            result[7].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[3].children[1].children[1].children[1].sum += row[i].count
                            result[2].children[3].children[1].children[1].children[0].sum += row[i].count

                            result[2].children[3].children[1].children[1].sum += row[i].count
                            result[2].children[3].children[1].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[4].children[1].children[3].sum += row[i].count
                            result[3].children[4].children[1].sum += row[i].count
                            result[3].children[4].sum += row[i].count
                            result[3].sum += row[i].count

                            result[7].children[4].children[1].sum += row[i].count
                            result[7].children[4].sum += row[i].count
                            result[7].sum += row[i].count
                        } else {
                            result[0].children[3].children[1].children[1].children[2].sum += row[i].count
                            result[1].children[3].children[1].children[1].children[0].sum += row[i].count

                            result[1].children[3].children[1].children[1].sum += row[i].count
                            result[1].children[3].children[1].sum += row[i].count
                            result[1].children[3].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[3].children[1].children[1].sum += row[i].count
                        result[0].children[3].children[1].sum += row[i].count
                        result[0].children[3].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    case 'agree':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[3].children[2].children[1].children[0].sum += row[i].count
                            result[2].children[3].children[2].children[1].children[0].sum += row[i].count

                            result[2].children[3].children[2].children[1].sum += row[i].count
                            result[2].children[3].children[2].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[2].children[1].children[3].sum += row[i].count
                            result[3].children[2].children[1].sum += row[i].count
                            result[3].children[2].sum += row[i].count
                            result[3].sum += row[i].count

                            result[7].children[2].children[1].sum += row[i].count
                            result[7].children[2].sum += row[i].count
                            result[7].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[3].children[2].children[1].children[1].sum += row[i].count
                            result[2].children[3].children[2].children[1].children[0].sum += row[i].count

                            result[2].children[3].children[2].children[1].sum += row[i].count
                            result[2].children[3].children[2].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[5].children[1].children[3].sum += row[i].count
                            result[3].children[5].children[1].sum += row[i].count
                            result[3].children[5].sum += row[i].count
                            result[3].sum += row[i].count

                            result[7].children[5].children[1].sum += row[i].count
                            result[7].children[5].sum += row[i].count
                            result[7].sum += row[i].count
                        } else {
                            result[0].children[3].children[2].children[1].children[1].sum += row[i].count
                            result[1].children[3].children[2].children[1].children[0].sum += row[i].count

                            result[1].children[3].children[2].children[1].sum += row[i].count
                            result[1].children[3].children[2].sum += row[i].count
                            result[1].children[3].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[3].children[2].children[1].sum += row[i].count
                        result[0].children[3].children[2].sum += row[i].count
                        result[0].children[3].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    default:
                }
                break
            case '5':
                switch (row[i].action_exit) {
                    case 'next':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[0].children[0].children[1].children[0].sum += row[i].count
                            result[0].children[3].children[0].children[1].children[0].sum += row[i].count
                            result[2].children[0].children[0].children[1].children[0].sum += row[i].count
                            result[2].children[3].children[0].children[1].children[0].sum += row[i].count

                            result[2].children[0].children[0].children[1].sum += row[i].count
                            result[2].children[3].children[0].children[1].sum += row[i].count
                            result[2].children[0].children[0].sum += row[i].count
                            result[2].children[3].children[0].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[0].children[1].children[0].sum += row[i].count
                            result[3].children[0].children[1].children[3].sum += row[i].count
                            result[3].children[0].children[1].sum += row[i].count
                            result[3].children[0].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[0].children[1].sum += row[i].count
                            result[7].children[0].children[1].sum += row[i].count
                            result[5].children[0].sum += row[i].count
                            result[7].children[0].sum += row[i].count
                            result[5].sum += row[i].count
                            result[7].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[0].children[0].children[1].children[1].sum += row[i].count
                            result[0].children[3].children[0].children[1].children[1].sum += row[i].count
                            result[2].children[0].children[0].children[1].children[1].sum += row[i].count                            
                            result[2].children[3].children[0].children[1].children[1].sum += row[i].count

                            result[2].children[0].children[0].children[1].sum += row[i].count
                            result[2].children[3].children[0].children[1].sum += row[i].count
                            result[2].children[0].children[0].sum += row[i].count
                            result[2].children[3].children[0].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[3].children[1].children[0].sum += row[i].count
                            result[3].children[3].children[1].children[3].sum += row[i].count
                            result[3].children[3].children[1].sum += row[i].count
                            result[3].children[3].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[3].children[1].sum += row[i].count
                            result[7].children[3].children[1].sum += row[i].count
                            result[5].children[3].sum += row[i].count
                            result[7].children[3].sum += row[i].count
                            result[5].sum += row[i].count
                            result[7].sum += row[i].count
                        } else {
                            result[0].children[0].children[0].children[1].children[2].sum += row[i].count
                            result[0].children[3].children[0].children[1].children[2].sum += row[i].count
                            result[1].children[0].children[0].children[1].children[2].sum += row[i].count
                            result[1].children[3].children[0].children[1].children[2].sum += row[i].count

                            result[1].children[0].children[0].children[1].sum += row[i].count
                            result[1].children[3].children[0].children[1].sum += row[i].count
                            result[1].children[0].children[0].sum += row[i].count
                            result[1].children[3].children[0].sum += row[i].count
                            result[1].children[0].sum += row[i].count
                            result[1].children[3].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[0].children[0].children[1].sum += row[i].count
                        result[0].children[3].children[0].children[1].sum += row[i].count
                        result[0].children[0].children[0].sum += row[i].count
                        result[0].children[3].children[0].sum += row[i].count
                        result[0].children[0].sum += row[i].count
                        result[0].children[3].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    case 'doing':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[0].children[1].children[1].children[0].sum += row[i].count
                            result[0].children[3].children[1].children[1].children[0].sum += row[i].count
                            result[2].children[0].children[1].children[1].children[0].sum += row[i].count
                            result[2].children[3].children[1].children[1].children[0].sum += row[i].count

                            result[2].children[0].children[1].children[1].sum += row[i].count
                            result[2].children[3].children[1].children[1].sum += row[i].count
                            result[2].children[0].children[1].sum += row[i].count
                            result[2].children[3].children[1].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[1].children[1].children[0].sum += row[i].count
                            result[3].children[1].children[1].children[3].sum += row[i].count
                            result[3].children[1].children[1].sum += row[i].count
                            result[3].children[1].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[1].children[1].sum += row[i].count
                            result[7].children[1].children[1].sum += row[i].count
                            result[5].children[1].sum += row[i].count
                            result[7].children[1].sum += row[i].count
                            result[5].sum += row[i].count
                            result[7].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[0].children[1].children[1].children[1].sum += row[i].count
                            result[0].children[3].children[1].children[1].children[1].sum += row[i].count
                            result[2].children[0].children[1].children[1].children[0].sum += row[i].count
                            result[2].children[3].children[1].children[1].children[0].sum += row[i].count

                            result[2].children[0].children[1].children[1].sum += row[i].count
                            result[2].children[3].children[1].children[1].sum += row[i].count
                            result[2].children[0].children[1].sum += row[i].count
                            result[2].children[3].children[1].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[4].children[1].children[0].sum += row[i].count
                            result[3].children[4].children[1].children[3].sum += row[i].count
                            result[3].children[4].children[1].sum += row[i].count
                            result[3].children[4].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[4].children[1].sum += row[i].count
                            result[7].children[4].children[1].sum += row[i].count
                            result[5].children[4].sum += row[i].count
                            result[7].children[4].sum += row[i].count
                            result[5].sum += row[i].count
                            result[7].sum += row[i].count
                        } else {
                            result[0].children[0].children[1].children[1].children[2].sum += row[i].count
                            result[0].children[3].children[1].children[1].children[2].sum += row[i].count
                            result[1].children[0].children[1].children[1].children[0].sum += row[i].count
                            result[1].children[3].children[1].children[1].children[0].sum += row[i].count

                            result[1].children[0].children[1].children[1].sum += row[i].count
                            result[1].children[3].children[1].children[1].sum += row[i].count
                            result[1].children[0].children[1].sum += row[i].count
                            result[1].children[3].children[1].sum += row[i].count
                            result[1].children[0].sum += row[i].count
                            result[1].children[3].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[0].children[1].children[1].sum += row[i].count
                        result[0].children[3].children[1].children[1].sum += row[i].count
                        result[0].children[0].children[1].sum += row[i].count
                        result[0].children[3].children[1].sum += row[i].count
                        result[0].children[0].sum += row[i].count
                        result[0].children[3].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    case 'agree':
                        if (row[i].tag == 'insidePhoto') {
                            result[0].children[0].children[2].children[1].children[0].sum += row[i].count
                            result[0].children[3].children[2].children[1].children[0].sum += row[i].count
                            result[2].children[0].children[2].children[1].children[0].sum += row[i].count
                            result[2].children[3].children[2].children[1].children[0].sum += row[i].count

                            result[2].children[0].children[2].children[1].sum += row[i].count
                            result[2].children[3].children[2].children[1].sum += row[i].count
                            result[2].children[0].children[2].sum += row[i].count
                            result[2].children[3].children[2].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[2].children[1].children[0].sum += row[i].count
                            result[3].children[2].children[1].children[3].sum += row[i].count
                            result[3].children[2].children[1].sum += row[i].count
                            result[3].children[2].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[2].children[1].sum += row[i].count
                            result[7].children[2].children[1].sum += row[i].count
                            result[5].children[2].sum += row[i].count
                            result[7].children[2].sum += row[i].count
                            result[5].sum += row[i].count
                            result[7].sum += row[i].count
                        } else if (row[i].tag == 'insideArt') {
                            result[0].children[0].children[2].children[1].children[1].sum += row[i].count
                            result[0].children[3].children[2].children[1].children[1].sum += row[i].count
                            result[2].children[0].children[2].children[1].children[0].sum += row[i].count
                            result[2].children[3].children[2].children[1].children[0].sum += row[i].count

                            result[2].children[0].children[2].children[1].sum += row[i].count
                            result[2].children[3].children[2].children[1].sum += row[i].count
                            result[2].children[0].children[2].sum += row[i].count
                            result[2].children[3].children[2].sum += row[i].count
                            result[2].children[0].sum += row[i].count
                            result[2].children[3].sum += row[i].count
                            result[2].sum += row[i].count

                            result[3].children[5].children[1].children[0].sum += row[i].count
                            result[3].children[5].children[1].children[3].sum += row[i].count
                            result[3].children[5].children[1].sum += row[i].count
                            result[3].children[5].sum += row[i].count
                            result[3].sum += row[i].count

                            result[5].children[5].children[1].sum += row[i].count
                            result[7].children[5].children[1].sum += row[i].count
                            result[5].children[5].sum += row[i].count
                            result[7].children[5].sum += row[i].count
                            result[5].sum += row[i].count
                            result[7].sum += row[i].count
                        } else {
                            result[0].children[0].children[2].children[1].children[1].sum += row[i].count
                            result[0].children[3].children[2].children[1].children[1].sum += row[i].count
                            result[1].children[0].children[2].children[1].children[0].sum += row[i].count
                            result[1].children[3].children[2].children[1].children[0].sum += row[i].count

                            result[1].children[0].children[2].children[1].sum += row[i].count
                            result[1].children[3].children[2].children[1].sum += row[i].count
                            result[1].children[0].children[2].sum += row[i].count
                            result[1].children[3].children[2].sum += row[i].count
                            result[1].children[0].sum += row[i].count
                            result[1].children[3].sum += row[i].count
                            result[1].sum += row[i].count
                        }
                        result[0].children[0].children[2].children[1].sum += row[i].count
                        result[0].children[3].children[2].children[1].sum += row[i].count
                        result[0].children[0].children[2].sum += row[i].count
                        result[0].children[3].children[2].sum += row[i].count
                        result[0].children[0].sum += row[i].count
                        result[0].children[3].sum += row[i].count
                        result[0].sum += row[i].count
                        break
                    default:
                }
                break
            default:
        }
    }
    return result
}

const getFlowInstances = async function (params) {
    let result = []
    //暂时只查询3d+拍摄+美编
    let sql = `select f.id, f.title as flowFormName, f.form_uuid as flowFormId 
        from vision_type vt join forms f on vt.form_id = f.id group by
        f.id, f.title, f.form_uuid`
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
    getFlowActions,
    getStat
}