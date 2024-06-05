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
                statForms: [
                    {formId:"FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1", formName: "天猫链接上架流程"},
                    {formId:"FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3", formName: "运营新品流程"},
                    {formId:"FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1", formName: "运营拍摄流程"},
                    {formId:"FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS", formName: "美编任务运营发布"}
                ]
            }
        ]
    }
]

module.exports = {
    userDeptExtensions
}