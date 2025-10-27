const recruitmentPositionRepo = require('@/repository/recruitment/recruitmentPositionRepo');

const listRecruitmentPositions = async (query = {}) => {
        const {page = 1, pageSize = 20, status, jobTitle, owner} = query;

        const normalizedStatus = Array.isArray(status)
                ? status
                : typeof status === 'string' && status.includes(',')
                        ? status.split(',').map((item) => item.trim()).filter(Boolean)
                        : status;

        return recruitmentPositionRepo.listRecruitmentPositions({
                page,
                pageSize,
                status: normalizedStatus,
                jobTitle,
                owner,
        });
};

module.exports = {
        listRecruitmentPositions,
};
