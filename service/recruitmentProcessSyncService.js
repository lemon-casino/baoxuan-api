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

const normalizeStatus = (status = '') => status.replace(/\s+/g, '').toLowerCase();

const resolveShip = (status) => STATUS_TO_SHIP.get(status) ?? STATUS_TO_SHIP.get(status.toUpperCase()) ?? null;
const toTimestamp = (value) => {
        if (!value) {
                return null;
        }

        const date = value instanceof Date ? value : new Date(value);
        const timestamp = date.getTime();

        return Number.isFinite(timestamp) ? timestamp : null;
};

const extractCandidateEntries = (fieldMap = {}, context = {}) => {
        const {
                processId = null,
                version = null,
                status: processStatus = null,
                startTime = null,
                endTime = null,
        } = context;

        const parsedVersion =
                typeof version === 'number'
                        ? version
                        : typeof version === 'string' && version.trim().length > 0
                                ? Number(version)
                                : null;
        const sourceVersion = Number.isFinite(parsedVersion) ? parsedVersion : null;
        const sourceStartTime = startTime ?? null;
        const sourceEndTime = endTime ?? null;
        const sourceUpdatedAt = sourceEndTime || sourceStartTime || null;
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
                                sourceProcessId: processId,
                                sourceVersion,
                                sourceProcessStatus: processStatus,
                                sourceStartTime,
                                sourceEndTime,
                                sourceUpdatedAt,
                        };
                })
                .filter((entry) => entry.contact && entry.status);
};

const shouldReplaceCandidate = (existing, next) => {
        if (!existing) {
                return true;
        }

        const existingUpdatedAt = toTimestamp(existing.sourceUpdatedAt || existing.sourceEndTime || existing.sourceStartTime);
        const nextUpdatedAt = toTimestamp(next.sourceUpdatedAt || next.sourceEndTime || next.sourceStartTime);

        if (existingUpdatedAt && nextUpdatedAt) {
                if (nextUpdatedAt > existingUpdatedAt) {
                        return true;
                }

                if (nextUpdatedAt < existingUpdatedAt) {
                        return false;
                }
        } else if (nextUpdatedAt && !existingUpdatedAt) {
                return true;
        } else if (!nextUpdatedAt && existingUpdatedAt) {
                return false;
        }

        const existingVersion =
                typeof existing.sourceVersion === 'number' && Number.isFinite(existing.sourceVersion)
                        ? existing.sourceVersion
                        : null;
        const nextVersion =
                typeof next.sourceVersion === 'number' && Number.isFinite(next.sourceVersion) ? next.sourceVersion : null;

        if (existingVersion !== null && nextVersion !== null) {
                if (nextVersion > existingVersion) {
                        return true;
                }

                if (nextVersion < existingVersion) {
                        return false;
                }
        } else if (nextVersion !== null && existingVersion === null) {
                return true;
        } else if (existingVersion !== null && nextVersion === null) {
                return false;
        }

        if (existing.ship == null && next.ship != null) {
                return true;
        }

        if (next.ship == null && existing.ship != null) {
                return false;
        }

        return false;
};

const buildCandidateUpdates = (rows) => {
        const candidateMap = new Map();
        const unknownStatuses = new Set();

        rows.forEach((row) => {
                const candidates = extractCandidateEntries(row.fieldMap, {
                        processId: row.processId,
                        version: row.version,
                        status: row.status,
                        startTime: row.startTime,
                        endTime: row.endTime,
                });
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
                                sourceProcessId: candidate.sourceProcessId,
                                sourceVersion: candidate.sourceVersion,
                                sourceProcessStatus: candidate.sourceProcessStatus,
                                sourceStartTime: candidate.sourceStartTime,
                                sourceEndTime: candidate.sourceEndTime,
                                sourceUpdatedAt: candidate.sourceUpdatedAt,
                        };

                        const candidateKey = candidate.contact;
                        const existing = candidateMap.get(candidateKey);
                        if (!existing || shouldReplaceCandidate(existing, payload)) {
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
                        statisticsRecorded: 0,
                };
        }

        const recruitmentPositions = buildRecruitmentPositions(rows);
        let positionCount = 0;
        try {
                const positionResult = await recruitmentPositionRepo.upsertRecruitmentPositions(recruitmentPositions);
                positionCount = positionResult?.affectedCount ?? 0;
        } catch (error) {
                logger.error(`[RecruitmentProcessSync] failed to sync recruitment positions: ${error.message}`, error);
        }
        const {candidateMap, unknownStatuses} = buildCandidateUpdates(rows);

        let updated = 0;
        const unmatchedContacts = [];
        const statisticEntries = [];
        const initialShipRecorded = new Set();
        const now = new Date();
        for (const candidate of candidateMap.values()) {
                let affected = 0;
                let changes = [];
                if (candidate.contact) {
                        const result = await curriculumVitaeRepo.updateShipByContact(
                                candidate.contact,
                                candidate.ship,
                                candidate.name
                        );
                        affected = result?.affectedRows ?? 0;
                        changes = result?.changes ?? [];
                }
                if (affected > 0) {
                        updated += affected;
                        changes.forEach((change) => {
                                const sourceStartTimestamp = toTimestamp(candidate.sourceStartTime);
                                const sourceEndTimestamp = toTimestamp(candidate.sourceEndTime);
                                const sourceUpdatedTimestamp = toTimestamp(candidate.sourceUpdatedAt);

                                statisticEntries.push({
                                        entityType: 'curriculum_vitae',
                                        entityId: change.id ? String(change.id) : null,
                                        reference: candidate.contact || null,
                                        changeType: 'ship',
                                        previousShip: change.previousShip ?? null,
                                        ship: change.newShip ?? candidate.ship ?? null,
                                        recordedAt: now,
                                        metadata: {
                                                name: candidate.name || null,
                                                status: candidate.status || null,
                                                interviewComment: candidate.interviewComment || null,
                                                interviewRemark: candidate.interviewRemark || null,
                                                processId: candidate.sourceProcessId || null,
                                                processVersion: candidate.sourceVersion ?? null,
                                                processStatus: candidate.sourceProcessStatus || null,
                                                processStartTime: sourceStartTimestamp
                                                        ? new Date(sourceStartTimestamp).toISOString()
                                                        : null,
                                                processEndTime: sourceEndTimestamp
                                                        ? new Date(sourceEndTimestamp).toISOString()
                                                        : null,
                                                processUpdatedAt: sourceUpdatedTimestamp
                                                        ? new Date(sourceUpdatedTimestamp).toISOString()
                                                        : null,
                                        },
                                });
                        });
                } else {
                        let matched = false;
                        if (candidate.ship === DEFAULT_SHIP && candidate.contact) {
                                const matches = await curriculumVitaeRepo.findByContact(candidate.contact);
                                for (const record of matches) {
                                        matched = true;
                                        const entityId = record?.id ? String(record.id) : null;
                                        const dedupeKey = entityId || `${candidate.contact}:${DEFAULT_SHIP}`;
                                        if (initialShipRecorded.has(dedupeKey)) {
                                                continue;
                                        }

                                        const alreadyExists = await recruitmentStatisticRepo.hasCurriculumVitaeShipStatistic({
                                                entityId,
                                                reference: candidate.contact,
                                                ship: DEFAULT_SHIP,
                                        });
                                        if (alreadyExists) {
                                                initialShipRecorded.add(dedupeKey);
                                                continue;
                                        }

                                        const sourceStartTimestamp = toTimestamp(candidate.sourceStartTime);
                                        const sourceEndTimestamp = toTimestamp(candidate.sourceEndTime);
                                        const sourceUpdatedTimestamp = toTimestamp(candidate.sourceUpdatedAt);

                                        initialShipRecorded.add(dedupeKey);
                                        statisticEntries.push({
                                                entityType: 'curriculum_vitae',
                                                entityId,
                                                reference: candidate.contact || null,
                                                changeType: 'ship',
                                                previousShip: null,
                                                ship: DEFAULT_SHIP,
                                                recordedAt: now,
                                                metadata: {
                                                        name: candidate.name || null,
                                                        status: candidate.status || null,
                                                        interviewComment: candidate.interviewComment || null,
                                                        interviewRemark: candidate.interviewRemark || null,
                                                        processId: candidate.sourceProcessId || null,
                                                        processVersion: candidate.sourceVersion ?? null,
                                                        processStatus: candidate.sourceProcessStatus || null,
                                                        processStartTime: sourceStartTimestamp
                                                                ? new Date(sourceStartTimestamp).toISOString()
                                                                : null,
                                                        processEndTime: sourceEndTimestamp
                                                                ? new Date(sourceEndTimestamp).toISOString()
                                                                : null,
                                                        processUpdatedAt: sourceUpdatedTimestamp
                                                                ? new Date(sourceUpdatedTimestamp).toISOString()
                                                                : null,
                                                },
                                        });
                                }
                        }

                        if (!matched) {
                                unmatchedContacts.push({
                                        contact: candidate.contact,
                                        name: candidate.name,
                                        status: candidate.status,
                                });
                        }
                }
        }

        // recruitment_positions 相关统计待定，暂时不记录职位维度的变化

        if (statisticEntries.length > 0) {
                try {
                        await recruitmentStatisticRepo.bulkInsertStatistics(statisticEntries);
                } catch (error) {
                        logger.error(
                                `[RecruitmentProcessSync] failed to record recruitment statistics: ${error.message}`,
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
                `[RecruitmentProcessSync] processed ${rows.length} processes, prepared ${candidateMap.size} candidate updates, affected ${updated} curriculum vitae rows, synced ${positionCount} recruitment positions.`
        );

        return {
                totalProcesses: rows.length,
                candidates: candidateMap.size,
                updated,
                unknownStatuses: Array.from(unknownStatuses),
                unmatchedContacts: unmatchedContacts.map((entry) => entry.contact),
                positions: positionCount,
                statisticsRecorded: statisticEntries.length,
        };
};

module.exports = {
	syncCurriculumVitaeStatus,
};