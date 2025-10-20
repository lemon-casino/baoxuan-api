const {Op} = require('sequelize');
const ProcessesModel = require('@/model/processes');
const ProcessInfoModel = require('@/model/processInfo');

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

module.exports = {
        FIELD_IDS,
        getRecruitmentProcesses,
};
