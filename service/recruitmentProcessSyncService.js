const {logger} = require('@/utils/log');
const recruitmentProcessRepo = require('@/repository/recruitment/recruitmentProcessRepo');
const curriculumVitaeRepo = require('@/repository/curriculumVitaeRepo');
const recruitmentPositionRepo = require('@/repository/recruitment/recruitmentPositionRepo');
const recruitmentStatisticRepo = require('@/repository/recruitment/recruitmentStatisticRepo');

const {FIELD_IDS} = recruitmentProcessRepo;

const STATUS_TO_SHIP = new Map([
	['未面试', 1],
	['新候选人', 1],
	['初选通过', 2],
	['安排面试', 3],
	['hr面', 3],
	['一面', 3],
	['二面', 3],
	['三面', 3],
	['四面', 3],
	['面试通过', 4],
	['面试通过-候选人考虑中', 6],
	['offer', 5],
	['已发offer', 5],
	['待入职', 6],
	['回绝offer', 7],
	['候选人拒绝', 7],
	['终止流程-无法达成候选人预期', 7],
	['终止该候选人', 7],
	['面试未通过', 7],
]);

const DEFAULT_SHIP = 8;

const SHIP_PRIORITY = {
	8: 0,
	1: 10,
	2: 20,
	3: 30,
	4: 40,
	5: 50,
	6: 60,
	7: 100,
};

const normalizeStatus = (status = '') => status.replace(/\s+/g, '').toLowerCase();

const resolveShip = (status) => STATUS_TO_SHIP.get(status) ?? STATUS_TO_SHIP.get(status.toUpperCase()) ?? null;
const extractCandidateEntries = (fieldMap = {}, context = {}) => {
	const content = fieldMap[FIELD_IDS.candidateList];
	if (!content) {
		return [];
	}
	let parsed;
	try {
		parsed = JSON.parse(content);
	} catch (error) {
		logger.warn(
			`[RecruitmentProcessSync] Failed to parse candidate content for process ${context.processId || 'unknown'}: ${error.message}`
		);
		return [];
	}

	if (!Array.isArray(parsed)) {
		return [];
	}

	return parsed
		.map((entry) => {
			const interviewRemark = typeof entry['备注'] === 'string' ? entry['备注'].trim() : '';
			const candidateName = typeof entry['候选人'] === 'string' ? entry['候选人'].trim() : '';

			return {
				name: candidateName || interviewRemark,
				contact: typeof entry['联系方式'] === 'string' ? entry['联系方式'].trim() : '',
				status: typeof entry['面试状态'] === 'string' ? entry['面试状态'].trim() : '',
				interviewComment: typeof entry['面试评价'] === 'string' ? entry['面试评价'].trim() : '',
				interviewRemark,
			};
		})
		.filter((entry) => entry.contact && entry.status);
};

const buildCandidateUpdates = (rows) => {
	const candidateMap = new Map();
	const unknownStatuses = new Set();

	rows.forEach((row) => {
		const candidates = extractCandidateEntries(row.fieldMap, {processId: row.processId});
		candidates.forEach((candidate) => {
			const normalizedStatus = normalizeStatus(candidate.status);
			const ship = resolveShip(normalizedStatus);
			if (!ship) {
				unknownStatuses.add(candidate.status);
			}
			const resolvedShip = ship ?? DEFAULT_SHIP;
			const payload = {
				contact: candidate.contact,
				name: candidate.name,
				ship: resolvedShip,
				status: candidate.status,
				interviewComment: candidate.interviewComment,
				interviewRemark: candidate.interviewRemark,
			};

			const candidateKey = candidate.contact;
			const existing = candidateMap.get(candidateKey);
			const currentPriority = SHIP_PRIORITY[resolvedShip] ?? 0;
			const existingPriority = existing ? SHIP_PRIORITY[existing.ship] ?? 0 : -Infinity;

			if (!existing || currentPriority >= existingPriority) {
				candidateMap.set(candidateKey, payload);
			}
		});
	});

	return {
		candidateMap,
		unknownStatuses,
	};
};
const buildRecruitmentPositions = (rows) =>
	rows.map((row) => {
		const {fieldMap = {}} = row;
		return {
			processId: row.processId,
			processCode: row.processCode,
			version: row.version,
			department: fieldMap[FIELD_IDS.department] || null,
			jobTitle: fieldMap[FIELD_IDS.jobTitle] || null,
			headcount: fieldMap[FIELD_IDS.headcount] || null,
			owner: fieldMap[FIELD_IDS.owner] || null,
			educationRequirement: fieldMap[FIELD_IDS.educationRequirement] || null,
			experienceRequirement: fieldMap[FIELD_IDS.experienceRequirement] || null,
			jobContent: fieldMap[FIELD_IDS.jobContent] || null,
			status: row.status,
			startTime: row.startTime,
			endTime: row.endTime,
		};
	});

const syncCurriculumVitaeStatus = async () => {
	const rows = await recruitmentProcessRepo.getRecruitmentProcesses();
        if (!rows || rows.length === 0) {
                return {
                        totalProcesses: 0,
                        candidates: 0,
                        updated: 0,
                        unknownStatuses: [],
                        positions: 0,
                        statistics: 0,
                };
        }

	const recruitmentPositions = buildRecruitmentPositions(rows);
	let positionCount = 0;
	try {
		positionCount = await recruitmentPositionRepo.upsertRecruitmentPositions(recruitmentPositions);
	} catch (error) {
		logger.error(`[RecruitmentProcessSync] failed to sync recruitment positions: ${error.message}`, error);
	}
	const {candidateMap, unknownStatuses} = buildCandidateUpdates(rows);

        let updated = 0;
        let statisticsInserted = 0;
        const unmatchedContacts = [];
        const statisticRecords = [];
        const baselineRecords = [];
        for (const candidate of candidateMap.values()) {
                let result = {matched: 0, updatedRows: 0, records: []};
                if (candidate.contact) {
                        result = await curriculumVitaeRepo.updateShipByContact(
                                candidate.contact,
                                candidate.ship,
                                candidate.name
                        );
                }

                if (result.matched === 0) {
                        unmatchedContacts.push({
                                contact: candidate.contact,
                                name: candidate.name,
                                status: candidate.status,
                        });
                        continue;
                }

                if (result.updatedRows > 0) {
                        updated += result.updatedRows;
                }

                result.records.forEach((record) => {
                        const reference = candidate.contact || null;
                        const metadata = {
                                contact: candidate.contact || null,
                                status: candidate.status || null,
                                name: candidate.name || null,
                        };

                        if (record.shipChanged) {
                                statisticRecords.push({
                                        entityType: 'curriculum_vitae',
                                        entityId: record.id == null ? null : String(record.id),
                                        changeType: 'ship',
                                        previousShip: record.previousShip,
                                        ship: candidate.ship,
                                        reference,
                                        metadata,
                                });
                                return;
                        }

                        if (candidate.ship === DEFAULT_SHIP) {
                                baselineRecords.push({
                                        entityId: record.id == null ? null : String(record.id),
                                        reference,
                                        metadata,
                                });
                        }
                });
        }

        if (baselineRecords.length > 0) {
                const recordMap = new Map();
                baselineRecords.forEach((record) => {
                        if (!record.entityId) {
                                return;
                        }
                        if (!recordMap.has(record.entityId)) {
                                recordMap.set(record.entityId, record);
                        }
                });

                const existingIds = await recruitmentStatisticRepo.findExistingShipStatisticEntityIds(
                        Array.from(recordMap.keys())
                );

                recordMap.forEach((record, entityId) => {
                        if (existingIds.has(entityId)) {
                                return;
                        }
                        statisticRecords.push({
                                entityType: 'curriculum_vitae',
                                entityId,
                                changeType: 'ship',
                                previousShip: null,
                                ship: DEFAULT_SHIP,
                                reference: record.reference || null,
                                metadata: record.metadata,
                        });
                });
        }

        if (statisticRecords.length > 0) {
                try {
                        statisticsInserted = await recruitmentStatisticRepo.bulkInsertStatistics(statisticRecords);
                } catch (error) {
                        logger.error(
                                `[RecruitmentProcessSync] failed to write recruitment statistics: ${error.message}`,
                                error
                        );
                }
        }

	if (unknownStatuses.size > 0) {
		logger.warn(
			`[RecruitmentProcessSync] Encountered unmapped statuses: ${Array.from(unknownStatuses).join(', ')}`
		);
	}

	if (unmatchedContacts.length > 0) {
		const sample = unmatchedContacts.slice(0, 10)
			.map((entry) => `${entry.contact}${entry.name ? `(${entry.name})` : ''}`)
			.join(', ');
		logger.warn(
			`[RecruitmentProcessSync] Unable to match curriculum vitae by contact for ${unmatchedContacts.length} candidates. Sample: ${sample}`
		);
	}

	logger.info(
                `[RecruitmentProcessSync] processed ${rows.length} processes, prepared ${candidateMap.size} candidate updates, affected ${updated} curriculum vitae rows, synced ${positionCount} recruitment positions, recorded ${statisticsInserted} recruitment statistics.`
        );

        return {
                totalProcesses: rows.length,
                candidates: candidateMap.size,
                updated,
                unknownStatuses: Array.from(unknownStatuses),
                unmatchedContacts: unmatchedContacts.map((entry) => entry.contact),
                positions: positionCount,
                statistics: statisticsInserted,
        };
};

module.exports = {
	syncCurriculumVitaeStatus,
};