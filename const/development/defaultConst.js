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

    process_status: {
        NOT_START: -1,
        RUNNING: 1,
        APPROVE: 2,
        REJECT: 3,
        CANCEL: 4
    },

    TASK_STATUS: {
        APPROVE: 2,
        REJECT: 3,
        CANCEL: 4
    },

    link_status: {
        DEFAULT: -1,
        RUNNING: 0,
        FINISH: 1
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
        design_type: 'F3p2ma3oqbiabec',
        analyse_link: 'Cfidvbjy22qes',
        sale_purpose: 'Fbejma3orj6objc',
        exploitation_features: 'Fbu2ma3os6s8bmc',
        core_reasons: 'Fltema3p6ljrbpc',
        schedule_arrived_time: 'Fw29ma3p705cbsc',
        schedule_confirm_time: 'Fkpima3p7cd0bvc',
        product_info: 'Cfidjhk1jb293',
        brief_product_line: 'Fj0jma3p8evsc0c',
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
            node: ['F6gkma3pfcjfd1c']
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
    project_params_yida: {
        complete_time: {
            node: ['node_oclwekm6l81', 'node_oclxo08rk42', 'node_ocm5ut9eh46']
        },
        status: {
            node: ['node_oclwekm6l81', 'node_oclxo08rk42', 'node_ocm5ut9eh46']
        },
        confirm_time: {
            node: ['node_oclv2c2ehf1', 'node_ocm422dnchj']
        },
        expected_monthly_sales: {
            params: ['tableField_m1g2w3gr', 'tableField_m1g2w3gr']
        },
        order_time: {
            node: ['node_ocm734nlmea', 'node_oclkxfaina1', 'node_ocm1klukik7']
        },
        arrived_time: {
            node: ['node_ocm734nlmec', 'node_ocly2rqoe41', 'node_ocm1kmfmv82']
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
        expected_monthly_sales: {
            params: ['F6gkma3pfcjfd1c']
        },
        confirm_time: {
            node: ['杭州确认样品']
        },
        order_time: {
            node: ['填写订货合同']
        },
        arrived_time: {
            params: ['Fkm9ma3pyjsbh7c'],
        },
        goods_ids: {
            params: ['Fejnma3pxrw1gqc', 'Fuibma3py3dch0c', 'Fb9oma3py81ah5c']
        }
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
        decision_making: 'Faqhmai76cqjauc',
        analyse_link: 'Cfidvbjy22qes',
        schedule_arrived_time: 'Fw29ma3p705cbsc',
        schedule_confirm_time: 'Fkpima3p7cd0bvc',
        product_info: 'Cfidjhk1jb293',
        brief_product_line: 'Fj0jma3p8evsc0c',
        product_img: 'Cfidpl3a7e5tm',
        remark: 'Fq06mai77e3maxc'
    },
    ip_params_related: {
        status: {
            node: ['终审立项']
        },
        expected_monthly_sales: {
            params: ['F6gkma3pfcjfd1c']
        },
        design_review_time: {
            node: ['IP设计监修']
        },
        sample_review_time: {
            node: ['设计报样品IP监修']
        },
        confirm_time: {
            node: ['杭州确认样品']
        },
        product_review_time: {
            node: ['设计报大货设计监修']
        },
        vision_review_time: {
            node: ['开始视觉并视觉监修']
        },
        order_time: {
            node: ['填写订货量及订货合同']
        },
        arrived_time: {
            params: ['Fkm9ma3pyjsbh7c'],
        },
        goods_ids: {
            params: ['Fejnma3pxrw1gqc', 'Fuibma3py3dch0c', 'Fb9oma3py81ah5c']
        }
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
        status: {
            node: ['审核产品']
        },
        schedule_confirm_time: {
            params: ['Fn8ema24ab8zbmc']
        },
        confirm_time: {
            node: ['杭州样品收到确认']
        },
        analyse_link: {
            params: ['Cfid7h60opf5z', 'Cfideil88tv6a', 'Cfidlfqo2bh4s'],
        },
        expected_monthly_sales: {
            params: ['Fig2ma24zzz9brc']
        },
        order_time: {
            node: ['采购执行人签订周转合同']
        },
        arrived_time: {
            params: ['F69vma29vaqec7c'],
        },
        goods_ids: {
            params: ['Fyvmma25isbtf4c', 'F183ma25jl5sffc', 'Fmvrma25jqhlflc']
        }
    },
    supplier_params_yida: {
        status: {
            node: ['node_oclwekm6l81', 'node_oclxo08rk42', 'node_ocm5ut9eh46']
        },
        confirm_time: {
            node: ['node_oclv2c2ehf1', 'node_ocm422dnchj']
        },
        analyse_link: {
            params: ['attachmentField_m4kwkur3', 'attachmentField_lvesa8t5']
        },
        expected_monthly_sales: {
            params: ['tableField_m1g2w3gr', 'tableField_m1g2w3gr']
        },
        order_time: {
            node: ['node_ocm734nlmea', 'node_oclkxfaina1', 'node_ocm1klukik7']
        },
        arrived_time: {
            node: ['node_ocm734nlmec', 'node_ocly2rqoe41', 'node_ocm1kmfmv82']
        }
    },

    operator_title: '反推推品流程',
    operator_key: 'fttplc',
    operator_params: {
        project: 'Fj1ama2csbpoabc',
        recommend_time: 'Fo8xmai7pq5gb8c',
        user_id: 'Cfidbxyi2vqjo',
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
        status: {
            params: ['Fsaqma2et04janc', 'Fd94ma3j5t4me4c', 'Fuusma3kfq9tinc', 'F2e7ma3l2n9vk8c', 'Fm06ma3kixpkj7c']
        },
        patent_belongs: {
            params: ['Fd74ma2eqxsgaec']
        },
        patent_type: {
            params: ['F8ghma2erfjrahc']
        },
        sale_type: {
            params: ['Fyfuma2esicvakc']
        },
        product_info: {
            params: ['Cfidtpsmmff8d'],
        },
        product_img: {
            params: ['Cfidkv5b7kw4k'],
        },
        schedule_confirm_time: {
            params: ['Fuhmma2eu7d4atc'],
        },
        confirm_time: {
            node: ['杭州运营确认样品']
        },
        expected_monthly_sales: {
            params: ['Fcilma2exazkb7c']
        },
        order_time: {
            params: ['Fp5oma2ewqhkb4c'],
        },
        arrived_time: {
            params: ['Fiw0ma3jh33nggc'],
        },
        goods_ids: {
            params: ['F7wxma3jio5ngmc', 'Fg6bma3jj21jh0c', 'Fvv8ma3jj87kh4c']
        }
    },
    operator_params_yida: {
        status: {
            node: ['node_oclwekm6l81', 'node_oclxo08rk42', 'node_ocm5ut9eh46']
        },
        confirm_time: {
            node: ['node_oclv2c2ehf1', 'node_ocm422dnchj']
        },
        patent_belongs: {
            params: ['radioField_m1hhyk7e']
        },
        patent_type: {
            params: ['checkboxField_m1hhyk7f']
        },
        product_img: {
            params: ['attachmentField_m2ivm1hh', 'imageField_m2y6bawu']
        },
        expected_monthly_sales: {
            params: ['tableField_m1g2w3gr', 'tableField_m1g2w3gr']
        },
        order_time: {
            node: ['node_ocm734nlmea', 'node_oclkxfaina1', 'node_ocm1klukik7']
        },
        arrived_time: {
            node: ['node_ocm734nlmec', 'node_ocly2rqoe41', 'node_ocm1kmfmv82']
        }
    },
}

module.exports = defaultConst;