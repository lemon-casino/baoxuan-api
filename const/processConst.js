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
    {header: '方案数量', field: 'plan', hasChild: false},
    {header: '视觉数量', field: 'vision', hasChild: true, children: [
        {header: '正推数量', field: 'vision_supplier', hasChild: true, children: [
            {header: '原创', field: 'original', hasChild: false},
            {header: '非原创', field: 'unoriginal', hasChild: false},
        ]},
        {header: '反推数量', field: 'vision_operator', hasChild: true, children: [
            {header: '原创', field: 'original', hasChild: false},
            {header: '非原创', field: 'unoriginal', hasChild: false},
        ]},
        {header: 'IP数量', field: 'vision_ip', hasChild: true, children: [
            {header: '原创', field: 'original', hasChild: false},
            {header: '非原创', field: 'unoriginal', hasChild: false},
        ]},
        {header: '自研数量', field: 'vision_self', hasChild: true, children: [
            {header: '原创', field: 'original', hasChild: false},
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

const typeList = {
    SUPPLIER: '供应商推品',
    OPERATOR: '反推推品',
    IP: 'IP推品',
    SELF: '自研推品'
}

const analysisProcess = {
    name: '开发审核子流程',
    key: 'tpkfsh',
    template: {
        SUPPLIER: {
            link: 'Fcbymgq06n79djc', //推品流程链接
            uid: 'Fk0lmgyqg4d4abc', //推品ID
            type: 'F3ecmgyqgfo5aec', //推品类型
            start_time: 'Fcq6ma23efriabc', //推品日期
            brief_name: 'Fncjma23ezl8aec', //产品线简称
            supplier: 'Fjmzma23l2ijaqc', //供应商名称
            supplier_type: 'Fm06ma23og1vatc', //供应商属性
            categories: 'Foaomaknt8tlbec', //类目选择
            purchase_type: 'Fwtwma23p8z0awc', //采购形式
            product_info: 'Cfidxjr5rmafj', //产品信息
            name: 'Frrima23qogmb1c', //推品名称
            product_type: 'Fo44ma23r183b4c', //产品属性
            seasons: 'Fq19ma23rgucb7c', //产品销售季节
            patent_belongs: 'Fhkzmh8jyy2iabc', //供应商-专利归属
            patent_type: 'F0hlmh8jzu74agc', //供应商-专利-二级
            related: 'Fkuqma23u690bgc', //相关联的产品类型和节日
            sale_purpose: 'Fubjma23x7kvbjc', //产品销售目的
            remark: 'Fb35mai7b790duc', //特殊备注
            image: 'Cfidv84ga4ncy', //对应产品图
        },
        OPERATOR: {
            link: 'Fcbymgq06n79djc', //推品流程链接
            uid: 'Fk0lmgyqg4d4abc', //推品ID
            type: 'F3ecmgyqgfo5aec', //推品类型
            project: 'Fj1ama2csbpoabc', //反推-运营事业部
            start_time: 'Fcq6ma23efriabc', //推品日期
            name: 'Frb5mh49hqdbbfc', //参考-产品简称
            starter: 'Cfidxhbnf9y0v', //反推运营发起人
            brief_name: 'Fncjma23ezl8aec', //产品线简称
            categories: 'Foaomaknt8tlbec', //类目选择
            seasons: 'Fq19ma23rgucb7c', //产品销售季节
            related: 'Fkuqma23u690bgc', //相关联的产品类型和节日
            analysis: 'Cfidsxy1qboon', //市场分析表
            sale_purpose: 'Fubjma23x7kvbjc', //产品销售目的
            remark: 'Fb35mai7b790duc', //特殊备注
            image: 'Cfidv84ga4ncy', //对应产品图
        },
        IP: {
            link: 'Fcbymgq06n79djc', //推品流程链接
            uid: 'Fk0lmgyqg4d4abc', //推品ID
            type: 'F3ecmgyqgfo5aec', //推品类型
            develop_type: 'Fqw8mh4i6lfofmc', //ip-运营事业部
            start_time: 'Fcq6ma23efriabc', //推品日期
            analysis_name: 'Fxtjmh480hmtanc', //市场分析名称
            name: 'F22pmh481rgdaqc', //立项产品名称
            categories: 'Foaomaknt8tlbec', //类目选择
            seasons: 'Fq19ma23rgucb7c', //产品销售季节
            related: 'Fkuqma23u690bgc', //相关联的产品类型和节日
            analysis: 'Cfidsxy1qboon', //市场分析表
            project_type: 'Fkg9mh49t15ibic', //立项性质
            remark: 'Fb35mai7b790duc', //特殊备注
            image: 'Cfidv84ga4ncy', //对应产品图
        },
        SELF: {
            link: 'Fcbymgq06n79djc', //推品流程链接
            uid: 'Fk0lmgyqg4d4abc', //推品ID
            type: 'F3ecmgyqgfo5aec', //推品类型
            start_time: 'Fcq6ma23efriabc', //推品日期
            analysis_name: 'Fxtjmh480hmtanc', //市场分析名称
            name: 'F22pmh481rgdaqc', //立项产品名称
            dept: 'Fo8omh482d6matc', //推品选择
            brief_name: 'Fncjma23ezl8aec', //产品线简称
            categories: 'Foaomaknt8tlbec', //类目选择
            product_info: 'Cfidxjr5rmafj', //产品信息
            seasons: 'Fq19ma23rgucb7c', //产品销售季节
            patent_belongs: 'Fnikma23se58bac', //自研-专利归属
            patent_type: 'Far4ma23t91qbdc', //自研-专利-二级
            related: 'Fkuqma23u690bgc', //相关联的产品类型和节日
            design_type: 'F5b2mh48usp0awc', //设计定义
            analysis: 'Cfidsxy1qboon', //市场分析表
            sale_purpose: 'Fubjma23x7kvbjc', //产品销售目的
            exploitation_features: 'Fpeumh492ui7b1c', //产品开发性质
            core_reasons: 'F17dmh49433bb4c', //核心立项理由
            schedule_confirm_time: 'Fn8ema24ab8zbmc', //预计样品确认时间
            schedule_arrived_time: 'F8d3mh494ws9b7c', //预计开发周期（大货时间）
            remark: 'Fb35mai7b790duc', //特殊备注
            image: 'Cfidv84ga4ncy', //对应产品图
            is_self: 'Fklmmgyslee2brc', //自研-是否需要自主设计
        }
    }
}

module.exports = {
    dColumns,
    rColumns,
    defaultColumns,
    typeList,
    analysisProcess
}