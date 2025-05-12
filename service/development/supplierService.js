const supplierConst = require('../../const/development/supplierConst')
const supplierRecommendRepo = require('@/repository/development/supplierRecommend')
const pmEditLogRepo = require('@/repository/development/pmEditLog')
const defaultConst = require('@/const/development/defaultConst')
const supplierService = {}
const moment = require('moment')

supplierService.getColumn = async () => {
    const columns = [
        {field_id: 'exploit_director', label: '开发负责人', type: 'input', fixed: true},
        {field_id: 'status', label: '市场分析进度', type: 'select', fixed: true, select: supplierConst.STATUS_LIST, info: 'IT抓取流程结果'},
        {field_id: 'recommend_time', label: '推品日期', edit: true, required: true, type: 'date', fixed: true},
        {field_id: 'brief_product_line', label: '产品线简称', edit: true, required: true, type: 'input', fixed: true, info: '核心关键词+确认辅助/提炼核心转化理由（人群/场景/功能/风格）+价位段(低/中低/中高/高)+内部款号（举例密封袋，功能/颜色）密封袋母婴拉链中高价位（用老的ID，继承原有数据。产品线要迭代，系统要有修改日志，）'},
        {field_id: 'first_category', label: '一级类目', info: '基于天猫类目1-4级', edit: true, required: true, fixed: true, type: 'input'},
        {field_id: 'second_category', label: '二级类目', info: '基于天猫类目1-4级', edit: true, required: true, fixed: true, type: 'input'},
        {field_id: 'third_category', label: '三级类目', info: '基于天猫类目1-4级', edit: true, fixed: true, type: 'input'},
        {field_id: 'supplier', label: '供应商名称', edit: true, required: true, type: 'input', info: '建权展示'},
        {field_id: 'supplier_type', label: '供应商属性', edit: true, required: true, type: 'select', select: supplierConst.SUPPLIER_TYPE_LIST},
        {field_id: 'purchase_type', label: '采购形式', edit: true, required: true, type: 'select', select: supplierConst.PURCHASE_TYPE_LIST},
        {field_id: 'product_info', label: '产品信息', type: 'file', edit: true, required: true, info: '开发填起订量，成本，毛利，箱规，执行标准（GB),外包装尺寸， 产品尺寸，重量等'},
        {field_id: 'goods_name', label: '推品名称', info: '本次分析产品具体名称-基于产品特征或关键词或者供应商提供名称', edit: true, required: true, type: 'input'},
        {field_id: 'goods_type', label: '产品属性', edit: true, required: true, type: 'select', select: supplierConst.GOODS_TYPE_LIST},
        {field_id: 'seasons', label: '产品销售季节', info: '填写主力售卖时间', edit: true, required: true, type: 'select', select: supplierConst.SEASON_LIST},
        {field_id: 'patent_belongs', label: '专利归属', edit: true, required: true, type: 'select', select: supplierConst.PATENT_BELONGS_LIST},
        {field_id: 'patent_type', label: '专利-二级', edit: true, type: 'select', select: supplierConst.PATENT_TYPE_LIST},
        {field_id: 'related', label: '相关联的产品类型和节日', edit: true, type: 'select', select: supplierConst.RELATED_LIST},
        {field_id: 'sale_purpose', label: '产品销售目的', info: '存量=迭代，增量=填补空白，原来有就叫迭代', 
            edit: true, required: true, type: 'select', select: supplierConst.SALE_PURPOSE_LIST},
        {field_id: 'link', label: '流程链接', type: 'link', info: '后面填供应商推品流程'},
        {field_id: 'schedule_confirm_time', label: '预计样品确认时间', type: 'date', info: '开发填'},
        {field_id: 'analyse_link', label: '市场分析表', info: '运营填-起订量 成本 毛利率', type: 'file'},
        {field_id: 'confirm_time', label: '实际样品到货时间', type: 'date', info: '发北京和杭州两边，运营助理填'},
        {field_id: 'order_time', label: '实际订货时间', type: 'date', info: '运营负责'},
        {field_id: 'arrived_time', label: '实际大货到货时间', type: 'date'},
        {field_id: 'expected_monthly_sales', label: '预计月销量', type: 'table', info: '各平台商品ID'},
        {field_id: 'goods_ids', label: '各平台上架完毕', type: 'table'},
        {field_id: 'product_img', label: '对应产品图片', edit: true, required: true, type: 'image'},
        {field_id: 'remark', label: '特殊备注/要求', 
            info: '主动跳转流程&自动生产表单', 
            edit: true, type: 'input'},
    ]
    return columns
}

supplierService.getData = async (limit, offset, params) => {
    const {data, total} = await supplierRecommendRepo.get(limit, offset, params)
    
    return {data, total}
}

supplierService.create = async (user_id, params) => {
    let goods = await supplierRecommendRepo.getByGoodsName(params.goods_name)
    if (goods?.length) return null
    params.recommend_time = moment(params.recommend_time).format('YYYY-MM-DD')
    const result = await supplierRecommendRepo.insert([
        user_id, 
        params.recommend_time, 
        params.brief_product_line, 
        params.first_category, 
        params.second_category,
        params.third_category,
        params.supplier,
        params.supplier_type,
        params.purchase_type,
        params.product_info,
        params.goods_name,
        params.goods_type,
        params.seasons,
        params.patent_belongs,
        params.patent_type,
        params.related,
        params.sale_purpose,
        params.product_img,
        params.remark
    ])
    if (result) {
        await pmEditLogRepo.insert([
            defaultConst.LOG_TYPE.INSERT,
            defaultConst.SUPPLIER,
            user_id,
            null,
            JSON.stringify({
                exploit_director: user_id, 
                recommend_time: params.recommend_time, 
                brief_product_line: params.brief_product_line, 
                first_category: params.first_category, 
                second_category: params.second_category,
                third_category: params.third_category,
                supplier: params.supplier,
                supplier_type: params.supplier_type,
                purchase_type: params.purchase_type,
                product_info: params.product_info,
                goods_name: params.goods_name,
                goods_type: params.goods_type,
                seasons: params.seasons,
                patent_belongs: params.patent_belongs,
                patent_type: params.patent_type,
                related: params.related,
                sale_purpose: params.sale_purpose,
                product_img: params.product_img,
                remark: params.remark
            })
        ])
    }
    return result
}

supplierService.update = async (user_id, id, params) => {
    let goods = await supplierRecommendRepo.getById(id)
    if (!goods?.length || goods[0].link != null) return null
    params.recommend_time = moment(params.recommend_time).format('YYYY-MM-DD')
    const result = await supplierRecommendRepo.update([
        params.recommend_time, 
        params.brief_product_line, 
        params.first_category, 
        params.second_category,
        params.third_category,
        params.supplier,
        params.supplier_type,
        params.purchase_type,
        params.product_info,
        params.goods_name,
        params.goods_type,
        params.seasons,
        params.patent_belongs,
        params.patent_type,
        params.related,
        params.sale_purpose,
        params.product_img,
        params.remark,
        id
    ])
    if (result) await pmEditLogRepo.insert([
        defaultConst.LOG_TYPE.UPDATE,
        defaultConst.SUPPLIER,
        user_id,
        JSON.stringify(goods[0]),
        JSON.stringify({
            recommend_time: params.recommend_time, 
            brief_product_line: params.brief_product_line, 
            first_category: params.first_category, 
            second_category: params.second_category,
            third_category: params.third_category,
            supplier: params.supplier,
            supplier_type: params.supplier_type,
            goods_name: params.goods_name,
            goods_type: params.goods_type,
            seasons: params.seasons,
            patent_belongs: params.patent_belongs,
            patent_type: params.patent_type,
            related: params.related,
            sale_purpose: params.sale_purpose,
            product_img: params.product_img,
            remark: params.remark,
            id
        })
    ])
    return result
}

supplierService.getById = async (id) => {
    const result = await supplierRecommendRepo.getById(id)
    return result?.length ? result[0] : null
}

supplierService.updateLink = async (id, link) => {
    const result = await supplierRecommendRepo.updateLink(id, link)
    return result
}

module.exports = supplierService;