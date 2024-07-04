const sha256 = require("sha256")
const formReviewRepo = require("@/repository/formReviewRepo")
const departmentFlowFormRepo = require("@/repository/departmentFlowFormRepo")
const flowFormRepo = require("@/repository/flowFormRepo")
const yiDaReq = require("@/core/dingDingReq/yiDaReq")
const redisRepo = require("@/repository/redisRepo")
const formImportantItems = require("@/const/tmp/formImportantItems")
const {timingFormFlowNodes} = require("@/const/formConst")

/**
 * 根据重要性获取form  默认：普通
 * @param isImportant  1: 重要   2：普通
 * @returns {Promise<*>}
 */
const getFormsByImportance = async (isImportant) => {
    let statusWhere = {};
    if (isImportant.toString() === "true") {
        statusWhere.status = 1
    } else if (isImportant.toString() === "false") {
        statusWhere.status = 2
    }
    return await flowFormRepo.getAllForms(statusWhere);
}

/**
 *  根据重要性获取form和审核节点信息
 * @param isImportant
 * @returns {Promise<*>}
 */
const getFormsWithReviewItemsByImportance = async (isImportant) => {
    const forms = await getFormsByImportance(isImportant)
    for (const form of forms) {
        const formReviews = await formReviewRepo.getFormReviewByFormId(form.flowFormId);
        if (formReviews && formReviews.length > 0)
            form.reviewItmes = formReviews[0].formReview;
    }
    return forms;
}

/**
 * 同步钉钉的form信息
 * @returns {Promise<boolean>}
 */
const syncFormsFromDingDing = async () => {
    const userId = "073105202321093148";
    const tokenObj = await redisRepo.getToken()
    const token = tokenObj.access_token
    const allFormsInDB = await flowFormRepo.getAllForms({})
    // 获取钉钉的form信息
    const allFormsInDingDing = await yiDaReq.getAllForms(token, userId)

    for (const form of allFormsInDingDing) {
        let formsInDB = allFormsInDB.filter((item) => {
            return item.flowFormId === form.formUuid
        })
        const formDetailsResult = await yiDaReq.getFormFields(form.formUuid, userId, token)
        const hashOfDetails = sha256(JSON.stringify(formDetailsResult.result))

        // 老的 form 判断内容是否修改，是就同步
        if (formsInDB.length > 0) {
            // 表单名称可能会修改需要进行同步
            const updateForm = {
                flowFormId: form.formUuid,
                flowFormName: form.title.zhCN
            }
            await flowFormRepo.updateFlowForm(updateForm)

            const formInDB = formsInDB[0]
            // 表单详情信息是否被更改
            if (hashOfDetails === formInDB.detailsHash) {
                continue
            }
            // form 还没有详细信息
            if (!formInDB.detailsHash) {
                formInDB.detailsVersion = 1
            }
            // 详情有变化
            else {
                formInDB.detailsVersion = formInDB.detailsVersion + 1
            }
            formInDB.detailsHash = hashOfDetails
            const flowFormsDetails = []
            for (const details of formDetailsResult.result) {
                flowFormsDetails.push({
                    formId: formInDB.flowFormId,
                    fieldName: details.label.zh_CN,
                    fieldId: details.fieldId,
                    props: JSON.stringify(details.props),
                    behavior: details.behavior,
                    version: formInDB.detailsVersion
                })
            }
            // 更新form、保存form的详细信息
            await flowFormRepo.updateFormAndAddDetails(formInDB, flowFormsDetails)
        }
        // 新的 form 需要入库
        else {
            const detailsVersion = 1
            const flowForm = {
                flowFormId: form.formUuid,
                flowFormName: form.title.zhCN,
                creator: form.creator,
                status: 2,
                createTime: form.gmtCreate,
                detailsHash: hashOfDetails,
                detailsVersion: detailsVersion
            }
            const flowFormsDetails = []
            for (const details of formDetailsResult.result) {
                flowFormsDetails.push({
                    formId: form.formUuid,
                    fieldName: details.label.zh_CN,
                    fieldId: details.fieldId,
                    props: JSON.stringify(details.props),
                    behavior: details.behavior,
                    version: detailsVersion
                })
            }
            await flowFormRepo.saveFormAndDetails(flowForm, flowFormsDetails)
        }
    }
    return true
}

/**
 * 根据部门和重要性筛选流程表单
 * @param deptId
 * @param isImportant
 * @returns {Promise<[]|*>}
 */
const getFlowFormsByDeptIdAndImportant = async (deptId, isImportant) => {
    let where = {};
    if (isImportant.toString() === "true") {
        where.status = 1
    } else if (isImportant.toString() === "false") {
        where.status = 2
    }
    if (deptId) {
        where.dept_id = {$like: `%${deptId}%`}
    }
    return await flowFormRepo.getAllForms(where);
}

/**
 * 获取所有的表流程表单
 * @returns {Promise<*[]|*>}
 */
const getAllForms = async () => {
    return flowFormRepo.getAllForms({})
}

/**
 * 获取表单的需要紧急显示的节点
 * @param formId
 * @returns {Promise<[string]|*[]>}
 */
const getFormEmergencyItems = async (formId) => {
    const form = formImportantItems.filter(item => item.formId === formId)
    if (form.length > 0) {
        return form[0].items
    }
    return []
}

/**
 * 根据id从nodes 中获取节点信息
 * @param id
 * @param nodes
 * @returns {null|*}
 */
const getNode = (id, nodes) => {
    for (const node of nodes) {
        if (node.id === id) {
            return node
        }
        if (node.children && node.children.length > 0) {
            return getNode(id, node.children)
        }
    }
    return null
}

/**
 * 获取节点的所有叶子信息
 * @param node
 * @returns {{children}|*}
 */
const getLeaf = (node) => {
    let allLeaf = []
    if (!node.children) {
        allLeaf.push(node.id)
    } else {
        // 遍历节点中的每一项，后面覆盖前面的节点信息
        let currentNodeLastLeaf = null

        for (let i = 0; i < node.children.length; i++) {
            const childNode = node.children[i]
            if (!childNode.children) {
                // 条件的最终选项，循环覆盖找到最后一条
                currentNodeLastLeaf = childNode.id
            } else {
                // 条件分支节点：对于各个条件中的的最终节点做合并
                if (childNode.componentName === "ConditionNode" || childNode.componentName === "ParallelNode") {
                    allLeaf = allLeaf.concat(getLeaf(childNode))
                }
            }
        }
        if (currentNodeLastLeaf) {
            allLeaf = allLeaf.concat(currentNodeLastLeaf)
        }
    }
    return allLeaf
}

const extractTitle=(node)=> {
    if (["ApplyNode", "EndNode"].includes(node.componentName)) {
        return node.props?.name?.zh_CN || node.props?.name || "";
    }

    if (!node.props || !node.props.name) {
        return node.title || "";
    }

    if (node.props.name && typeof node.props.name === "object") {
        return node.props.name.zh_CN || node.props.name.en_US || "";
    }

    if (node.props.conditions) {
        if (node.props.conditions.description) {
            return `${node.props.name} (${node.props.conditions.description})`;
        }
        return node.props.name;
    }

    return node.props.name || "";
}

const refactorReviewItems = (nodes, lastTimingNode) => {
    const processedNodes = []
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        let newNode = {
            id: node.id,
            title: extractTitle(node),
            description: node.props.conditions?.description || "",
            children: [],
            componentName: node.componentName
        }

        // 获取当前节点的直接上一次的计时节点
        let lastTimingNodes = []
        if (i > 0) {
            if (timingFormFlowNodes.includes(nodes[i - 1].componentName)) {
                lastTimingNode = nodes[i - 1]
            }
            if (lastTimingNode) {
                if (nodes[i - 1].id !== lastTimingNode.id) {
                    lastTimingNodes = lastTimingNodes.concat(getLeaf(nodes[i - 1]))
                } else {
                    lastTimingNodes.push(lastTimingNode.id)
                }
            }
            newNode = {...newNode, lastNode: nodes[i - 1].id}
        } else {
            lastTimingNode && lastTimingNodes.push(lastTimingNode.id)
        }
        if (timingFormFlowNodes.includes(node.componentName)) {
            newNode = {...newNode, lastTimingNodes}
        }

        if (timingFormFlowNodes.includes(node.componentName)) {
            newNode = {
                ...newNode,
                isTime: true,
                time: 0
            }
        }

        if (node.children && node.children.length > 0) {
            newNode.children = refactorReviewItems(node.children, lastTimingNode);
        }

        processedNodes.push(newNode);
    }
    return processedNodes;
}

/**
 * 获取表单列表，需要带上该deptId是否选择的标识
 * @param deptId
 * @returns {Promise<void>}
 */
const getDeptFlowForms = async (deptId, type) => {
    const flowForms = await getAllForms()
    const deptFlowForms = await departmentFlowFormRepo.getDepartmentFlowForms({deptId, type})

    for (const form of flowForms) {
        const deptForms = deptFlowForms.filter(item => item.formId === form.flowFormId && item.type.toString() === type)
        if (deptForms.length > 0) {
            form.createTime = deptForms[0].createTime
            form.updateTime = deptForms[0].updateTime
            form.deptFlowFormId = deptForms[0].id
            form.selected = true
            const deptCoreForms = deptForms.filter(item => item.isCore)
            form.isCore = deptCoreForms.length > 0
        } else {
            form.createTime = ""
            form.updateTime = ""
            form.selected = false
            form.isCore = false
        }
    }
    flowForms.sort((cur, next) => {
        if (next.isCore === cur.isCore) {
            return next.updateTime - cur.updateTime
        }
        return next.isCore - cur.isCore
    })
    return flowForms
}

const getFlowForm = async (formId) => {
    const flowForm = await flowFormRepo.getFormDetails(formId)
    return flowForm
}

module.exports = {
    getDeptFlowForms,
    getAllForms,
    getFormsByImportance,
    getFormsWithReviewItemsByImportance,
    syncFormsFromDingDing,
    getFlowFormsByDeptIdAndImportant,
    getFormEmergencyItems,
    refactorReviewItems,
    getFlowForm
}