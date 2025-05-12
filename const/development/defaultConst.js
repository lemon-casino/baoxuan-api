const defaultConst = {
    PROJECT: 'project', //市场分析推品
    SELF: 'self', //自研
    IP: 'ip', //IP
    SUPPLIER: 'supplier', //供应商推品
    OPERATOR: 'operator', //反推

    LOG_TYPE: {
        INSERT: 'insert',
        UPDATE: 'update'
    },

    project_title: '市场推广推品流程',
    project_key: 'sctgtplc',
    project_params: {
        category: 'Foaomaknt8tlbec',
        type: 'Fqbbma3okjsdatc',
        goods_name: 'Flrzma3ol0opawc',
        seasons: 'Fz8jma3olbytazc',
        patent_belongs: 'Fxcyma3om6nvb2c',
        patent_type: 'F2cqma3omoitb5c',
        related: 'Fbaqma3onfyqb8c',
        schedule_time: 'Fckama3opwdfbbc',
        analyse_link: 'Cfidvbjy22qes',
        sale_purpose: 'Fbejma3orj6objc',
        exploitation_features: 'Fbu2ma3os6s8bmc',
        core_reasons: 'Fltema3p6ljrbpc',
        product_img: 'Cfidpl3a7e5tm',
        remark: 'Fv1umai7a21acuc'
    },
    project_params_related: {
        complete_time: {
            node: ['终审立项']
        },
        status: {
            node: ['终审立项']
        },
        confirm_time: {
            node: ['杭州确认样品1', '杭州确认样品2', '杭州确认样品3']
        },
        expected_monthly_sales: {
            node: ['货品汇总判断订货量1', '货品汇总判断订货量2', '货品汇总判断订货量3']
        },
        order_time: {
            node: ['填写订货合同1', '填写订货合同2', '填写订货合同3']
        },
        arrived_time: {
            params: ['Fkm9ma3pyjsbh7c']
        },
        goods_ids: {
            params: ['Fejnma3pxrw1gqc', 'Fuibma3py3dch0c', 'Fb9oma3py81ah5c']
        }
    },

    self_title: '自研推品流程',
    self_key: 'zytplc',
    self_params: {
        category: 'Foaomaknt8tlbec', 
        type: 'Fqbbma3okjsdatc',
        goods_name: 'Flrzma3ol0opawc',
        seasons: 'Fz8jma3olbytazc',
        patent_belongs: 'Fxcyma3om6nvb2c',
        patent_type: 'F2cqma3omoitb5c',
        related: 'Fbaqma3onfyqb8c',
        analyse_link: 'Cfidvbjy22qes',
        sale_purpose: 'Fbejma3orj6objc',
        exploitation_features: 'Fbu2ma3os6s8bmc',
        core_reasons: 'Fltema3p6ljrbpc',
        design_type: 'F3p2ma3oqbiabec',
        product_info: 'Cfidjhk1jb293',
        schedule_arrived_time: 'Fw29ma3p705cbsc',
        schedule_confirm_time: 'Fkpima3p7cd0bvc',
        brief_product_line: 'Fj0jma3p8evsc0c',
        product_img: 'Cfidpl3a7e5tm',
        remark: 'Ffnfmai7p64parc'
    },
    self_params_related: {
        status: {
            node: ['终审立项']
        },
        expected_monthly_sales: ['货品汇总判断订货量'],
        confirm_time: ['杭州确认样品'],
        order_time: ['填写订货合同'],
        arrived_time: {
            params: ['Fkm9ma3pyjsbh7c'],
            node: ['确定到仓时间']
        },
        goods_ids: 'finish'
    },

    ip_title: 'IP推品流程',
    ip_key: 'iptplc',
    ip_params: {
        category: 'Foaomaknt8tlbec', 
        type: 'Fqbbma3okjsdatc',
        goods_name: 'Flrzma3ol0opawc',
        seasons: 'Fz8jma3olbytazc',
        patent_belongs: 'Fxcyma3om6nvb2c',
        patent_type: 'F2cqma3omoitb5c',
        related: 'Fbaqma3onfyqb8c',
        project_type: 'F91kmai75w18arc',
        analyse_link: 'Cfidvbjy22qes',
        schedule_arrived_time: 'Fw29ma3p705cbsc',
        schedule_confirm_time: 'Fkpima3p7cd0bvc',
        product_info: 'Cfidjhk1jb293',
        brief_product_line: 'Fj0jma3p8evsc0c',
        product_img: 'Cfidpl3a7e5tm',
        remark: 'Fq06mai77e3maxc'
    },
    ip_params_related: {
        status: ['终审立项'],
        expected_monthly_sales: ['货品汇总判断订货量'],
        design_review_time: ['IP设计监修'],
        sample_review_time: ['设计报样品IP监修'],
        confirm_time: ['杭州确认样品'],
        product_review_time: ['设计报大货设计监修'],
        vision_review_time: ['开始视觉并视觉监修'],
        order_time: ['填写订货量及订货合同'],
        arrived_time: {
            params: ['Fkm9ma3pyjsbh7c'],
            node: ['确定到仓时间']
        },
        goods_ids: 'finish'
    },

    supplier_title: '供应商推品流程',
    supplier_key: 'gystplc',
    supplier_params: {
        recommend_time: 'Fcq6ma23efriabc', 
        brief_product_line: 'Fncjma23ezl8aec', 
        category: 'Foaomaknt8tlbec', 
        supplier: 'Fjmzma23l2ijaqc',
        supplier_type: 'Fm06ma23og1vatc',
        purchase_type: 'Fwtwma23p8z0awc',
        product_info: 'Cfidxjr5rmafj',
        goods_name: 'Frrima23qogmb1c',
        goods_type: 'Fo44ma23r183b4c',
        seasons: 'Fq19ma23rgucb7c',
        patent_belongs: 'Fnikma23se58bac',
        patent_type: 'Far4ma23t91qbdc',
        related: 'Fkuqma23u690bgc',
        sale_purpose: 'Fubjma23x7kvbjc',
        product_img: 'Cfidqp2zkc9m2',
        remark: 'Fb35mai7b790duc'
    },
    supplier_params_related: {
        status: ['审核产品'],
        schedule_confirm_time: {
            params: ['Fn8ema24ab8zbmc'],
            node: ['开发寄样，填写快递单号']
        },
        confirm_time: ['杭州样品收到确认'],
        analyse_link: {
            params: ['Cfid7h60opf5z', 'Cfideil88tv6a', 'Cfidlfqo2bh4s'],
            node: ['汇总货品并判断订货数量']
        },
        expected_monthly_sales: ['汇总货品并判断订货数量'],
        order_time: ['采购执行人签订周转合同'],
        arrived_time: {
            params: ['F69vma29vaqec7c'],
            node: ['仓库负责人确认货到仓入库时间']
        },
        goods_ids: 'finish'
    },

    operator_title: '反推推品流程',
    operator_key: 'fttplc',
    operator_params: {
        project: 'Fj1ama2csbpoabc',
        recommend_time: 'Fo8xmai7pq5gb8c',
        analyse_link: 'Cfid2frytpxdj',
        category: 'Foaomaknt8tlbec', 
        seasons: 'Fcjjma2elxdqabc',
        related: 'Fl62ma2eozixabc',
        patent_belongs: 'Fd74ma2eqxsgaec',
        patent_type: 'F8ghma2erfjrahc',
        sale_type: 'Fyfuma2esicvakc',
        sale_purpose: 'Frcrma2etkryaqc',
        brief_product_line: 'F6w0ma2d2mnxakc',
        remark: 'Fy8xmai7amwqdbc'
    },
    operator_params_related: {
        status: ['事业部一负责人审核', '事业部二负责人审核', '事业部三负责人审核'],
        product_info: {
            params: ['Cfidtpsmmff8d'],
            node: ['开发寄样，填写快递单号']
        },
        product_img: {
            params: ['Cfidkv5b7kw4k'],
            node: ['反选1上传产品信息', '反选2上传产品信息', '反选3上传产品信息', '反选4上传产品信息', '开发执行人跟进']
        },
        schedule_confirm_time: {
            params: ['Fuhmma2eu7d4atc'],
            node: ['反选1上传产品信息', '反选2上传产品信息', '反选3上传产品信息', '反选4上传产品信息', '开发执行人跟进']
        },
        confirm_time: ['杭州运营确认样品'],
        expected_monthly_sales: ['汇总货品并判断订货量'],
        order_time: {
            params: ['Fp5oma2ewqhkb4c'],
            node: ['填写合同']
        },
        arrived_time: {
            params: ['Fiw0ma3jh33nggc'],
            node: ['仓库负责人确认货到仓入库时间']
        },
        goods_ids: 'finish'
    },
}

module.exports = defaultConst;