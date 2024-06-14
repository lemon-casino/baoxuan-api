const models = require('../model')

const save = async (depUser) => {
    try {
        await models.deptsUsersModel.create({
            deptId: dept.dept_id, deptName: dept.name, parentId: dept.parent_id
        })
    } catch (e) {
        if (e.original.code !== "ER_DUP_ENTRY") {
            throw e
        }
    }
}

module.exports = {
    save
}