const ProcessesModel = require('@/model/processes');
const ProcessInfoModel = require('@/model/processInfo');

const RECRUITMENT_PROCESS_CODE = 'zhaopin';
const RECRUITMENT_FIELD_ID = 'F01lmgt4hh6gazc';

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

const getRecruitmentProcessCandidates = async () => {
        const rows = await ProcessesModel.findAll({
                attributes: ['processId', 'processCode', 'version', 'status', 'startTime', 'endTime'],
                where: {
                        processCode: RECRUITMENT_PROCESS_CODE,
                },
                include: [
                        {
                                model: ProcessInfoModel,
                                as: 'recruitmentFields',
                                attributes: ['content'],
                                where: {
                                        field: RECRUITMENT_FIELD_ID,
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
                const contentEntry = Array.isArray(plain.recruitmentFields)
                        ? plain.recruitmentFields[0]
                        : plain.recruitmentFields;

                return {
                        processId: plain.processId,
                        processCode: plain.processCode,
                        version: plain.version,
                        status: plain.status,
                        startTime: plain.startTime,
                        endTime: plain.endTime,
                        content: contentEntry ? contentEntry.content : null,
                };
        });
};

module.exports = {
        getRecruitmentProcessCandidates,
};
