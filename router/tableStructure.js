const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const tmall_link = require("../router_handler/tianMaoLink");
const Validator = require("../utils/Validator");
const registerBodyRules = {
    field: {required: true, type: "string", minLength: 1},
    title: {required: true, type: "string", minLength: 1},
    tableType: {required: true, type: "number"},
};
//,
router.get("/table", tmall_link.get_user_table)
router.put("/table", Validator.validate(registerBodyRules), tmall_link.put_user_table)
//排序功能
router.use(bodyParser.json());
router.post("/table/sort", tmall_link.sort_user_table)
router.put("/table/tmall", tmall_link.tmall_user_table)

//天猫异常链接维护
router.get("/exceptionLinks", tmall_link.getExceptionLinks)
/*
*
* */
const ExceptionLinksBody = {
    //id 的自定义规则是uuid 36位
    id: {
        required: true,
        type: "string",
        regex: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
        minLength: 36,
        maxLength: 36
    },
    name: {required: true, type: "string", minLength: 1},
    field: {required: true, type: "string", minLength: 1, regex: /^[A-Za-z0-9]+$/},
    lessThan: {required: true, type: "string"},
    value: {required: true, type: "number"},
    comparator: {required: true, type: "string", regex: /^(>|<|>=|<=|==|!==)$/},
    exclude: {
        required: false, type: "array", minLength: 1,
        each: {
            type: 'object',
            properties: {
                field: {required: true, type: 'string', regex: /^[A-Za-z0-9]+$/},
                comparator: {required: true, type: 'string', regex: /^(>|<|>=|<=|==|!==)$/},
                name: {required: true, type: 'string'},
                value: {
                    required: true,
                    type: 'string',
                    regex: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
                }
            }
        }
    },
}
router.put("/exceptionLinks", Validator.validate(ExceptionLinksBody), tmall_link.putExceptionLinks)

router.delete("/exceptionLinks", Validator.validate({
    id: {
        required: true,
        type: "string",
        regex: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
        minLength: 36,
        maxLength: 36
    }
}), tmall_link.delExceptionLinks)

router.post("/exceptionLinks", Validator.validate({
    name: {
        required: true,
        type: "string",
        minLength: 1
    },
    field: {
        required: true,
        type: "string",
        minLength: 1,
        regex: /^[A-Za-z0-9]+$/
    },
    comparator: {
        required: true,
        type: "string",
        regex: /^(>|<|>=|<=|==|!==)$/
    },
}), tmall_link.postExceptionLinksExclude)
module.exports = router;