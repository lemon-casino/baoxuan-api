const operatorConst = require('../../const/development/operatorConst')
const operatorRecommendRepo = require('@/repository/development/operatorRecommend')
const pmEditLogRepo = require('@/repository/development/pmEditLog')
const defaultConst = require('@/const/development/defaultConst')
const operatorService = {}
const moment = require('moment')
const actHiVarinstRepo = require('@/repository/bpm/actHiVarinstRepo')
const actHiTaskinstRepo = require('@/repository/bpm/actHiTaskinstRepo')

operatorService.getColumn = async () => {
    const columns = [
        {field_id: 'project', label: '反推发起人-运营事业部', edit: true, required: true, type: 'select', fixed: true, select: operatorConst.PROJECT_LIST},
        {field_id: 'recommend_time', label: '推品日期', edit: true, required: true, type: 'date', fixed: true},
        {field_id: 'operator', label: '反推运营发起人', type: 'input', fixed: true},
        {field_id: 'analyse_link', label: '反推-运营提供市场分析', edit: true, required: true, type: 'file', fixed: true},
        {field_id: 'director', label: '反推承接人', type: 'input'},
        {field_id: 'brief_product_line', label: '产品线简称', type: 'input', edit: true, required: true, info: '核心关键词+确认辅助/提炼核心转化理由（人群/场景/功能/风格）+价位段(低/中低/中高/高)+内部款号（举例密封袋，功能/颜色）密封袋母婴拉链中高价位（用老的ID，继承原有数据。产品线要迭代，系统要有修改日志，）'},
        {field_id: 'first_category', label: '一级类目', info: '基于天猫类目1-4级', edit: true, required: true, type: 'input'},
        {field_id: 'second_category', label: '二级类目', info: '基于天猫类目1-4级', edit: true, required: true, type: 'input'},
        {field_id: 'third_category', label: '三级类目', info: '基于天猫类目1-4级', edit: true, type: 'input'},
        {field_id: 'seasons', label: '产品销售季节', info: '填写主力售卖时间', edit: true, required: true, type: 'select', select: operatorConst.SEASON_LIST},
        {field_id: 'related', label: '相关联的产品类型和节日', edit: true, required: true, type: 'select', select: operatorConst.RELATED_LIST},
        {field_id: 'patent_belongs', label: '专利归属', type: 'select', select: operatorConst.PATENT_BELONGS_LIST},
        {field_id: 'patent_type', label: '专利-二级', type: 'select', select: operatorConst.PATENT_TYPE_LIST},
        {field_id: 'sale_type', label: '供应商产品销售方式', type: 'select', select: operatorConst.SALE_TYPE_LIST},
        {field_id: 'status', label: '反推进度', type: 'select', select: operatorConst.STATUS_LIST, info: '目标为16工时找到货品给结果'},
        {field_id: 'sale_purpose', label: '产品销售目的', info: '存量=迭代，增量=填补空白，原来有就叫迭代', 
            edit: true, required: true, type: 'select', select: operatorConst.SALE_PURPOSE_LIST},
        {field_id: 'link', label: '流程链接', type: 'link', info: '后面填反推流程，it自动抓取或生产'},
        {field_id: 'schedule_confirm_time', label: '预计样品确认时间', type: 'date'},
        {field_id: 'product_info', label: '提交产品信息', type: 'file', info: '开发填起订量，成本，毛利，箱规，执行标准（GB),外包装尺寸， 产品尺寸，重量等'},
        {field_id: 'confirm_time', label: '实际样品到货时间', type: 'date', info: '发北京和杭州两边，运营同步到货，郑艳艳填'},
        {field_id: 'order_time', label: '实际订货时间', type: 'date', info: '运营负责'},
        {field_id: 'arrived_time', label: '实际大货到货时间', type: 'date'},
        {field_id: 'expected_monthly_sales', label: '预计月销量', type: 'table', info: '各平台运营销售子列表，此处为总表'},
        {field_id: 'goods_ids', label: '各平台上架完毕', type: 'table', info: '各平台商品ID'},
        {field_id: 'product_img', label: '对应产品图片', type: 'image'},
        {field_id: 'remark', label: '特殊备注/要求', info: '主动跳转流程&自动生产表单', edit: true, type: 'input'},
    ]
    return columns
}

operatorService.getData = async (limit, offset, params, user_id) => {
    const {data, total} = await operatorRecommendRepo.get(limit, offset, params)
    for (let i = 0; i < data.length; i++) {
        if (data[i].link_status == 0) {
            let instanceId = data[i].link.split('=')[1]
            let status = await actHiVarinstRepo.getStatus(instanceId)
            if ([defaultConst.process_status.APPROVE, 
                defaultConst.process_status.REJECT,
                defaultConst.process_status.CANCEL].includes(status)) {
                operatorService.updateLinkStatus(data[i].id, defaultConst.link_status.FINISH)
            }
            for (let index in defaultConst.operator_params_related) {
                if (!data[i][index]) {
                    if (defaultConst.operator_params_related[index]['params']) {                        
                        if (index == 'status') {
                            let list = await actHiVarinstRepo.getStatusInfo(
                                instanceId, 
                                defaultConst.operator_params_related[index]['params']
                            )
                            for (let k = 0; k < list?.length; k++) {
                                if (list[k].value == '找到') {
                                    data[i][index] = operatorConst.STATUS.SUCCESS
                                    operatorService.updateExtraValue(user_id, data[i].id, index, data[i][index])
                                }
                            }
                            if (data[i][index] == null && list?.length == defaultConst.operator_params_related[index]['params'].length) {
                                data[i][index] = operatorConst.STATUS.FAILED
                                operatorService.updateExtraValue(user_id, data[i].id, index, data[i][index])
                            }
                        } else {
                            let info = await actHiVarinstRepo.getValue(
                                instanceId, 
                                defaultConst.operator_params_related[index]['params']
                            )
                            for (let j = 0; j < info?.length; j++) {
                                if (info[j].type == 0) {
                                    data[i][index] = `${data[i][index]}${info[j].value},`
                                }
                            }
                            data[i][index] = data[i][index]?.length ? 
                                data[i][index].substring(0, data[i][index]?.length - 1) : 
                                data[i][index]
                            operatorService.updateExtraValue(user_id, data[i].id, index, data[i][index])
                        }
                    } else {
                        let info = await actHiTaskinstRepo.getNodeTime(
                            instanceId, 
                            defaultConst.operator_params_related[index]['node']
                        )
                        data[i][index] = info
                        operatorService.updateExtraValue(user_id, data[i].id, index, data[i][index])
                    }
                }
            }
        }
    }
    return {data, total}
}

operatorService.create = async (user_id, params) => {
    params.recommend_time = moment(params.recommend_time).format('YYYY-MM-DD')
    const result = await operatorRecommendRepo.insert([
        params.project,
        params.recommend_time,
        user_id, 
        params.analyse_link, 
        params.first_category, 
        params.second_category,
        params.third_category,
        params.seasons,
        params.related,
        params.sale_purpose,
        params.brief_product_line,
        params.remark
    ])
    if (result) {
        await pmEditLogRepo.insert([
            defaultConst.LOG_TYPE.INSERT,
            defaultConst.OPERATOR,
            user_id,
            null,
            JSON.stringify({
                project: params.project,
                recommend_time: params.recommend_time,
                operator: user_id, 
                analyse_link: params.analyse_link,
                first_category: params.first_category, 
                second_category: params.second_category,
                third_category: params.third_category,
                seasons: params.seasons,
                related: params.related,
                sale_purpose: params.sale_purpose,
                brief_product_line: params.brief_product_line,
                remark: params.remark
            })
        ])
    }
    return result
}

operatorService.update = async (user_id, id, params) => {
    let goods = await operatorRecommendRepo.getById(id)
    if (!goods?.length || goods[0].link != null) return null
    params.recommend_time = moment(params.recommend_time).format('YYYY-MM-DD')
    const result = await operatorRecommendRepo.update([
        params.project,
        params.recommend_time,
        params.analysis_link,
        params.first_category, 
        params.second_category,
        params.third_category,
        params.seasons,
        params.related,
        params.sale_purpose,
        params.brief_product_line,
        params.remark,
        id
    ])
    if (result) await pmEditLogRepo.insert([
        defaultConst.LOG_TYPE.UPDATE,
        defaultConst.OPERATOR,
        user_id,
        JSON.stringify(goods[0]),
        JSON.stringify({
            project: params.project,
            recommend_time: params.recommend_time,
            analyse_link: params.analyse_link,
            first_category: params.first_category, 
            second_category: params.second_category,
            third_category: params.third_category,
            seasons: params.seasons,
            related: params.related,
            sale_purpose: params.sale_purpose,
            brief_product_line: params.brief_product_line,
            remark: params.remark,
            id
        })
    ])
    return result
}

operatorService.getById = async (id) => {
    const result = await operatorRecommendRepo.getById(id)
    return result?.length ? result[0] : null
}

operatorService.updateLink = async (user_id, id, link) => {
    const result = await operatorRecommendRepo.updateLink(id, link)
    if (result)
        await pmEditLogRepo.insert([
            defaultConst.LOG_TYPE.UPDATE,
            defaultConst.OPERATOR,
            user_id,
            null,
            JSON.stringify({link})
        ])
    return result
}

operatorService.updateLinkStatus = async (user_id, id, origin_status, status) => {
    const result = await operatorRecommendRepo.updateLinkStatus(id, status)
    if (result)
        await pmEditLogRepo.insert([
            defaultConst.LOG_TYPE.UPDATE,
            defaultConst.OPERATOR,
            user_id,
            JSON.stringify({link_status: origin_status}),
            JSON.stringify({link_status: status})
        ])
    return result
}

operatorService.updateExtraValue = async (user_id, id, key, value) => {
    const result = await operatorRecommendRepo.updateExtraValue(id, key, value)
    if (result) {
        let info = {}
        info[key] = value
        await pmEditLogRepo.insert([
            defaultConst.LOG_TYPE.UPDATE,
            defaultConst.OPERATOR,
            user_id,
            null,
            JSON.stringify(info)
        ])
    }
    return result
}

module.exports = operatorService;