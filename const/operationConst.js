const typeList = {
	division: {
		key: 1,
		value: "division",
		column: "shop_name",
		map: [2],
	},
	project: {
		key: 2,
		value: "project",
		column: "shop_name",
		map: [3, 4, 5],
	},
	shop: {
		key: 3,
		value: "shop",
		column: "shop_name",
		map: [5],
	},
	team: {
		key: 4,
		value: "team",
		column: "link_id",
		map: [5],
	},
	user: {
		key: 5,
		value: "user",
		column: "link_id",
		map: [5],
	},
}

const columnList = [
	{ label: "", key: "name", is_link: true, show: true, sort: 1 },
	{ label: "发货金额", key: "sale_amount", show: true },
	{ label: "推广费", key: "promotion_amount", show: true },
	{ label: "费用", key: "operation_amount", show: true },
	{ label: "费比(%)", key: "operation_rate", show: true },
	{ label: "ROI", key: "roi", show: true },
	{ label: "访问量", key: "words_vol", show: true },
	{ label: "市场流量", key: "words_market_vol", show: true },
	{ label: "市占率(%)", key: "market_rate", show: true },
	{ label: "退单量", key: "refund_num", show: true },
	{ label: "订单量", key: "order_num", show: true },
	{ label: "退货率(%)", key: "refund_rate", show: true },
	{ label: "运费", key: "express_fee", show: true },
	{ label: "包材费", key: "packing_fee", show: true },
	{ label: "利润", key: "profit", show: true },
	{ label: "利润率(%)", key: "profit_rate", show: true },
	{ label: "时间进度(%)", key: "timeline", show: true },
	{ label: "销售目标", key: "goal", show: true },
    { label: "销售达成(%)", key: "targets", show: true }
]

const operationDefaultItem = {
	total: {
		column: [],
        setting: [],
		data: [{ name: "汇总", sale_amount: 0, invoice: 0 }],
	},
	division: {
		data: [],
	},
	project: {
		data: [],
	},
	shop: {
		data: [],
	},
	team: {
		data: [],
	},
	user: {
		data: [],
	},
}

const projectNameList = {
	pdd: "拼多多",
	tgc: "淘工厂",
	tmmart: "天猫超市",
	coupang: "COUPANG",
	jd: "京东",
	jdss: "京东自营",
	jdssp: "京东自营推广",
	dy: "抖音",
	wxvideo: "视频号",
	vip: "唯品会",
	1688: "1688",
	xy: "闲鱼",
	dw: "得物",
	ks: "快手",
	xhs: "小红书",
	tm: "天猫",
}

const statItem = {
	actionName: "",
	actionCode: "",
	sum: 0,
	children: [],
}

const workItemList = ["选品", "市场分析", "爆款方案", "视觉", "上架", "优化"]
const workItemMap = {
	1: 0,
	2: 3,
	3: 4,
	4: 5,
	5: 1,
	6: 2,
}

const workTypeList = ["待转入", "进行中", "已完成"]
const operationSelectionFlow = [11, 106]
const operationSelectionFlowNode = [
	{
		activity_id: "node_oclwzzaj997",
		activity_name: "审核产品",
	},
	{
		activity_id: "node_ocm1ag8ewd3",
		activity_name: "运营成本是否选中",
	},
]

const analysisFlowUUid = "FORM-FEAF99D22148431E91EB2E8297FBB45DCS9Z"
const analysisLinkPrevious =
	"https://t8sk7d.aliwork.com/APP_BXS79QCC8MY5ZV0EZZ07/processDetail?formInstId="
const analysisFieldMap = {
	platform: "radioField_m1g24ev1",
	selected: "radioField_m1hjo1ka",
	instance_id: "textField_m2pxi0qq",
	link: "textField_m2py5hjz",
	operator: "employeeField_lii9qts2",
}
const productManageFlowUUid = "FORM-2FAE8F12CBB54CB8A604A74597D19CB18U9I"

const optimizeFlowUUid = "FORM-51A6DCCF660B4C1680135461E762AC82JV53"
const optimizeUser = "02353062153726101260"
const platformMap = {
	天猫部: "天猫",
	"fcs+pop": "京东",
	拼多多部: "拼多多",
	淘工厂部: "淘工厂",
}
const optimizeFieldMap = {
	name: "textField_liihs7kv", //链接名称
	operator: "employeeField_liihs7l0", //运营负责人
	goods_id: "textField_liihs7kw", //链接ID
	platform: "radioField_lxlncgm1", //平台
	is_old: "radioField_m6072fu6", //是否为新老品
	rank: "radioField_m4s69d9s", //链接级别
	optimize_rank: "radioField_m6072fu7", //优化等级
	type: "selectField_liihs7kz", //优化类型
	content: "multiSelectField_lwufb7oy", //链接优化内容
}

const goodsIsOldMap = ["新品", "老品"]
const goodsRankMap = {
	S: "S（月销20w以上）",
	A: "A（月销10-20w）",
	B: "B（月销3-10w）",
	C: "C（月销3w以下）",
}
const optimizeRankMap = ["正常", "紧急"]
const optimizeBpmProcessName = '运营优化方案流程（全平台）'
const optimizeBpmProcessKey = 'form-86'

module.exports = {
	typeList,
	operationDefaultItem,
	projectNameList,
	statItem,
	workItemList,
	workItemMap,
	workTypeList,
	operationSelectionFlow,
	operationSelectionFlowNode,
	analysisFieldMap,
	analysisFlowUUid,
	analysisLinkPrevious,
	columnList,
	optimizeFlowUUid,
	platformMap,
	optimizeFieldMap,
	optimizeUser,
	goodsIsOldMap,
	goodsRankMap,
	optimizeRankMap,
	productManageFlowUUid,
	optimizeBpmProcessName,
	optimizeBpmProcessKey
}
