/**
 * 扩展redis中users中的部门信息：用于统计
 *
 * @type {{}}
 */
const userDeptExtensions = [
    {
        userId: "0625414814781392",
        attachValues: {multiDeptStat: true},
        depsExtensions: [
            {
                deptId: "925489891",
                deptName: "产品设计部",
                statForms: [
                    {formId: "FORM-2529762FC54F44849153E5564C1628FAHFKN", formName: "开发新品设计流程"},
                    {formId: "FORM-CC0B476071F24581B129A24835910B81AK56", formName: "宝可梦新品开发流程"}
                ]
            },
            {
                deptId: "482162119",
                deptName: "视觉部",
                statForms: []
            }
        ]
    }
]

module.exports = {
    userDeptExtensions
}