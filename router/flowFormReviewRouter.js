const express = require("express")
const router = express.Router()
const flowFormReviewApi = require("../router_handler/flowFormReviewApi")

router.get("/", flowFormReviewApi.getFormReviews)

module.exports = router;