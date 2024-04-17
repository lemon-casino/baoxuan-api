const express = require("express");
const router = express.Router();
const formHandler = require("../router_handler/formHandler");

router.get("/all", formHandler.getFormsByImportance);
router.get("/:deptId", formHandler.getFlowFormsByDeptIdAndImportant)

module.exports = router;