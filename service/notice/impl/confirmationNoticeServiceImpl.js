const confirmationNoticeRepo = require("@/repository/confirmationNoticeRepo")
const {getUsersWithDepartmentFromDingDing} = require("@/service/dingDingService");
const redisUtil = require("@/utils/redisUtil");
const {redisKeys} = require("@/const/redisConst");

function extracted(Not, reply) {
	// 分组结果的初始化
	const groupedResult = {
		"杭州弦桐科技有限公司": [],
		"北京瑞程祥云科技有限公司": [],
	}

	// 定义递归函数来查找用户所属公司
	function findUserInDepartment(dingding, department, topCompany) {
		// 检查当前部门的用户
		if (
			department.dep_user &&
			department.dep_user.some((user) => user.userid === dingding)
		) {
			return topCompany
		}

		// 递归检查子部门
		if (department.dep_chil) {
			for (const childDept of department.dep_chil) {
				const result = findUserInDepartment(
					dingding,
					childDept,
					topCompany
				)
				if (result) {
					return result
				}
			}
		}

		return null
	}

	// 遍历每个 Not 数据中的用户，并查找其所属公司
	Not.forEach((notUser) => {
		const { dingding } = notUser
		let found = false

		// 检查每个顶级公司
		for (const company of JSON.parse(reply)) {
			const topCompanyName = company.name
			const companyMatch = findUserInDepartment(
				dingding,
				company,
				topCompanyName
			)

			if (companyMatch) {
					groupedResult[topCompanyName].push(notUser)
				//type
				found = true
				break // 找到后不再继续检查其他公司
			}
		}

		// 若没有匹配到任何公司（可选）
		if (!found) {
			console.warn(`未找到 dingding 为 ${dingding} 的用户所属公司`)
		}
	})
	return groupedResult
}

function  ToHr(TO, reply) {
	for (const dingding of reply.杭州弦桐科技有限公司) {
		for (const item of TO) {
			if (item.dingding === dingding.dingding) {
				item.hr="010157541721314335"
			}
		}
	}
}

const confirmNotice = async () => {
    const  DingTO=await confirmationNoticeRepo.getConfirmationNotice()
	const reply = await redisUtil.get(redisKeys.Users);
	const sult = extracted(DingTO, reply)
	ToHr(DingTO,sult)
	const Not = await confirmationNoticeRepo.NotSupervisorsAndConversionDate()
    const groupedResult = extracted(Not, reply)
	ToHr(Not,groupedResult)
	return {
		DingTO,
		groupedResult,
	}
}


const timingSynchronization = async () => {
    //同步users  is_is_resign= true表的数据
     await confirmationNoticeRepo.syncUsersToConfirmationNotice()
}
module.exports = {
    confirmNotice,
    timingSynchronization
};