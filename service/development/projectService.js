const projectConst = require('../../const/development/projectConst')
const projectManagementRepo = require('@/repository/development/projectManagement')
const pmEditLogRepo = require('@/repository/development/pmEditLog')
const defaultConst = require('@/const/development/defaultConst')
const projectService = {}
const moment = require('moment')

projectService.getColumn = async () => {
    const columns = [
        {field_id: 'exploit_director', label: '开发负责人', type: 'input', fixed: true},
        {field_id: 'status', label: '市场分析进度', type: 'select', fixed: true, select: projectConst.STATUS_LIST},
        {field_id: 'first_category', label: '一级类目', info: '基于天猫类目1-4级', edit: true, required: true, fixed: true, type: 'input'},
        {field_id: 'second_category', label: '二级类目', info: '基于天猫类目1-4级', edit: true, required: true, fixed: true, type: 'input'},
        {field_id: 'third_category', label: '三级类目', info: '基于天猫类目1-4级', edit: true, fixed: true, type: 'input'},
        {field_id: 'type', label: '市场分析名称', info: '本次分析产品具体名称-基于产品特征或关键词', edit: true, fixed: true, required: true, type: 'input'},
        {field_id: 'goods_name', label: '立项产品名称', info: '名称不许重复', edit: true, required: true, fixed: true, type: 'input'},
        {field_id: 'seasons', label: '产品销售季节', info: '填写主力售卖时间', edit: true, required: true, type: 'select', select: projectConst.SEASON_LIST},
        {field_id: 'patent_belongs', label: '专利归属', edit: true, required: true, type: 'select', select: projectConst.PATENT_BELONGS_LIST},
        {field_id: 'patent_type', label: '专利-二级', edit: true, required: true, type: 'select', select: projectConst.PATENT_TYPE_LIST},
        {field_id: 'related', label: '相关联的产品类型和节日', edit: true, required: true, type: 'select', select: projectConst.RELATED_LIST},
        {field_id: 'schedule_time', label: '预计市场分析过会时间', info: '预计过会时间', required: true, edit: true, type: 'date'},
        {field_id: 'design_type', label: '设计定义', required: true, edit: true, type: 'select', select: projectConst.DESIGN_TYPE_LIST},
        {field_id: 'analyse_link', label: '市场分析表', info: '分析过程中需要附上分析表，确认最终稿', edit: true, required: true, type: 'file'},
        {field_id: 'complete_time', label: '分析表过会且通过时间', type: 'date'},
        {field_id: 'sale_purpose', label: '产品销售目的', info: '存量=迭代，增量=填补空白，原来有就叫迭代', 
            edit: true, required: true, type: 'select', select: projectConst.SALE_PURPOSE_LIST},
        {field_id: 'exploitation_features', label: '产品开发性质', info: '仅换材料不叫自研', edit: true, required: true, 
            type: 'select', select: projectConst.EXPLOITATION_FEATURES_LIST},
        {field_id: 'core_reasons', label: '核心立项理由', edit: true, required: true, type: 'input'},
        {field_id: 'link', label: '流程链接', type: 'link', info: '后面填自研流程'},
        {field_id: 'schedule_arrived_time', label: '预计开发周期（大货时间）', edit: true, required: true, type: 'date', info: '对产品上市时间进行预期，产品立项要有上架销售时间'},
        {field_id: 'schedule_confirm_time', label: '预计样品确认时间', edit: true, required: true, type: 'date'},
        {field_id: 'product_info', label: '提交产品信息', edit: true, required: true, type: 'file', info: '开发填起订量，成本，毛利，箱规，执行标准（GB),外包装尺寸， 产品尺寸，重量等'},
        {field_id: 'confirm_time', label: '实际样品到货时间', type: 'date', info: '发北京和杭州两边，杭州运营助理填写'},
        {field_id: 'order_time', label: '实际订货时间', type: 'date', info: '运营负责'},
        {field_id: 'arrived_time', label: '实际大货到货时间', type: 'date'},
        {field_id: 'brief_product_line', label: '产品线简称', edit: true, required: true, type: 'input', info: '核心关键词+确认辅助/提炼核心转化理由（人群/场景/功能/风格）+价位段(低/中低/中高/高)+内部款号（举例密封袋，功能/颜色）密封袋母婴拉链中高价位（用老的ID，继承原有数据。产品线要迭代，系统要有修改日志）'},
        {field_id: 'expected_monthly_sales', label: '预计月销量', type: 'table', info: '各平台运营销售子列表，此处为总表'},
        {field_id: 'goods_ids', label: '各平台上架完毕', type: 'table', info: '各平台商品ID'},
        {field_id: 'product_img', label: '对应产品图片', edit: true, required: true, type: 'image'},
        {field_id: 'project_status', label: '当前开发项目进度(开发填写)', extra_edit: true, type: 'select', select: projectConst.PROJECT_STATUS_LIST},
        {field_id: 'remark', label: '特殊备注/要求', 
            info: '工厂知识产权/独家/有特殊要求，工厂开发有知识产权不能是自研，自研不能工厂有知识产权，如果工厂一定要有知识产品，宝选必须是独家（有合同）主动跳转流程&自动生产表单', 
            edit: true, type: 'input'},
    ]
    return columns
}

projectService.getData = async (limit, offset, params) => {
    const {data, total} = await projectManagementRepo.get(limit, offset, params)

    return {data, total}
}

projectService.create = async (user_id, params) => {
    let goods = await projectManagementRepo.getByGoodsName(params.goods_name)
    if (goods?.length) return null
    params.schedule_time = moment(params.schedule_time).format('YYYY-MM-DD')
    params.schedule_arrived_time = moment(params.schedule_arrived_time).format('YYYY-MM-DD')
    params.schedule_confirm_time = moment(params.schedule_confirm_time).format('YYYY-MM-DD')
    const result = await projectManagementRepo.insert([
        user_id, 
        projectConst.STATUS.PENDING, 
        params.first_category, 
        params.second_category,
        params.third_category,
        params.type,
        params.goods_name,
        params.seasons,
        params.patent_belongs,
        params.patent_type,
        params.related,
        params.schedule_time,
        params.design_type,
        params.analyse_link,
        params.sale_purpose,
        params.exploitation_features,
        params.core_reasons,
        params.schedule_arrived_time,
        params.schedule_confirm_time,
        params.product_info,
        params.brief_product_line,
        params.product_img,
        params.remark
    ])
    if (result) {
        await pmEditLogRepo.insert([
            defaultConst.LOG_TYPE.INSERT,
            defaultConst.PROJECT,
            user_id,
            null,
            JSON.stringify({
                exploit_director: user_id, 
                status: projectConst.STATUS.PENDING, 
                first_category: params.first_category, 
                second_category: params.second_category,
                third_category: params.third_category,
                type: params.type,
                goods_name: params.goods_name,
                seasons: params.seasons,
                patent_belongs: params.patent_belongs,
                patent_type: params.patent_type,
                related: params.related,
                schedule_time: params.schedule_time,
                design_type: params.design_type,
                analyse_link: params.analyse_link,
                sale_purpose: params.sale_purpose,
                exploitation_features: params.exploitation_features,
                core_reasons: params.core_reasons,
                schedule_arrived_time: params.schedule_arrived_time,
                schedule_confirm_time: params.schedule_confirm_time,
                product_info: params.product_info,
                brief_product_line: params.brief_product_line,
                product_img: params.product_img,
                remark: params.remark
            })
        ])
    }
    return result
}

projectService.update = async (user_id, id, params) => {
    let goods = await projectManagementRepo.getById(id)
    if (!goods?.length) return null
    params.schedule_time = moment(params.schedule_time).format('YYYY-MM-DD')
    params.schedule_arrived_time = moment(params.schedule_arrived_time).format('YYYY-MM-DD')
    params.schedule_confirm_time = moment(params.schedule_confirm_time).format('YYYY-MM-DD')
    const result = await projectManagementRepo.update([
        params.first_category, 
        params.second_category,
        params.third_category,
        params.type,
        params.goods_name,
        params.seasons,
        params.patent_belongs,
        params.patent_type,
        params.related,
        params.schedule_time,
        params.design_type,
        params.analyse_link,
        params.sale_purpose,
        params.exploitation_features,
        params.core_reasons,
        params.schedule_arrived_time,
        params.schedule_confirm_time,
        params.product_info,
        params.brief_product_line,
        params.product_img,
        params.project_status,
        params.remark,
        id
    ])
    if (result) await pmEditLogRepo.insert([
        defaultConst.LOG_TYPE.UPDATE,
        defaultConst.PROJECT,
        user_id,
        JSON.stringify(goods[0]),
        JSON.stringify({
            first_category: params.first_category, 
            second_category: params.second_category,
            third_category: params.third_category,
            type: params.type,
            goods_name: params.goods_name,
            seasons: params.seasons,
            patent_belongs: params.patent_belongs,
            patent_type: params.patent_type,
            related: params.related,
            schedule_time: params.schedule_time,
            design_type: params.design_type,
            analyse_link: params.analyse_link,
            sale_purpose: params.sale_purpose,
            exploitation_features: params.exploitation_features,
            core_reasons: params.core_reasons,
            schedule_arrived_time: params.schedule_arrived_time,
            schedule_confirm_time: params.schedule_confirm_time,
            product_info: params.product_info,
            brief_product_line: params.brief_product_line,
            product_img: params.product_img,
            project_status: params.project_status,
            remark: params.remark,
            id
        })
    ])
    return result
}

projectService.getById = async (id) => {
    const result = await projectManagementRepo.getById(id)
    return result?.length ? result[0] : null
}

projectService.updateLink = async (id, link) => {
    const result = await projectManagementRepo.updateLink(id, link)
    return result
}

module.exports = projectService;