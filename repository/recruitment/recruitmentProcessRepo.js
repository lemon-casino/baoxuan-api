const {query} = require('@/model/dbConn');

const RECRUITMENT_PROCESS_CODE = 'zhaopin';
const RECRUITMENT_FIELD_ID = 'F01lmgt4hh6gazc';

const getRecruitmentProcessCandidates = async () => {
    const sql = `SELECT p.process_id AS processId,
                        p.process_code AS processCode,
                        p.version,
                        p.status,
                        p.start_time AS startTime,
                        p.end_time AS endTime,
                        pi.content
                 FROM processes p
                 JOIN process_info pi ON pi.process_id = p.process_id
                 WHERE p.process_code = ?
                   AND pi.field = ?
                 ORDER BY p.start_time DESC, p.id DESC`;
    const result = await query(sql, [RECRUITMENT_PROCESS_CODE, RECRUITMENT_FIELD_ID]);
    return result || [];
};

module.exports = {
    getRecruitmentProcessCandidates,
};
