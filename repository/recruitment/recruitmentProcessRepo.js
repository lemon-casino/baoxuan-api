const {Op} = require('sequelize');
const ProcessesModel = require('@/model/processes');
const ProcessInfoModel = require('@/model/processInfo');
const { query } = require('../../model/dbConn')
const RECRUITMENT_PROCESS_CODE = 'zhaopin';
const FIELD_IDS = {
        department: 'F8srmgrpj4r3aec',
        jobTitle: 'Fpu4mgrpl5euahc',
        headcount: 'Fddkmgu6wxplanc',
        owner: 'Cfid8cdci83fu',
        educationRequirement: 'F3j0mgu6x8nwaqc',
        experienceRequirement: 'F7ajmgu6yh5fatc',
        jobContent: 'Fxq6mgu6yofoawc',
        candidateList: 'F01lmgt4hh6gazc',
};

if (!ProcessesModel.associations?.recruitmentFields) {
        ProcessesModel.hasMany(ProcessInfoModel, {
                as: 'recruitmentFields',
                foreignKey: 'processId',
                sourceKey: 'processId',
        });
}

if (!ProcessInfoModel.associations?.process) {
        ProcessInfoModel.belongsTo(ProcessesModel, {
                as: 'process',
                foreignKey: 'processId',
                targetKey: 'processId',
        });
}
const pickRecruitmentFields = (fieldRows = []) => {
        const fieldMap = {};
        fieldRows.forEach((item) => {
                if (!item) {
                        return;
                }
                const {field, content} = item;
                if (field) {
                        fieldMap[field] = content;
                }
        });
        return fieldMap;
};

const getRecruitmentProcesses = async () => {
        const rows = await ProcessesModel.findAll({
                attributes: ['processId', 'processCode', 'version', 'status', 'startTime', 'endTime'],
                where: {
                        processCode: RECRUITMENT_PROCESS_CODE,
                },
                include: [
                        {
                                model: ProcessInfoModel,
                                as: 'recruitmentFields',
                                attributes: ['field', 'content'],
                                where: {
                                        field: {
                                                [Op.in]: Object.values(FIELD_IDS),
                                        },
                                },
                                required: true,
                        },
                ],
                order: [
                        ['startTime', 'DESC'],
                        ['id', 'DESC'],
                ],
        });

        return rows.map((row) => {
                const plain = row.get({plain: true});
                const recruitmentFields = Array.isArray(plain.recruitmentFields)
                        ? plain.recruitmentFields
                        : [plain.recruitmentFields];
                const fieldMap = pickRecruitmentFields(recruitmentFields);

                return {
                        processId: plain.processId,
                        processCode: plain.processCode,
                        version: plain.version,
                        status: plain.status,
                        startTime: plain.startTime,
                        endTime: plain.endTime,
                        fieldMap,
                };
        });
};

const gettrial = async () => {
        let sql = `select a2.content AS 'name',a3.content as 'contact',10 AS ship, '试用淘汰' AS status
        ,CONCAT(a1.title,a1.content) AS interviewComment ,'' AS interviewRemark from process_info a1
	LEFT JOIN process_info a2
	ON a1.process_id = a2.process_id AND a2.field = 'Fgmvmgu9a7wxcec'
	LEFT JOIN process_info a3
	ON a1.process_id = a3.process_id AND a3.field = 'F9x0mh1mieh3b1c'
	where a1.field in ('Fxrvmhabccwcazc','F3ylmhabdfrcb5c','Fkqumhabdfmqb2c') AND a1.content = '人事劝离'`
        let result = await query(sql)
        return result
}
module.exports = {
        FIELD_IDS,
        getRecruitmentProcesses,
        gettrial
}
