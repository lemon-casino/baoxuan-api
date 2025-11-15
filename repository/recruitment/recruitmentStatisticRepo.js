const {Op} = require('sequelize');
const RecruitmentStatisticModel = require('@/model/recruitmentStatistic');
const { query:querydb1 } = require('../../model/dbConn')
const { query:querydb2 } = require('../../model/bpmDbConn');
const { leaderItemField } = require('../../const/newFormConst');
const mysql = require('mysql2')
const normalizeMetadata = (metadata) => {
        if (!metadata) {
                return null;
        }

        try {
                return JSON.stringify(metadata);
        } catch (error) {
                return null;
        }
};

const bulkInsertStatistics = async (records = []) => {
        if (!Array.isArray(records) || records.length === 0) {
                return 0;
        }

        const payload = records.map((record) => ({
                ...record,
                metadata: normalizeMetadata(record.metadata),
                recordedAt: record.recordedAt || new Date(),
        }));

        await RecruitmentStatisticModel.bulkCreate(payload);

        return payload.length;
};

const findExistingShipStatisticEntityIds = async (entityIds = []) => {
        if (!Array.isArray(entityIds) || entityIds.length === 0) {
                return new Set();
        }

        const normalizedIds = Array.from(
                new Set(
                        entityIds
                                .map((entityId) =>
                                        entityId === null || entityId === undefined ? null : String(entityId).trim()
                                )
                                .filter((entityId) => entityId)
                )
        );

        if (normalizedIds.length === 0) {
                return new Set();
        }

        const rows = await RecruitmentStatisticModel.findAll({
                attributes: ['entityId'],
                where: {
                        entityType: 'curriculum_vitae',
                        changeType: 'ship',
                        entityId: {
                                [Op.in]: normalizedIds,
                        },
                },
                group: ['entityId'],
                raw: true,
        });

        return new Set(rows.map((row) => row.entityId));
};

const getCurriculumVitaeShipStatistics = async (startDate,endDate) => {
        let sql = `SELECT ship,COUNT(DISTINCT reference) as count
        FROM bi_serve.recruitment_statistics 
        WHERE DATE_FORMAT(recorded_at,'%Y-%m-%d') BETWEEN ? AND ?
        AND ship in (4, 5, 6, 7, 9, 10) 
        GROUP BY ship
        UNION ALL
        SELECT 1 AS ship,COUNT(candidate) 
        FROM bi_serve.recruitment
        WHERE DATE_FORMAT(date,'%Y-%m-%d') BETWEEN ? AND ?
        UNION ALL
        SELECT 8 AS ship,COUNT(contact) AS count
	FROM bi_serve.curriculum_vitae 
	WHERE DATE_FORMAT(date,'%Y-%m-%d') BETWEEN ? AND ?`
        let result = await querydb2(sql,[startDate,endDate,startDate,endDate,startDate,endDate])
        return result
}

const getHrCount = async (startDate,endDate) => {
        let sql = `SELECT 8 AS ship,hr,count(contact) AS count FROM bi_serve.curriculum_vitae WHERE DATE_FORMAT(date,'%Y-%m-%d') BETWEEN ? AND ? GROUP BY hr
                UNION ALL
                select 1 AS ship,hr,COUNT(hr) AS count from bi_serve.recruitment WHERE DATE_FORMAT(date,'%Y-%m-%d') BETWEEN ? AND ? GROUP BY hr
                UNION ALL
                select 4 AS ship,hr,COUNT(DISTINCT contact) AS count from bi_serve.recruitment_statistics AS a
                LEFT JOIN bi_serve.recruitment as b
                on a.reference = b.contact
                WHERE a.ship = 4 AND DATE_FORMAT(a.recorded_at,'%Y-%m-%d') BETWEEN ? AND ?
                GROUP BY hr
                UNION ALL
                select 5 AS ship,hr,COUNT(DISTINCT contact) AS count  from bi_serve.recruitment_statistics AS a
                LEFT JOIN bi_serve.recruitment as b
                on a.reference = b.contact
                WHERE a.ship = 5 AND DATE_FORMAT(a.recorded_at,'%Y-%m-%d') BETWEEN ? AND ?
                GROUP BY hr
                UNION ALL
                select 6 AS ship,hr,COUNT(DISTINCT contact) AS count  from bi_serve.recruitment_statistics AS a
                LEFT JOIN bi_serve.recruitment as b
                on a.reference = b.contact
                WHERE a.ship = 6 AND DATE_FORMAT(a.recorded_at,'%Y-%m-%d') BETWEEN ? AND ?
                GROUP BY hr`
        let result = await querydb2(sql,[startDate,endDate,startDate,endDate,startDate,endDate,startDate,endDate,startDate,endDate])
        return result
}

const getJobCount = async (startDate,endDate) => {
        let sql = `SELECT 8 AS ship,job,count(DISTINCT contact) AS count FROM bi_serve.curriculum_vitae WHERE DATE_FORMAT(date,'%Y-%m-%d') BETWEEN ? AND ? GROUP BY job
        UNION ALL
        select 1 AS ship,position AS job,COUNT(position) AS count from bi_serve.recruitment WHERE DATE_FORMAT(date,'%Y-%m-%d') BETWEEN ? AND ?  GROUP BY job
        UNION ALL
        select 4 AS ship,position as job,COUNT(DISTINCT contact) AS count  from bi_serve.recruitment_statistics AS a
        LEFT JOIN bi_serve.recruitment as b
        on a.reference = b.contact
        WHERE a.ship = 4 AND DATE_FORMAT(a.recorded_at,'%Y-%m-%d') BETWEEN ? AND ?
        GROUP BY job
        UNION ALL
        select 5 AS ship,position as job,COUNT(DISTINCT real_contact) AS count  from bi_serve.recruitment_statistics AS a
        LEFT JOIN bi_serve.recruitment as b
        on a.reference = b.contact
        WHERE a.ship = 5 AND DATE_FORMAT(a.recorded_at,'%Y-%m-%d') BETWEEN ? AND ?
        GROUP BY position
        UNION ALL
        select 6 AS ship,position as job,COUNT(DISTINCT real_contact) AS count  from bi_serve.recruitment_statistics AS a
        LEFT JOIN bi_serve.recruitment as b
        on a.reference = b.contact
        WHERE a.ship = 6 AND DATE_FORMAT(a.recorded_at,'%Y-%m-%d') BETWEEN ? AND ?
        GROUP BY position
        `
        let result = await querydb2(sql,[startDate,endDate,startDate,endDate,startDate,endDate,startDate,endDate,startDate,endDate])
        return result
}
const zhopinform = async () =>{
        let sql = `SELECT a.process_id,max(a.content) AS concat,b.username,max(c.content) AS position FROM process_info AS a
                LEFT JOIN process_tasks AS b
                ON a.process_id = b.process_id AND b.title = '筛选简历并进行面试' and b.status in (1,2)
                LEFT JOIN process_info AS c
                ON a.process_id = c.process_id AND c.title = '招聘岗位'
                WHERE a.field = 'F01lmgt4hh6gazc' AND a.content is not null
                GROUP BY a.process_id,b.username`
        let result = await querydb1(sql)
        return result
}
const DeleteRecruitment = async (id)=>{
        let sql = `DELETE FROM bi_serve.recruitment where process_id = ? `
        let result = await querydb2(sql,[id])
        return result
}

const InsertRecruitment = async (data)=>{
        let sql = `INSERT INTO bi_serve.recruitment (
                process_id,
                hr,
                position,
                interviewer,
                candidate,
                contact,
                real_contact,
                interview_status,
                date,
                rejection_info,
                interview_evaluation,
                ps) VALUES (?)`
        let result = await querydb2(sql,data)
        return result
}
module.exports = {
        bulkInsertStatistics,
        getCurriculumVitaeShipStatistics,
        findExistingShipStatisticEntityIds,
        zhopinform,
        DeleteRecruitment,
        InsertRecruitment,
        getHrCount,
        getJobCount
};
