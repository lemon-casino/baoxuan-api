const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const tmall_link = require("../router_handler/tmall_link");
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
module.exports = router;