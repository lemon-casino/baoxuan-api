const express = require('express');
const router = express.Router();
const departmentApi = require('../router_handler/departmentApi');

router.get("/:deptId/users", departmentApi.getDeptUsers)
router.get("/users", departmentApi.getAllUsers)

module.exports = router