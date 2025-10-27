const {Op} = require('sequelize');
const ProcessesModel = require('@/model/processes');
const ProcessInfoModel = require('@/model/processInfo');

const ONBOARDING_PROCESS_CODE = 'ruzhiliucheng';
const FIELD_IDS = {
        status: 'Fp4bmgz1euzyabc',
        candidateName: 'Fgmvmgu9a7wxcec',
        entryDate: 'Fpd1mgu9b2s2ckc',
        contact: 'F9x0mh1mieh3b1c',
};

if (!ProcessesModel.associations?.onboardingFields) {
        ProcessesModel.hasMany(ProcessInfoModel, {
                as: 'onboardingFields',
                foreignKey: 'processId',
                sourceKey: 'processId',
        });
}

const pickFieldMap = (fieldRows = []) => {
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

const getOnboardingProcesses = async () => {
        const rows = await ProcessesModel.findAll({
                attributes: ['processId', 'processCode', 'version', 'status', 'startTime', 'endTime', 'title'],
                where: {
                        processCode: ONBOARDING_PROCESS_CODE,
                },
                include: [
                        {
                                model: ProcessInfoModel,
                                as: 'onboardingFields',
                                attributes: ['field', 'content'],
                                where: {
                                        field: {
                                                [Op.in]: Object.values(FIELD_IDS),
                                        },
                                },
                                required: false,
                        },
                ],
                order: [
                        ['startTime', 'DESC'],
                        ['id', 'DESC'],
                ],
        });

        return rows.map((row) => {
                const plain = row.get({plain: true});
                const onboardingFields = Array.isArray(plain.onboardingFields)
                        ? plain.onboardingFields
                        : [plain.onboardingFields].filter(Boolean);
                const fieldMap = pickFieldMap(onboardingFields);

                return {
                        processId: plain.processId,
                        processCode: plain.processCode,
                        version: plain.version,
                        status: plain.status,
                        title: plain.title,
                        startTime: plain.startTime,
                        endTime: plain.endTime,
                        fieldMap,
                };
        });
};

module.exports = {
        FIELD_IDS,
        getOnboardingProcesses,
};
