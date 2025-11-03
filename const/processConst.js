const { template } = require("lodash")

const dColumns = [
    {header: '发起数量', field: 'development', hasChild: true, children: [
        {header: '正推数量', field: 'supplier', hasChild: false},
        {header: '反推数量', field: 'operator', hasChild: false},
        {header: 'IP数量', field: 'ip', hasChild: false},
        {header: '自研数量', field: 'self', hasChild: false},
    ]},
    {header: '询价数量', field: 'inquiry', hasChild: true, children: [
        {header: '反推数量', field: 'inquiry_operator', hasChild: true, children: [
            {header: '进行中', field: 'inquiry_running', hasChild: false},
            {header: '成功', field: 'inquiry_success', hasChild: false},
            {header: '失败', field: 'inquiry_fail', hasChild: false},
        ]},
        {header: '日常询价', field: 'enquiry', hasChild: true, children: [
            {header: '进行中', field: 'enquiry_running', hasChild: false},
            {header: '已完成', field: 'enquiry_finish', hasChild: false},
        ]},
    ]},
    {header: '设计监修', field: 'design_supervision', hasChild: true, children: [
        {header: '设计数量', field: 'design', hasChild: true, children: [
            {header: '进行中', field: 'design_running', hasChild: false},
            {header: '已完成', field: 'design_finish', hasChild: false},
        ]},
        {header: '监修数量', field: 'supervision', hasChild: true, children: [
            {header: '设计监修', field: 'sketch_supervision', hasChild: true, children: [
                {header: '进行中', field:  'sketch_running', hasChild: false},
                {header: '已完成', field:  'sketch_finish', hasChild: false},
            ]},
            {header: '样品监修', field: 'sample_supervision', hasChild: true, children: [
                {header: '进行中', field:  'sample_running', hasChild: false},
                {header: '已完成', field:  'sample_finish', hasChild: false},
            ]},
            {header: '视觉监修', field: 'vision_supervision', hasChild: true, children: [
                {header: '进行中', field:  'vision_running', hasChild: false},
                {header: '已完成', field:  'vision_finish', hasChild: false},
            ]},
            {header: '大货监修', field: 'product_supervision', hasChild: true, children: [
                {header: '进行中', field:  'product_running', hasChild: false},
                {header: '已完成', field:  'product_finish', hasChild: false},
            ]},
        ]},
    ]},
    {header: '寄样数量', field: 'send_sample', hasChild: true, children: [
        {header: '在途', field: 'in_transit', hasChild: false},
        {header: '已签收', field: 'receive', hasChild: false}
    ]},
    {header: '选品数量', field: 'select', hasChild: true, children: [
        {header: '市场分析', field: 'analysis', hasChild: true, children: [
            {header: '进行中', field: 'analysis_running', hasChild: false},
            {header: '已完成', field: 'analysis_finish', hasChild: false}
        ]},
        {header: '选中未选中', field: 'select_result', hasChild: true, children: [
            {header: '进行中', field: 'select_running', hasChild: false},
            {header: '选中', field: 'choose', hasChild: false},
            {header: '未选中', field: 'unchoose', hasChild: false},
        ]}
    ]},
    {header: '方案数量', field: 'plan', hasChild: true, children: [
        {header: '进行中', field: 'plan_running', hasChild: false},
        {header: '已完成', field: 'plan_finish', hasChild: false}
    ]},
    {header: '视觉数量', field: 'vision', hasChild: true, children: [
        {header: '正推数量', field: 'vision_supplier', hasChild: true, children: [
            {header: '原创', field: 'supplier_original', hasChild: true, children: [
                {header: '进行中', field: 'supplier_original_running', hasChild: false},
                {header: '已完成', field: 'supplier_original_finish', hasChild: false},
            ]},
            {header: '半原创', field: 'supplier_semi_original', hasChild: true, children: [
                {header: '进行中', field: 'supplier_semi_original_running', hasChild: false},
                {header: '已完成', field: 'supplier_semi_original_finish', hasChild: false},
            ]},
            {header: '非原创', field: 'supplier_unoriginal', hasChild: true, children: [
                {header: '进行中', field: 'supplier_unoriginal_running', hasChild: false},
                {header: '已完成', field: 'supplier_unoriginal_finish', hasChild: false},
            ]},
        ]},
        {header: '反推数量', field: 'vision_operator', hasChild: true, children: [
            {header: '原创', field: 'operator_original', hasChild: true, children: [
                {header: '进行中', field: 'operator_original_running', hasChild: false},
                {header: '已完成', field: 'operator_original_finish', hasChild: false},
            ]},
            {header: '半原创', field: 'operator_semi_original', hasChild: true, children: [
                {header: '进行中', field: 'operator_semi_original_running', hasChild: false},
                {header: '已完成', field: 'operator_semi_original_finish', hasChild: false},
            ]},
            {header: '非原创', field: 'operator_unoriginal', hasChild: true, children: [
                {header: '进行中', field: 'operator_unoriginal_running', hasChild: false},
                {header: '已完成', field: 'operator_unoriginal_finish', hasChild: false},
            ]},
        ]},
        {header: 'IP数量', field: 'vision_ip', hasChild: true, children: [
            {header: '原创', field: 'ip_original', hasChild: true, children: [
                {header: '进行中', field: 'ip_original_running', hasChild: false},
                {header: '已完成', field: 'ip_original_finish', hasChild: false},
            ]},
            {header: '半原创', field: 'ip_semi_original', hasChild: true, children: [
                {header: '进行中', field: 'ip_semi_original_running', hasChild: false},
                {header: '已完成', field: 'ip_semi_original_finish', hasChild: false},
            ]},
            {header: '非原创', field: 'ip_unoriginal', hasChild: true, children: [
                {header: '进行中', field: 'ip_unoriginal_running', hasChild: false},
                {header: '已完成', field: 'ip_unoriginal_finish', hasChild: false},
            ]},
        ]},
        {header: '自研数量', field: 'vision_self', hasChild: true, children: [
            {header: '原创', field: 'self_original', hasChild: true, children: [
                {header: '进行中', field: 'self_original_running', hasChild: false},
                {header: '已完成', field: 'self_original_finish', hasChild: false},
            ]},
            {header: '半原创', field: 'self_semi_original', hasChild: true, children: [
                {header: '进行中', field: 'self_semi_original_running', hasChild: false},
                {header: '已完成', field: 'self_semi_original_finish', hasChild: false},
            ]},
            {header: '非原创', field: 'self_unoriginal', hasChild: true, children: [
                {header: '进行中', field: 'self_unoriginal_running', hasChild: false},
                {header: '已完成', field: 'self_unoriginal_finish', hasChild: false},
            ]},
        ]},
    ]},
    {header: '采购数量', field: 'purchase', hasChild: true, children: [
        {header: '订货', field: 'order', hasChild: true, children: [
            {header: '进行中', field: 'order_running', hasChild: false},
            {header: '已完成', field: 'order_finish', hasChild: false},
        ]},
        {header: '仓库到货', field: 'warehousing', hasChild: true, children: [
            {header: '进行中', field: 'warehousing_running', hasChild: false},
            {header: '已完成', field: 'warehousing_finish', hasChild: false},
        ]}
    ]},
    {header: '上架数量', field: 'shelf', hasChild: true, children: [
        {header: '未上架', field: 'unshelf', hasChild: true, children: [
            {header: '事业1部', field: 'unshelf_division1', hasChild: false},
            {header: '事业2部', field: 'unshelf_division2', hasChild: false},
            {header: '事业3部', field: 'unshelf_division3', hasChild: false},
        ]},
        {header: '已上架', field: 'shelfed', hasChild: true, children: [
            {header: '事业1部', field: 'shelfed_division1', hasChild: false},
            {header: '事业2部', field: 'shelfed_division2', hasChild: false},
            {header: '事业3部', field: 'shelfed_division3', hasChild: false},
        ]}
    ]},
]

const rColumns = [
    {header: '发起数量', field: 'development', hasChild: true, children: [
        {header: '正推数量', field: 'supplier', hasChild: false},
        {header: '反推数量', field: 'operator', hasChild: false},
        {header: 'IP数量', field: 'ip', hasChild: false},
        {header: '自研数量', field: 'self', hasChild: false},
    ]},
    {header: '询价数量', field: 'inquiry', hasChild: true, children: [
        {header: '反推数量', field: 'inquiry_operator', hasChild: false},
        {header: '日常询价', field: 'enquiry', hasChild: false},
    ]},
    {header: '设计监修', field: 'design_supervision', hasChild: true, children: [
        {header: '设计数量', field: 'design', hasChild: false},
        {header: '监修数量', field: 'supervision', hasChild: true, children: [
            {header: '设计监修', field: 'sketch_supervision', hasChild: false},
            {header: '样品监修', field: 'sample_supervision', hasChild: false},
            {header: '视觉监修', field: 'vision_supervision', hasChild: false},
            {header: '大货监修', field: 'product_supervision', hasChild: false},
        ]},
    ]},
    {header: '寄样数量', field: 'send_sample', hasChild: true, children: [
        {header: '在途', field: 'in_transit', hasChild: false},
    ]},
    {header: '选品数量', field: 'select', hasChild: true, children: [
        {header: '市场分析', field: 'analysis', hasChild: true, children: [
            {header: '进行中', field: 'analysis_running', hasChild: false},
        ]},
        {header: '选中未选中', field: 'select_result', hasChild: true, children: [
            {header: '进行中', field: 'select_running', hasChild: false},
        ]},
    ]},
    {header: '方案数量', field: 'plan', hasChild: true, children: [
        {header: '进行中', field: 'plan_running', hasChild: false},
    ]},
    {header: '视觉数量', field: 'vision', hasChild: true, children: [
        {header: '正推数量', field: 'vision_supplier', hasChild: true, children: [
            {header: '原创', field: 'supplier_original', hasChild: true, children: [
                {header: '进行中', field: 'supplier_original_running', hasChild: false},
            ]},
            {header: '半原创', field: 'supplier_semi_original', hasChild: true, children: [
                {header: '进行中', field: 'supplier_semi_original_running', hasChild: false},
            ]},
            {header: '非原创', field: 'supplier_unoriginal', hasChild: true, children: [
                {header: '进行中', field: 'supplier_unoriginal_running', hasChild: false},
            ]},
        ]},
        {header: '反推数量', field: 'vision_operator', hasChild: true, children: [
            {header: '原创', field: 'operator_original', hasChild: true, children: [
                {header: '进行中', field: 'operator_original_running', hasChild: false},
            ]},
            {header: '半原创', field: 'operator_semi_original', hasChild: true, children: [
                {header: '进行中', field: 'operator_semi_original_running', hasChild: false},
            ]},
            {header: '非原创', field: 'operator_unoriginal', hasChild: true, children: [
                {header: '进行中', field: 'operator_unoriginal_running', hasChild: false},
            ]},
        ]},
        {header: 'IP数量', field: 'vision_ip', hasChild: true, children: [
            {header: '原创', field: 'ip_original', hasChild: true, children: [
                {header: '进行中', field: 'ip_original_running', hasChild: false},
            ]},
            {header: '半原创', field: 'ip_semi_original', hasChild: true, children: [
                {header: '进行中', field: 'ip_semi_original_running', hasChild: false},
            ]},
            {header: '非原创', field: 'ip_unoriginal', hasChild: true, children: [
                {header: '进行中', field: 'ip_unoriginal_running', hasChild: false},
            ]},
        ]},
        {header: '自研数量', field: 'vision_self', hasChild: true, children: [
            {header: '原创', field: 'self_original', hasChild: true, children: [
                {header: '进行中', field: 'self_original_running', hasChild: false},
            ]},
            {header: '半原创', field: 'self_semi_original', hasChild: true, children: [
                {header: '进行中', field: 'self_semi_original_running', hasChild: false},
            ]},
            {header: '非原创', field: 'self_unoriginal', hasChild: true, children: [
                {header: '进行中', field: 'self_unoriginal_running', hasChild: false},
            ]},
        ]},
    ]},
    {header: '采购数量', field: 'purchase', hasChild: true, children: [
        {header: '订货', field: 'order', hasChild: true, children: [
            {header: '进行中', field: 'order_running', hasChild: false},
        ]},
        {header: '仓库到货', field: 'warehousing', hasChild: true, children: [
            {header: '进行中', field: 'warehousing_running', hasChild: false},
        ]}
    ]},
    {header: '上架数量', field: 'shelf', hasChild: true, children: [
        {header: '未上架', field: 'unshelf', hasChild: true, children: [
            {header: '事业1部', field: 'unshelf_division1', hasChild: false},
            {header: '事业2部', field: 'unshelf_division2', hasChild: false},
            {header: '事业3部', field: 'unshelf_division3', hasChild: false},
        ]},
    ]},
]

const defaultColumns = [
    {header: '日期', field: 'date'},
    {header: '排序', field: 'sort'},
    {header: '推品名称', field: 'name'},
    {header: '部门', field: 'dept'},
    {header: '类目', field: 'categories'},
    {header: '产品销售季节', field: 'seasons'},
    {header: '相关联的产品类型和节日', field: 'related'},
    {header: '推品图片', field: 'image'},
    {header: '产品线简称', field: 'brief_name'},
    {header: '采购形式', field: 'purchase_type'},
    {header: '供应商名称', field: 'supplier'},
    {header: '供应商属性', field: 'supplier_type'},
    {header: '产品信息', field: 'product_info'},
    {header: '产品属性', field: 'product_type'},
    {header: '专利归属', field: 'patent_belongs'},
    {header: '专利二级', field: 'patent_type'},
    {header: '产品销售目的', field: 'sale_purpose'},
    {header: '市场分析', field: 'analysis'},
    {header: '部门选择', field: 'develop_type'},
    {header: '市场分析名称', field: 'analysis_name'},
    {header: '立项性质', field: 'project_type'},
    {header: '设计定义', field: 'design_type'},
    {header: '产品开发性质', field: 'exploitation_features'},
    {header: '核心立项理由', field: 'core_reasons'},
    {header: '预计开发周期(大货时间)', field: 'schedule_arrived_time'},
    {header: '预计样品确认时间', field: 'schedule_confirm_time'},
    {header: '是否需要自主设计', field: 'is_self'},
    {header: '样品图片', field: 'sample_image'},
    {header: '设计草图', field: 'design_image'},
    {header: 'spu', field: 'spu'},
    {header: '商品编码', field: 'sku_code'},
    {header: '推品类型', field: 'type'},
    {header: '开发人', field: 'developer'},
    {header: '发起人', field: 'starter'},
    {header: '非京东流程状态', field: 'status'},
    {header: '非京东是否选中', field: 'is_select'},
    {header: '京东流程状态', field: 'jd_status'},
    {header: '京东是否选中', field: 'jd_is_select'},
    {header: '事业1部是否选中', field: 'first_select'},
    {header: '事业2部是否选中', field: 'second_select'},
    {header: '事业3部是否选中', field: 'third_select'},
    {header: '订货方式', field: 'order_type'},
    {header: '视觉方式', field: 'vision_type'},
    {header: '京东视觉方式', field: 'jd_vision_type'},
    {header: '选中平台', field: 'select_project'},
    {header: '订货数量', field: 'order_num'},
    {header: '京东订货数量', field: 'jd_order_num'},
    {header: '爆款方案负责人', field: 'operator'},
    {header: '京东爆款方案负责人', field: 'jd_operator'},
    {header: '子流程运行节点', field: 'running_node'},
    {header: '京东子流程运行节点', field: 'jd_running_node'},
    {header: '事业1部填写上架ID', field: 'first_goods_id'},
    {header: '事业2部填写上架ID', field: 'second_goods_id'},
    {header: '事业3部填写上架ID', field: 'third_goods_id'},
    {header: '特殊备注', field: 'remark'},
]

const statusList = {
    DEVELOPMENT_CHECK: '开发审核中',
    SAMPLE: '寄样中',
    ANALYSIS: '市场分析中',
    SAMPLE_CHECK: '样品审核中',
    REVIEW: '企划审核中',
    DESIGN_PROPOSAL: '爆款方案设计中',
    VISION_DESIGN: '视觉设计中',
    PURCHASE: '订货中',
    FIRST_SHELF: '事业1部上架中',
    SECOND_SHELF: '事业2部上架中',
    THIRD_SHELF: '事业3部上架中',
    END: '结束'
}

const previousUrl = 'https://bi.pakchoice.cn/bi/#/process/development/detail?uid='

const typeList = {
    SUPPLIER: '供应商推品',
    OPERATOR: '反推推品',
    IP: 'IP推品',
    SELF: '自研推品'
}

const jdStatusList = {
    TRUE: '是',
    FALSE: '否'
}

const analysisStatusList = {
    TRUE: '选中',
    FALSE: '未选中'
}

const sampleCheckStatusList = {
    TRUE: '是',
    FALSE: '否'
}

//开发审核
const developCheckProcess = {
    name: '开发审核子流程',
    key: 'tpkfsh',
    template: {
        SUPPLIER: [
            {name: 'link', key: 'Fcbymgq06n79djc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Fk0lmgyqg4d4abc', type: 'string'}, //推品ID
            {name: 'is_jd', key: 'F42amhbc86o9abc', type: 'string'}, //平台是否为京东
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'supplier', key: 'Fjmzma23l2ijaqc', type: 'string'}, //供应商名称
            {name: 'supplier_type', key: 'Fm06ma23og1vatc', type: 'string'}, //供应商属性
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'purchase_type', key: 'Fwtwma23p8z0awc', type: 'string'}, //采购形式
            {name: 'product_info', key: 'Cfidxjr5rmafj', type: 'array'}, //产品信息
            {name: 'name', key: 'Frrima23qogmb1c', type: 'string'}, //推品名称
            {name: 'product_type', key: 'Fo44ma23r183b4c', type: 'string'}, //产品属性
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'patent_belongs', key: 'Fhkzmh8jyy2iabc', type: 'string'}, //供应商-专利归属
            {name: 'patent_type', key: 'F0hlmh8jzu74agc', type: 'string'}, //供应商-专利-二级
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
        ],
        OPERATOR: [
            {name: 'link', key: 'Fcbymgq06n79djc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Fk0lmgyqg4d4abc', type: 'string'}, //推品ID
            {name: 'is_jd', key: 'F42amhbc86o9abc', type: 'string'}, //平台是否为京东
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'project', key: 'Fj1ama2csbpoabc', type: 'string'}, //运营事业部
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'starter', key: 'Cfidxhbnf9y0v', type: 'string'}, //反推运营发起人
            {name: 'name', key: 'Frb5mh49hqdbbfc', type: 'string'}, //参考-产品简称
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
        ],
        IP: [
            {name: 'link', key: 'Fcbymgq06n79djc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Fk0lmgyqg4d4abc', type: 'string'}, //推品ID
            {name: 'is_jd', key: 'F42amhbc86o9abc', type: 'string'}, //平台是否为京东
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'develop_type', key: 'Fqw8mh4i6lfofmc', type: 'string'}, //ip-运营事业部
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'analysis_name', key: 'Fxtjmh480hmtanc', type: 'string'}, //市场分析名称
            {name: 'name', key: 'F22pmh481rgdaqc', type: 'string'}, //立项产品名称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'project_type', key: 'Fkg9mh49t15ibic', type: 'string'}, //立项性质
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
        ],
        SELF: [
            {name: 'link', key: 'Fcbymgq06n79djc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Fk0lmgyqg4d4abc', type: 'string'}, //推品ID
            {name: 'is_jd', key: 'F42amhbc86o9abc', type: 'string'}, //平台是否为京东
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'dept', key: 'Fo8omh482d6matc', type: 'string'}, //推品选择
            {name: 'project', key: 'Fj1ama2csbpoabc', type: 'string'}, //运营事业部
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'analysis_name', key: 'Fxtjmh480hmtanc', type: 'string'}, //市场分析名称
            {name: 'name', key: 'F22pmh481rgdaqc', type: 'string'}, //立项产品名称
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'product_info', key: 'Cfidxjr5rmafj', type: 'array'}, //产品信息
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'patent_belongs', key: 'Fnikma23se58bac', type: 'string'}, //自研-专利归属
            {name: 'patent_type', key: 'Far4ma23t91qbdc', type: 'string'}, //自研-专利-二级
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'design_type', key: 'F5b2mh48usp0awc', type: 'string'}, //设计定义
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'exploitation_features', key: 'Fpeumh492ui7b1c', type: 'string'}, //产品开发性质
            {name: 'core_reasons', key: 'F17dmh49433bb4c', type: 'string'}, //核心立项理由
            {name: 'schedule_confirm_time', key: 'Fn8ema24ab8zbmc', type: 'string'}, //预计样品确认时间
            {name: 'schedule_arrived_time', key: 'F8d3mh494ws9b7c', type: 'string'}, //预计开发周期（大货时间）
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
            {name: 'is_self', key: 'Fklmmgyslee2brc', type: 'string'}, //自研-是否需要自主设计
        ]
    },
    column: {
        developer: {
            DEFAULT: 'Cfidc8ey7qjvn', //供应商推品，IP推品，自研推品
            OTHER: ['Cfidc8ey7qjvn', 'Feghmgyr8ln7b7c', 'Ftp3mgyr8lwzbac', 'Cfidbyd3d4sw9'], //反推推品，先匹配上的就是
        },
        is_jd: 'F42amhbc86o9abc'
    }
}
//京东分析
const jdAnalysisProcess = {
    name: '京东单独分析流程',
    key: 'jingdongdandulc',
    template: {
        SUPPLIER: [
            {name: 'link', key: 'Fzi4mdzl18yeadc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Ft3zmgyy0j1vi0c', type: 'string'}, //推品ID
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'supplier', key: 'Fjmzma23l2ijaqc', type: 'string'}, //供应商名称
            {name: 'supplier_type', key: 'Fm06ma23og1vatc', type: 'string'}, //供应商属性
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'purchase_type', key: 'Fwtwma23p8z0awc', type: 'string'}, //采购形式
            {name: 'product_info', key: 'Cfidxjr5rmafj', type: 'array'}, //产品信息
            {name: 'name', key: 'Frrima23qogmb1c', type: 'string'}, //推品名称
            {name: 'product_type', key: 'Fo44ma23r183b4c', type: 'string'}, //产品属性
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'patent_belongs', key: 'Fhkzmh8jyy2iabc', type: 'string'}, //供应商-专利归属
            {name: 'patent_type', key: 'F0hlmh8jzu74agc', type: 'string'}, //供应商-专利-二级
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
        ],
        OPERATOR: [
            {name: 'link', key: 'Fzi4mdzl18yeadc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Ft3zmgyy0j1vi0c', type: 'string'}, //推品ID
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'project', key: 'Fj1ama2csbpoabc', type: 'string'}, //运营事业部
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'name', key: 'Frb5mh49hqdbbfc', type: 'string'}, //参考-产品简称
            {name: 'starter', key: 'Cfidxhbnf9y0v', type: 'string'}, //反推运营发起人
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
        ],
        IP: [
            {name: 'link', key: 'Fzi4mdzl18yeadc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Ft3zmgyy0j1vi0c', type: 'string'}, //推品ID
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'develop_type', key: 'Fqw8mh4i6lfofmc', type: 'string'}, //ip-运营事业部
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'analysis_name', key: 'Fxtjmh480hmtanc', type: 'string'}, //市场分析名称
            {name: 'name', key: 'F22pmh481rgdaqc', type: 'string'}, //立项产品名称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'project_type', key: 'Fkg9mh49t15ibic', type: 'string'}, //立项性质
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
        ],
        SELF: [
            {name: 'link', key: 'Fzi4mdzl18yeadc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Ft3zmgyy0j1vi0c', type: 'string'}, //推品ID
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'project', key: 'Fj1ama2csbpoabc', type: 'string'}, //运营事业部
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'analysis_name', key: 'Fxtjmh480hmtanc', type: 'string'}, //市场分析名称
            {name: 'name', key: 'F22pmh481rgdaqc', type: 'string'}, //立项产品名称
            {name: 'dept', key: 'Fo8omh482d6matc', type: 'string'}, //推品选择
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'product_info', key: 'Cfidxjr5rmafj', type: 'array'}, //产品信息
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'patent_belongs', key: 'Fnikma23se58bac', type: 'string'}, //自研-专利归属
            {name: 'patent_type', key: 'Far4ma23t91qbdc', type: 'string'}, //自研-专利-二级
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'design_type', key: 'F5b2mh48usp0awc', type: 'string'}, //设计定义
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'exploitation_features', key: 'Fpeumh492ui7b1c', type: 'string'}, //产品开发性质
            {name: 'core_reasons', key: 'F17dmh49433bb4c', type: 'string'}, //核心立项理由
            {name: 'schedule_confirm_time', key: 'Fn8ema24ab8zbmc', type: 'string'}, //预计样品确认时间
            {name: 'schedule_arrived_time', key: 'F8d3mh494ws9b7c', type: 'string'}, //预计开发周期（大货时间）
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
            {name: 'is_self', key: 'Fklmmgyslee2brc', type: 'string'}, //自研-是否需要自主设计
        ]
    },
    column: {
        select: 'Fenomgq6rp5jaic', //京东是否选中
        spu: 'Fsccmh1rkh4xb6c',
        sku_code: 'Fj2rmh1rras9bcc',
    }
}
//非京东分析
const analysisProcess = {
    name: '事业部运营处理',
    key: 'syybyycl',
    template: {
        SUPPLIER: [
            {name: 'link', key: 'Fu8pmha7hfm4azc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Fk3qmgyy0u6ii3c', type: 'string'}, //推品ID
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'supplier', key: 'Fjmzma23l2ijaqc', type: 'string'}, //供应商名称
            {name: 'supplier_type', key: 'Fm06ma23og1vatc', type: 'string'}, //供应商属性
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'purchase_type', key: 'Fwtwma23p8z0awc', type: 'string'}, //采购形式
            {name: 'product_info', key: 'Cfidxjr5rmafj', type: 'array'}, //产品信息
            {name: 'name', key: 'Frrima23qogmb1c', type: 'string'}, //推品名称
            {name: 'product_type', key: 'Fo44ma23r183b4c', type: 'string'}, //产品属性
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'patent_belongs', key: 'Fhkzmh8jyy2iabc', type: 'string'}, //供应商-专利归属
            {name: 'patent_type', key: 'F0hlmh8jzu74agc', type: 'string'}, //供应商-专利-二级
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
        ],
        OPERATOR: [
            {name: 'link', key: 'Fu8pmha7hfm4azc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Fk3qmgyy0u6ii3c', type: 'string'}, //推品ID
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'project', key: 'Fj1ama2csbpoabc', type: 'string'}, //运营事业部
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'starter', key: 'Cfidxhbnf9y0v', type: 'string'}, //反推运营发起人
            {name: 'name', key: 'Frb5mh49hqdbbfc', type: 'string'}, //参考-产品简称
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
        ],
        IP: [
            {name: 'link', key: 'Fu8pmha7hfm4azc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Fk3qmgyy0u6ii3c', type: 'string'}, //推品ID
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'develop_type', key: 'Fqw8mh4i6lfofmc', type: 'string'}, //ip-运营事业部
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'analysis_name', key: 'Fxtjmh480hmtanc', type: 'string'}, //市场分析名称
            {name: 'name', key: 'F22pmh481rgdaqc', type: 'string'}, //立项产品名称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'project_type', key: 'Fkg9mh49t15ibic', type: 'string'}, //立项性质
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
        ],
        SELF: [
            {name: 'link', key: 'Fu8pmha7hfm4azc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Fk3qmgyy0u6ii3c', type: 'string'}, //推品ID
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'dept', key: 'Fo8omh482d6matc', type: 'string'}, //推品选择
            {name: 'project', key: 'Fj1ama2csbpoabc', type: 'string'}, //运营事业部
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'analysis_name', key: 'Fxtjmh480hmtanc', type: 'string'}, //市场分析名称
            {name: 'name', key: 'F22pmh481rgdaqc', type: 'string'}, //立项产品名称
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'product_info', key: 'Cfidxjr5rmafj', type: 'array'}, //产品信息
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'patent_belongs', key: 'Fnikma23se58bac', type: 'string'}, //自研-专利归属
            {name: 'patent_type', key: 'Far4ma23t91qbdc', type: 'string'}, //自研-专利-二级
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'design_type', key: 'F5b2mh48usp0awc', type: 'string'}, //设计定义
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'exploitation_features', key: 'Fpeumh492ui7b1c', type: 'string'}, //产品开发性质
            {name: 'core_reasons', key: 'F17dmh49433bb4c', type: 'string'}, //核心立项理由
            {name: 'schedule_confirm_time', key: 'Fn8ema24ab8zbmc', type: 'string'}, //预计样品确认时间
            {name: 'schedule_arrived_time', key: 'F8d3mh494ws9b7c', type: 'string'}, //预计开发周期（大货时间）
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
            {name: 'is_self', key: 'Fklmmgyslee2brc', type: 'string'}, //自研-是否需要自主设计
        ]
    },
    column: {
        spu: 'F8vtmh1rabocaoc', //SPU编码
        sku_code: 'Flj7mh1rv211c7c', //商品信息
        first_operator: 'Fmmzmh0akzapfzc', //事业一部运营负责人
        second_operator: 'Fd32mh0al3ong8c', //事业二部运营负责人
        third_operator: 'Fqdrmh0alxwfhnc', //事业三部运营负责人
        first_select: 'Fsv5mh0alew7goc', //事业一部是否选中
        second_select: 'Fyaemh0altj3hec', //事业二部是否选中
        third_select: 'F1njmh0am7wai9c', //事业三部是否选中
    }
}
//寄样
const sampleProcess = {
    name: '样品确认',
    key: 'yangpinqueren',
    template: {
        link: 'Fsinmgrcl5cjbxc', //推品流程链接
        uid: 'Fv91mgytu56dc0c', //推品ID
        is_jd: 'Ftz0mhbcdd9kg2c', //平台是否为京东
        starter: 'Cfidxsy6tgg07', //推品发起人
        type: 'F4fymgytui22c3c', //推品类型
        project: 'Fj1ama2csbpoabc', //运营事业部
        product_info: 'Cfid3wew07ks5', //产品信息
        developer: 'Cfidse9vqk8s0', //开发负责人
    }, 
    column: {
        design_image: 'Cfidqoplfioe7', //上传定稿图以及上传链图云
        sample_image: 'Cfide75io34yh', //上传样品图片
        first_select: 'Fa1pmh0dojf2avc', //事业一部样品是否选中
        second_select: 'Ffysmh0dpc11ayc', //事业二部样品是否选中
        third_select: 'Fnx0mh0dpdy6b1c', //事业三部样品是否选中
    }
}
//样品选中
const sampleCheckProcess = {
    name: '事业部样品是否选中',
    key: 'shiyebuypsfxz',
    template: {
        link: 'Fynzmh0dnxkxamc', //推品链接
        uid: 'Fm78mh0do7scapc', //推品ID
        is_jd: 'F2ulmhbed5q5afc', //平台是否为京东
        first_operator: 'Cfidp40swqz3p', //事业一部运营
        second_operator: 'Cfid6i9jrcauc', //事业二部运营
        third_operator: 'Cfidj9fr4p35j', //事业三部运营
    }
}
//企划审核
const reviewProcess = {
    name: '企划审核子流程',
    key: 'qihuashenhe',
    template: {
        SUPPLIER: [
            {name: 'link', key: 'F2d9mgyxligkcvc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Frejmgyxld64csc', type: 'string'}, //推品ID
            {name: 'is_jd', key: 'F0q3mhbcamtaakc', type: 'string'}, //平台是否为京东
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'supplier', key: 'Fjmzma23l2ijaqc', type: 'string'}, //供应商名称
            {name: 'supplier_type', key: 'Fm06ma23og1vatc', type: 'string'}, //供应商属性
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'purchase_type', key: 'Fwtwma23p8z0awc', type: 'string'}, //采购形式
            {name: 'product_info', key: 'Cfidxjr5rmafj', type: 'array'}, //产品信息
            {name: 'name', key: 'Frrima23qogmb1c', type: 'string'}, //推品名称
            {name: 'product_type', key: 'Fo44ma23r183b4c', type: 'string'}, //产品属性
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'patent_belongs', key: 'Fnikma23se58bac', type: 'string'}, //专利归属
            {name: 'patent_type', key: 'Far4ma23t91qbdc', type: 'string'}, //专利-二级
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
            {name: 'sample_image', key: 'Cfidp9oyk2a2b', type: 'array'}, //样品图片
        ],
        OPERATOR: [
            {name: 'link', key: 'F2d9mgyxligkcvc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Frejmgyxld64csc', type: 'string'}, //推品ID
            {name: 'is_jd', key: 'F0q3mhbcamtaakc', type: 'string'}, //平台是否为京东
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'project', key: 'Fj1ama2csbpoabc', type: 'string'}, //运营事业部
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'starter', key: 'Cfidxhbnf9y0v', type: 'string'}, //反推运营发起人
            {name: 'name', key: 'Frb5mh49hqdbbfc', type: 'string'}, //参考-产品简称
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
            {name: 'sample_image', key: 'Cfidp9oyk2a2b', type: 'array'}, //样品图片
        ],
        IP: [
            {name: 'link', key: 'F2d9mgyxligkcvc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Frejmgyxld64csc', type: 'string'}, //推品ID
            {name: 'is_jd', key: 'F0q3mhbcamtaakc', type: 'string'}, //平台是否为京东
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'develop_type', key: 'F77hmh4ibi7ig9c', type: 'string'}, //ip-运营事业部
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'analysis_name', key: 'Fxtjmh480hmtanc', type: 'string'}, //市场分析名称
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'patent_belongs', key: 'Fnikma23se58bac', type: 'string'}, //专利归属
            {name: 'patent_type', key: 'Far4ma23t91qbdc', type: 'string'}, //专利-二级
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'project_type', key: 'Fkg9mh49t15ibic', type: 'string'}, //立项性质
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
            {name: 'sample_image', key: 'Cfidp9oyk2a2b', type: 'array'}, //样品图片
            {name: 'design_image', key: 'Cfidh88j1whmf', type: 'array'}, //草图文件
        ],
        SELF: [
            {name: 'link', key: 'F2d9mgyxligkcvc', type: 'string'}, //推品流程链接
            {name: 'uid', key: 'Frejmgyxld64csc', type: 'string'}, //推品ID
            {name: 'is_jd', key: 'F0q3mhbcamtaakc', type: 'string'}, //平台是否为京东
            {name: 'type', key: 'F3ecmgyqgfo5aec', type: 'string'}, //推品类型
            {name: 'start_time', key: 'Fcq6ma23efriabc', type: 'string'}, //推品日期
            {name: 'analysis_name', key: 'Fxtjmh480hmtanc', type: 'string'}, //市场分析名称
            {name: 'dept', key: 'Fo8omh482d6matc', type: 'string'}, //推品选择
            {name: 'brief_name', key: 'Fncjma23ezl8aec', type: 'string'}, //产品线简称
            {name: 'categories', key: 'Foaomaknt8tlbec', type: 'array'}, //类目选择
            {name: 'product_info', key: 'Cfidxjr5rmafj', type: 'array'}, //产品信息
            {name: 'seasons', key: 'Fq19ma23rgucb7c', type: 'string'}, //产品销售季节
            {name: 'patent_belongs', key: 'Fnikma23se58bac', type: 'string'}, //专利归属
            {name: 'patent_type', key: 'Far4ma23t91qbdc', type: 'string'}, //专利-二级
            {name: 'related', key: 'Fkuqma23u690bgc', type: 'string'}, //相关联的产品类型和节日
            {name: 'design_type', key: 'F5b2mh48usp0awc', type: 'string'}, //设计定义
            {name: 'analysis', key: 'Cfidsxy1qboon', type: 'array'}, //市场分析表
            {name: 'sale_purpose', key: 'Fubjma23x7kvbjc', type: 'string'}, //产品销售目的
            {name: 'exploitation_features', key: 'Fpeumh492ui7b1c', type: 'string'}, //产品开发性质
            {name: 'core_reasons', key: 'F17dmh49433bb4c', type: 'string'}, //核心立项理由
            {name: 'schedule_confirm_time', key: 'Fn8ema24ab8zbmc', type: 'string'}, //预计样品确认时间
            {name: 'schedule_arrived_time', key: 'F8d3mh494ws9b7c', type: 'string'}, //预计开发周期（大货时间）
            {name: 'remark', key: 'Fb35mai7b790duc', type: 'string'}, //特殊备注
            {name: 'image', key: 'Cfidv84ga4ncy', type: 'array'}, //对应产品图
            {name: 'sample_image', key: 'Cfidp9oyk2a2b', type: 'array'}, //样品图片
            {name: 'design_image', key: 'Cfidh88j1whmf', type: 'array'}, //草图文件
        ]
    },
    column: {
        is_jd: 'F0q3mhbcamtaakc',
        select_project: 'Fsixmh1eq8k0abc', //选中平台
        purchase_type: 'Fu53mgss019jaec', //产品采购
        vision_type: 'Ffammh909z1i19gc', //视觉类型
        division: 'Fh0nmgq916jwdkc', //选择做爆款方案的事业部
    }
}
//爆款
const designProposalProcess = {
    name: '爆款方案流程-新版测试',
    key: 'baokuanliuchengxb_copyceshi',
    template: {
        uid: 'Fnjimgyxzryshxc', //推品ID
        link: 'Frd7mdi5wj7jabc', //推品流程名称
        name: 'Fdmhmenm902qaec', //推品名称
        is_jd: 'Fvikmhbc9e7baec', //平台是否为京东
        division: 'Fdmmmdcgbkkwffc', //所属事业部
        first_select: 'Fnpsmgrc8mogdyc', //事业一部是否选中
        second_select: 'Fqbhmgrc9nb7e4c', //事业二部是否选中
        third_select: 'Fc2smgrc9m8je1c', //事业三部是否选中
    }, 
    column: {
        operator: 'Cfidclaxyqgv7', //爆款方案负责人
        link_type: 'radioField_lxkb9f8z', //链接类别
    }
}
//视觉
const visionDesignProcess = {
    name: '新版-视觉+美编测试流程',
    key: 'xbsjmblc_copy',
    template: {
        link: 'Fe5jmh90dpix1kac', //推品链接
        uid: 'Fof3mh90dfxz1k7c', //推品ID
        is_jd: 'F49gmhbcbkvafzc', //平台是否为京东
        vision_type: 'Fu1smh90e1zr1kdc', //视觉设计类型
        name: 'textField_lxkb9f8v', //任务名称
        project: 'radioField_lxkb9f93', //平台
        operator: 'Cfidclaxyqgv7', //运营负责人
        link_type: 'radioField_lxkb9f8z', //链接类别
        developer: 'Cfidrgjn4t0r9', //开发负责人
        image: 'Cfidnewwzhdez', //产品图片
    }
}
//非京东订货
const purchaseProcess = {
    name: '订货-测试',
    key: 'kjdinghuo',
    template: {
        uid: 'F7szmgyyqjurjxc', //推品ID
        link: 'Fma2mgqdmprkisc', //推品链接
        type: 'Fj1pmgyyqtwlk0c', //推品类型
        purchase_type: 'F1kjmgzvp2bndjc', //产品采购
        developer: 'Cfiduasygcb6r', //开发负责人
        first_select: 'Ffvbmgrbq6modjc', //事业一部是否选中
        second_select: 'Fxenmgrbret1dvc', //事业二部是否选中
        third_select: 'F5armgrbre9hdsc', //事业三部是否选中
    },
    column: {
        order_num: 'Fo5uma263lluhdc', //实际订货量
    }
}
//京东订货
const jdPurchaseProcess = {
    name: '京东订货流程',
    key: 'jingdongdhlc',
    template: {
        uid: 'Ft3zmgyy0j1vi0c', //推品ID
        link: 'Fzi4mdzl18yeadc', //推品链接
        type: 'Fj1pmgyyqtwlk0c', //推品类型
        operator: 'Cfidqh6mjooo7', //运营负责人
        spu: 'F2vpmh1f7x61atc', //SPU编码
        developer: 'employeeField_lxn38ajk', //开发负责人
    },
    column: {
        order_num: 'Fvzmmej9wzunabc'
    }
}
//上架
const shelfProcess = {
    name: '上架流程-测试',
    key: 'sjlcqpt_copy',
    template: {
        link: 'F49ymgt1p3gnabc', //推品链接
        uid: 'Fif0mh9wa9auabc', //推品ID
        project: 'Fsixmh1eq8k0abc', //上架平台
        developer: 'Fgxsmhbmolq1vsc', //开发负责人
        link_type: 'F9ujm99rbh1o1i2c', //链接属性
    }, 
    column: {
        pdd: 'F6fkm99rjy981ibc', //拼多多上架链接ID
        tmcs: 'F3i8mhabudfib5c', //天猫超市上架链接ID
        coupang: 'Fs6tmhabud6eb2c', //coupang上架链接ID
        jd: 'F166mhabucr2azc', //京东上架链接ID
        dy: 'F0damhabucfaawc', //抖音上架链接ID
        ks: 'F2u3mhabuc4uatc', //快手上架链接ID
        dw: 'Fyy9mhabubtiaqc', //得物上架链接ID
        vip: 'Fxwzmhabubiuanc', //唯品会上架链接ID
        xhs: 'Fdzemhabub6uakc', //小红书上架链接ID
        '1688': 'Fze4mhabuaviahc', //1688上架链接ID
        tm: 'Fvt2mhabuakmaec', //天猫上架链接ID
        tgc: 'Fz01mhabua6nabc', //淘工厂上架链接ID
    }
}

module.exports = {
    dColumns,
    rColumns,
    defaultColumns,
    previousUrl,
    statusList,
    typeList,
    jdStatusList,
    developCheckProcess,
    jdAnalysisProcess,
    analysisProcess,
    sampleProcess,
    sampleCheckProcess,
    reviewProcess,
    designProposalProcess,
    visionDesignProcess,
    purchaseProcess,
    jdPurchaseProcess,
    shelfProcess,
    analysisStatusList,
    sampleCheckStatusList
}