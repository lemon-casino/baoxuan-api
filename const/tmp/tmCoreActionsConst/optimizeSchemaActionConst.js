const {opCodes} = require("@/const/operatorConst");
const commonActionStatus = {TODO: "TODO", DOING: "DOING", DONE: "DONE"}

module.exports = [
    {
        actionName: "优化方案(简单)",
        actionCode: "optimizeSchema",
        actionStatus: [
            {
                nameCN: "待做",
                nameEN: commonActionStatus.TODO,
                rules: [
                    {
                        formName: "运营优化方案流程（全平台）",
                        formId: "FORM-51A6DCCF660B4C1680135461E762AC82JV53",
                        flowDetailsRules: [
                            {fieldId: "selectField_lk0jfy7h", opCode: opCodes.Equal, value: "简单"}
                        ],
                        flowNodeRules: [
                            {
                                from: {
                                    id: "",
                                    name: "",
                                    status: ["TODO"]
                                },
                                to: {
                                    id: "",
                                    name: "",
                                    status: ["TODO"]
                                },
                                ownerRule: {
                                    from: "",
                                    name: "",
                                    id: ""
                                }
                            }
                        ]
                    }
                ]
            },
            {
                nameCN: "在做",
                nameEN: commonActionStatus.DOING,
                rules: []
            },
            {
                nameCN: "已做",
                nameEN: commonActionStatus.DONE,
                rules: []
            }
        ]
    }
]