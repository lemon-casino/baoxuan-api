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
            {header: '半原创', field: 'supplier_half_original', hasChild: true, children: [
                {header: '进行中', field: 'supplier_half_original_running', hasChild: false},
                {header: '已完成', field: 'supplier_half_original_finish', hasChild: false},
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
            {header: '半原创', field: 'operator_half_original', hasChild: true, children: [
                {header: '进行中', field: 'operator_half_original_running', hasChild: false},
                {header: '已完成', field: 'operator_half_original_finish', hasChild: false},
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
            {header: '半原创', field: 'ip_half_original', hasChild: true, children: [
                {header: '进行中', field: 'ip_half_original_running', hasChild: false},
                {header: '已完成', field: 'ip_half_original_finish', hasChild: false},
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
            {header: '半原创', field: 'self_half_original', hasChild: true, children: [
                {header: '进行中', field: 'self_half_original_running', hasChild: false},
                {header: '已完成', field: 'self_half_original_finish', hasChild: false},
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
            {header: '原创', field: 'original', hasChild: false},
            {header: '半原创', field: 'half_original', hasChild: false},
            {header: '非原创', field: 'unoriginal', hasChild: false},
        ]},
        {header: '反推数量', field: 'vision_operator', hasChild: true, children: [
            {header: '原创', field: 'original', hasChild: false},
            {header: '半原创', field: 'half_original', hasChild: false},
            {header: '非原创', field: 'unoriginal', hasChild: false},
        ]},
        {header: 'IP数量', field: 'vision_ip', hasChild: true, children: [
            {header: '原创', field: 'original', hasChild: false},
            {header: '半原创', field: 'half_original', hasChild: false},
            {header: '非原创', field: 'unoriginal', hasChild: false},
        ]},
        {header: '自研数量', field: 'vision_self', hasChild: true, children: [
            {header: '原创', field: 'original', hasChild: false},
            {header: '半原创', field: 'half_original', hasChild: false},
            {header: '非原创', field: 'unoriginal', hasChild: false},
        ]},
    ]},
    {header: '采购数量', field: 'purchase', hasChild: true, children: [
        {header: '订货', field: 'order', hasChild: false},
        {header: '仓库到货', field: 'warehousing', hasChild: false}
    ]},
    {header: '上架数量', field: 'shelf', hasChild: true, children: [
        {header: '事业1部', field: 'division1', hasChild: false},
        {header: '事业2部', field: 'division2', hasChild: false},
        {header: '事业3部', field: 'division3', hasChild: false},
    ]},
]

const defaultColumns = [
    {header: '日期', field: 'date'},
    {header: '排序', field: 'sort'},
    {header: '推品名称', field: 'name'},
    {header: 'spu', field: 'spu'},
    {header: '商品编码', field: 'sku_code'},
    {header: '推品类型', field: 'type'},
    {header: '推品图片', field: 'image'},
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
    }
}

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
    }
}

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
    }
}

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
        beijing_designer: 'Cfidh094smzvc', //北京设计执行人
        beijing_image: 'Cfid0d4esotgv', //北京上传设计草图
        hangzhou_designer: 'Cfidvz9j0x697', //杭州设计执行人
        hangzhou_image: 'Cfiddnd4msbib', //杭州上传设计草图
        designer: 'Cfidl1n5ply0l', //设计完整执行人 
        design_image: 'Fxwqmgyu4t19cgc', //选择确认使用设计草图
        design_duration: 'Fjzkmgyu5c67cjc', //产品及包装设计周期
        image: 'Cfidqoplfioe7', //上传定稿图以及上传链图云
        developer: 'Cfidse9vqk8s0', //开发负责人
        sample_image: 'Cfide75io34yh', //上传样品图片
    }
}

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
    }
}

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
    }
}

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
    }
}

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
    }
}

const shelfProcess = {
    name: '上架流程-测试',
    key: 'sjlcqpt_copy',
    template: {
        link: 'F49ymgt1p3gnabc', //推品链接
        uid: 'Fif0mh9wa9auabc', //推品ID
        project: 'Fsixmh1eq8k0abc', //上架平台
        developer: 'Fgxsmhbmolq1vsc', //开发负责人
        link_type: 'F9ujm99rbh1o1i2c', //链接属性
    }
}

module.exports = {
    dColumns,
    rColumns,
    defaultColumns,
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
    shelfProcess
}