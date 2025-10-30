const {logger} = require('@/utils/log');
const recruitmentProcessRepo = require('@/repository/recruitment/recruitmentProcessRepo');
const curriculumVitaeRepo = require('@/repository/curriculumVitaeRepo');
const recruitmentPositionRepo = require('@/repository/recruitment/recruitmentPositionRepo');
const recruitmentStatisticRepo = require('@/repository/recruitment/recruitmentStatisticRepo');
const onboardingProcessRepo = require('@/repository/recruitment/onboardingProcessRepo');
const {FIELD_IDS} = recruitmentProcessRepo;
const {FIELD_IDS: ONBOARDING_FIELD_IDS} = onboardingProcessRepo;
const {
        DEFAULT_SHIP,
        SHIP_PRIORITY,
        resolveShip,
} = require('./recruitmentProcessStatus');
const CONTACT_SPLIT_REGEX = /[\s,;；，、|/\\]+/u;
const MIN_CONTACT_TOKEN_LENGTH = 3;
const MIN_DIGIT_TOKEN_LENGTH = 6;
const HEADCOUNT_FULL_REMARK = '岗位已招满,自动进入面试淘汰状态';
const NOT_ONBOARDED_REMARK = '面试通过但未入职';
const ONBOARDING_STATUS = {
        confirmed: '已确认入职',
        notConfirmed: '未确认入职',
};

const normalizeCandidateName = (value = '') => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const normalizeContactValue = (value = '') => (typeof value === 'string' ? value.replace(/\s+/g, '') : '');
const toDigits = (value = '') => (typeof value === 'string' ? value.replace(/\D+/g, '') : '');

const toContactTokens = (value = '') => {
        if (typeof value !== 'string') {
                return [];
        }

        const trimmed = value.trim();
        if (!trimmed) {
                return [];
        }

        const tokens = new Set();
        const normalizedValue = normalizeContactValue(trimmed);
        if (normalizedValue) {
                tokens.add(normalizedValue);
        }

        trimmed.split(CONTACT_SPLIT_REGEX).forEach((part) => {
                const token = part.trim();
                if (!token) {
                        return;
                }
                const normalized = normalizeContactValue(token);
                if (normalized) {
                        tokens.add(normalized);
                }
                const digits = toDigits(token);
                if (digits.length >= MIN_DIGIT_TOKEN_LENGTH) {
                        tokens.add(digits);
                }
        });

        const digits = toDigits(trimmed);
        if (digits.length >= MIN_DIGIT_TOKEN_LENGTH) {
                tokens.add(digits);
        }

        return Array.from(tokens).filter((token) => token && token.length >= MIN_CONTACT_TOKEN_LENGTH);
};

const parseHeadcount = (value) => {
        if (value === null || value === undefined) {
                return null;
        }

        if (typeof value === 'number') {
                if (!Number.isFinite(value)) {
                        return null;
                }
                return Math.max(0, Math.floor(value));
        }

        if (typeof value === 'string') {
                const trimmed = value.trim();
                if (!trimmed) {
                        return null;
                }

                const numeric = Number(trimmed);
                if (Number.isFinite(numeric)) {
                        return Math.max(0, Math.floor(numeric));
                }

                const match = trimmed.match(/\d+/);
                if (match) {
                        return Number.parseInt(match[0], 10);
                }
        }

        return null;
};

const normalizeOnboardingStatus = (value) => {
        if (typeof value !== 'string') {
                return '';
        }

        return value.trim();
};

const parseDateValue = (value) => {
        if (!value) {
                return null;
        }

        if (value instanceof Date && !Number.isNaN(value.getTime())) {
                return value;
        }

        if (typeof value === 'number') {
                const date = new Date(value);
                return Number.isNaN(date.getTime()) ? null : date;
        }

        if (typeof value === 'string') {
                const trimmed = value.trim();
                if (!trimmed) {
                        return null;
                }

                const sanitized = trimmed
                        .replace(/[年月]/g, '-')
                        .replace(/[日]/g, '')
                        .replace(/[./]/g, '-');
                const parsed = new Date(sanitized);
                if (!Number.isNaN(parsed.getTime())) {
                        return parsed;
                }
        }

        const fallback = new Date(value);
        return Number.isNaN(fallback.getTime()) ? null : fallback;
};

const getLatestDate = (dates = []) => {
        if (!Array.isArray(dates) || dates.length === 0) {
                return null;
        }

        const timestamps = dates
                .filter((date) => date instanceof Date && !Number.isNaN(date.getTime()))
                .map((date) => date.getTime());

        if (timestamps.length === 0) {
                return null;
        }

        return new Date(Math.max(...timestamps));
};

const extractCandidateEntries = (fieldMap = {}, context = {}, options = {}) => {
        const {includeWithoutContact = false} = options;
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
                                contact: typeof entry['简历联系方式'] === 'string' ? entry['简历联系方式'].trim() : '',
                                status: typeof entry['面试状态'] === 'string' ? entry['面试状态'].trim() : '',
                                interviewComment: typeof entry['面试评价'] === 'string' ? entry['面试评价'].trim() : '',
                                interviewRemark,
                        };
                })
                .filter(
                        (entry) =>
                                entry.status &&
                                (includeWithoutContact || (typeof entry.contact === 'string' && entry.contact.trim().length > 0))
                );
};

const buildCandidateUpdates = (rows) => {
	const candidateMap = new Map();
	const unknownStatuses = new Set();

	rows.forEach((row) => {
		const candidates = extractCandidateEntries(row.fieldMap, {processId: row.processId});
		candidates.forEach((candidate) => {
                        const ship = resolveShip(candidate.status);
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

const buildRecruitmentCandidateContext = (rows = []) => {
        const processMap = new Map();
        const contactValueIndex = new Map();
        const contactTokenIndex = new Map();
        const nameIndex = new Map();

        rows.forEach((row) => {
                const {fieldMap = {}} = row;
                const headcount = parseHeadcount(fieldMap[FIELD_IDS.headcount]);
                const jobTitle = fieldMap[FIELD_IDS.jobTitle] || null;
                const processContext =
                        processMap.get(row.processId) ||
                        {
                                processId: row.processId,
                                title: row.title || null,
                                headcount,
                                jobTitle,
                                fieldMap,
                                candidates: [],
                        };

                processContext.headcount = headcount;
                processContext.jobTitle = jobTitle || processContext.jobTitle;
                processContext.fieldMap = fieldMap;
                processMap.set(row.processId, processContext);

                const candidates = extractCandidateEntries(fieldMap, {processId: row.processId}, {includeWithoutContact: true});
                candidates.forEach((candidate, index) => {
                        const candidateContext = {
                                processId: row.processId,
                                processCode: row.processCode,
                                processTitle: row.title || null,
                                jobTitle,
                                headcount,
                                name: candidate.name,
                                contact: candidate.contact,
                                status: candidate.status,
                                interviewComment: candidate.interviewComment,
                                interviewRemark: candidate.interviewRemark,
                                candidateIndex: index,
                        };

                        const candidateKey =
                                candidate.contact && candidate.contact.trim().length > 0
                                        ? normalizeContactValue(candidate.contact)
                                        : `${row.processId || 'unknown'}#${index}`;
                        candidateContext.candidateKey = candidateKey;
                        processContext.candidates.push(candidateContext);

                        const normalizedName = normalizeCandidateName(candidate.name);
                        if (normalizedName) {
                                if (!nameIndex.has(normalizedName)) {
                                        nameIndex.set(normalizedName, new Set());
                                }
                                nameIndex.get(normalizedName).add(candidateContext);
                        }

                        if (candidate.contact) {
                                const normalizedContact = normalizeContactValue(candidate.contact);
                                if (normalizedContact) {
                                        if (!contactValueIndex.has(normalizedContact)) {
                                                contactValueIndex.set(normalizedContact, new Set());
                                        }
                                        contactValueIndex.get(normalizedContact).add(candidateContext);
                                }

                                const tokens = toContactTokens(candidate.contact);
                                candidateContext.contactTokens = tokens;
                                tokens.forEach((token) => {
                                        if (!contactTokenIndex.has(token)) {
                                                contactTokenIndex.set(token, new Set());
                                        }
                                        contactTokenIndex.get(token).add(candidateContext);
                                });
                        }
                });
        });

        return {
                processMap,
                contactValueIndex,
                contactTokenIndex,
                nameIndex,
        };
};

const matchRecruitmentCandidate = (context, candidateInfo = {}) => {
        if (!context) {
                return null;
        }

        const {contact, name} = candidateInfo;
        const normalizedName = normalizeCandidateName(name);
        const candidates = new Set();

        const normalizedContact = normalizeContactValue(contact);
        if (normalizedContact) {
                const directMatches = context.contactValueIndex.get(normalizedContact);
                if (directMatches) {
                        directMatches.forEach((candidate) => candidates.add(candidate));
                }
        }

        const contactTokens = toContactTokens(contact);
        contactTokens.forEach((token) => {
                const tokenMatches = context.contactTokenIndex.get(token);
                if (tokenMatches) {
                        tokenMatches.forEach((candidate) => candidates.add(candidate));
                }
        });

        if (candidates.size > 0) {
                let matched = Array.from(candidates);
                if (normalizedName) {
                        const filtered = matched.filter(
                                (candidate) => normalizeCandidateName(candidate.name) === normalizedName
                        );
                        if (filtered.length === 1) {
                                return {
                                        context: filtered[0],
                                        matchedBy: normalizedContact ? 'contact+name' : 'name',
                                        ambiguous: false,
                                        candidates: matched,
                                };
                        }

                        if (filtered.length > 0) {
                                matched = filtered;
                        }
                }

                if (matched.length === 1) {
                        return {
                                context: matched[0],
                                matchedBy: normalizedContact ? 'contact' : 'candidate_list',
                                ambiguous: false,
                                candidates: matched,
                        };
                }

                return {
                        context: matched[0],
                        matchedBy: normalizedContact ? 'contact' : 'candidate_list',
                        ambiguous: true,
                        candidates: matched,
                };
        }

        if (normalizedName) {
                const nameMatches = context.nameIndex.get(normalizedName);
                if (nameMatches && nameMatches.size > 0) {
                        const matched = Array.from(nameMatches);
                        if (matched.length === 1) {
                                return {
                                        context: matched[0],
                                        matchedBy: 'name',
                                        ambiguous: false,
                                        candidates: matched,
                                };
                        }

                        return {
                                context: matched[0],
                                matchedBy: 'name',
                                ambiguous: true,
                                candidates: matched,
                        };
                }
        }

        return null;
};

const syncOnboardingProcesses = async ({recruitmentContext, shipChangeStatistics}) => {
        const rows = await onboardingProcessRepo.getOnboardingProcesses();
        const summary = {
                total: Array.isArray(rows) ? rows.length : 0,
                considered: 0,
                matched: 0,
                confirmed: 0,
                unconfirmed: 0,
                filledProcesses: 0,
                updatedRows: 0,
                unmatched: [],
        };

        if (!rows || rows.length === 0) {
                return summary;
        }

        const outcomes = [];
        const confirmedByProcess = new Map();
        const processedCandidateKeys = new Set();

        for (const row of rows) {
                const fieldMap = row.fieldMap || {};
                const status = normalizeOnboardingStatus(fieldMap[ONBOARDING_FIELD_IDS.status]);
                if (!status || (status !== ONBOARDING_STATUS.confirmed && status !== ONBOARDING_STATUS.notConfirmed)) {
                        continue;
                }

                summary.considered += 1;

                const candidateName =
                        typeof fieldMap[ONBOARDING_FIELD_IDS.candidateName] === 'string'
                                ? fieldMap[ONBOARDING_FIELD_IDS.candidateName].trim()
                                : '';
                const contact =
                        typeof fieldMap[ONBOARDING_FIELD_IDS.contact] === 'string'
                                ? fieldMap[ONBOARDING_FIELD_IDS.contact].trim()
                                : '';
                const entryDate = parseDateValue(fieldMap[ONBOARDING_FIELD_IDS.entryDate]);

                const match = matchRecruitmentCandidate(recruitmentContext, {contact, name: candidateName});

                if (!match || !match.context) {
                        summary.unmatched.push({
                                processId: row.processId,
                                status,
                                contact: contact || null,
                                name: candidateName || null,
                        });
                        continue;
                }

                summary.matched += 1;
                outcomes.push({
                        row,
                        fieldMap,
                        status,
                        candidateName,
                        contact,
                        entryDate,
                        match,
                });

                if (match.ambiguous) {
                        const candidatesDescription = (match.candidates || [])
                                .slice(0, 3)
                                .map((candidate) => `${candidate.name || '未知'}@${candidate.processId}`)
                                .join(', ');
                        logger.warn(
                                `[RecruitmentProcessSync] Ambiguous recruitment candidate match for onboarding process ${row.processId}. Using first candidate. Candidates: ${candidatesDescription}`
                        );
                }
        }

        if (outcomes.length === 0) {
                return summary;
        }

        for (const outcome of outcomes) {
                const {row, status, candidateName, contact, entryDate, match, fieldMap} = outcome;
                const candidateContext = match.context;
                const resolvedContact = candidateContext.contact || contact;

                if (!resolvedContact) {
                        summary.unmatched.push({
                                processId: row.processId,
                                status,
                                contact: contact || null,
                                name: candidateName || null,
                                reason: 'missing_contact',
                        });
                        continue;
                }

                const ship = status === ONBOARDING_STATUS.confirmed ? 9 : 6;
                const remark = status === ONBOARDING_STATUS.confirmed ? null : NOT_ONBOARDED_REMARK;

                const metadata = {
                        source: 'onboarding',
                        onboardingStatus: status,
                        onboardingProcessId: row.processId,
                        onboardingMatchedBy: match.matchedBy,
                        onboardingName: candidateName || null,
                        onboardingContact: contact || null,
                        recruitmentProcessId: candidateContext.processId || null,
                        recruitmentProcessTitle: candidateContext.processTitle || null,
                        recruitmentJobTitle: candidateContext.jobTitle || null,
                        headcount: candidateContext.headcount ?? null,
                };

                if (remark) {
                        metadata.note = remark;
                }

                if (entryDate) {
                        metadata.onboardingDate = entryDate.toISOString();
                } else if (typeof fieldMap[ONBOARDING_FIELD_IDS.entryDate] === 'string') {
                        metadata.onboardingDateRaw = fieldMap[ONBOARDING_FIELD_IDS.entryDate];
                }

                const result = await curriculumVitaeRepo.updateShipByContact(
                        resolvedContact,
                        ship,
                        candidateContext.name || candidateName,
                        {lockSync: true}
                );

                if (result.affectedRows > 0) {
                        summary.updatedRows += result.affectedRows;
                }

                if (status === ONBOARDING_STATUS.confirmed) {
                        summary.confirmed += 1;
                } else if (status === ONBOARDING_STATUS.notConfirmed) {
                        summary.unconfirmed += 1;
                }

                if (result.changedRecords.length > 0) {
                        result.changedRecords.forEach((record) => {
                                shipChangeStatistics.push({
                                        entityType: 'curriculum_vitae',
                                        entityId: record.id ? String(record.id) : null,
                                        changeType: 'ship',
                                        previousShip: record.previousShip,
                                        ship,
                                        reference: resolvedContact || null,
                                        recordedAt: entryDate || undefined,
                                        metadata,
                                });
                        });
                }

                if (result.matchedCount === 0) {
                        summary.unmatched.push({
                                processId: row.processId,
                                status,
                                contact: resolvedContact,
                                name: candidateContext.name || candidateName || null,
                                reason: 'curriculum_vitae_not_found',
                        });
                        continue;
                }

                processedCandidateKeys.add(candidateContext.candidateKey);

                if (status === ONBOARDING_STATUS.confirmed) {
                        if (!confirmedByProcess.has(candidateContext.processId)) {
                                confirmedByProcess.set(candidateContext.processId, {
                                        keys: new Set(),
                                        entryDates: [],
                                });
                        }
                        const info = confirmedByProcess.get(candidateContext.processId);
                        info.keys.add(candidateContext.candidateKey);
                        if (entryDate) {
                                info.entryDates.push(entryDate);
                        }
                }
        }

        for (const [processId, info] of confirmedByProcess.entries()) {
                const processContext = recruitmentContext.processMap.get(processId);
                if (!processContext) {
                        continue;
                }

                const headcount = processContext.headcount;
                if (!headcount || headcount <= 0) {
                        continue;
                }

                if (info.keys.size < headcount) {
                        continue;
                }

                const fillDate = getLatestDate(info.entryDates);
                summary.filledProcesses += 1;

                for (const candidateContext of processContext.candidates) {
                        if (!candidateContext.contact) {
                                continue;
                        }

                        if (info.keys.has(candidateContext.candidateKey)) {
                                continue;
                        }

                        if (processedCandidateKeys.has(candidateContext.candidateKey)) {
                                continue;
                        }

                        const result = await curriculumVitaeRepo.updateShipByContact(
                                candidateContext.contact,
                                6,
                                candidateContext.name,
                                {lockSync: true}
                        );

                        if (result.affectedRows > 0) {
                                summary.updatedRows += result.affectedRows;
                        }

                        if (result.changedRecords.length > 0) {
                                result.changedRecords.forEach((record) => {
                                        shipChangeStatistics.push({
                                                entityType: 'curriculum_vitae',
                                                entityId: record.id ? String(record.id) : null,
                                                changeType: 'ship',
                                                previousShip: record.previousShip,
                                                ship: 6,
                                                reference: candidateContext.contact || null,
                                                recordedAt: fillDate || undefined,
                                                metadata: {
                                                        source: 'onboarding',
                                                        reason: 'position_filled',
                                                        note: HEADCOUNT_FULL_REMARK,
                                                        recruitmentProcessId: processId,
                                                        recruitmentProcessTitle: processContext.title || null,
                                                        recruitmentJobTitle: candidateContext.jobTitle || null,
                                                        headcount,
                                                },
                                        });
                                });
                        }
                }
        }

        return summary;
};

const syncCurriculumVitaeStatus = async () => {
	const rows = await recruitmentProcessRepo.getRecruitmentProcesses();
	if (!rows || rows.length === 0) {
		return {
			totalProcesses: 0,
			candidates: 0,
			updated: 0,
			unknownStatuses: [],
			positions: 0,
		};
	}

        const recruitmentPositions = buildRecruitmentPositions(rows);
        const recruitmentContext = buildRecruitmentCandidateContext(rows);
	let positionCount = 0;
	try {
		positionCount = await recruitmentPositionRepo.upsertRecruitmentPositions(recruitmentPositions);
	} catch (error) {
		logger.error(`[RecruitmentProcessSync] failed to sync recruitment positions: ${error.message}`, error);
	}
	const {candidateMap, unknownStatuses} = buildCandidateUpdates(rows);

	let updated = 0;
	const unmatchedContacts = [];
	const shipChangeStatistics = [];
        for (const candidate of candidateMap.values()) {
                let result = {matchedCount: 0, affectedRows: 0, changedRecords: []};
                if (candidate.contact) {
                        result = await curriculumVitaeRepo.updateShipByContact(
                                candidate.contact,
                                candidate.ship,
				candidate.name
			);
		}

		if (result.affectedRows > 0) {
			updated += result.affectedRows;
		}

		if (result.changedRecords.length > 0) {
			result.changedRecords.forEach((record) => {
				shipChangeStatistics.push({
					entityType: 'curriculum_vitae',
					entityId: record.id ? String(record.id) : null,
					changeType: 'ship',
					previousShip: record.previousShip,
					ship: candidate.ship,
					reference: candidate.contact || null,
					metadata: {
						status: candidate.status || null,
						name: candidate.name || null,
						interviewComment: candidate.interviewComment || null,
						interviewRemark: candidate.interviewRemark || null,
					},
				});
			});
		}

		if (result.matchedCount === 0) {
			unmatchedContacts.push({
				contact: candidate.contact,
				name: candidate.name,
				status: candidate.status,
                        });
                }
        }

        let onboardingSummary;
        try {
                onboardingSummary = await syncOnboardingProcesses({
                        recruitmentContext,
                        shipChangeStatistics,
                });
        } catch (error) {
                logger.error(
                        `[RecruitmentProcessSync] failed to sync onboarding processes: ${error.message}`,
                        error
                );
        }
        if (!onboardingSummary || typeof onboardingSummary !== 'object') {
                onboardingSummary = {
                        total: 0,
                        considered: 0,
                        matched: 0,
                        confirmed: 0,
                        unconfirmed: 0,
                        filledProcesses: 0,
                        updatedRows: 0,
                        unmatched: [],
                };
        }

        if (typeof onboardingSummary.updatedRows === 'number' && onboardingSummary.updatedRows > 0) {
                updated += onboardingSummary.updatedRows;
        }

        if (shipChangeStatistics.length > 0) {
                try {
                        await recruitmentStatisticRepo.bulkInsertStatistics(shipChangeStatistics);
                } catch (error) {
                        logger.error(
                                `[RecruitmentProcessSync] failed to record curriculum vitae ship statistics: ${error.message}`,
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

        if (Array.isArray(onboardingSummary.unmatched) && onboardingSummary.unmatched.length > 0) {
                const sample = onboardingSummary.unmatched
                        .slice(0, 10)
                        .map((entry) => {
                                const parts = [];
                                if (entry.processId) {
                                        parts.push(String(entry.processId));
                                }
                                if (entry.name) {
                                        parts.push(entry.name);
                                }
                                if (entry.contact) {
                                        parts.push(entry.contact);
                                }
                                if (entry.status) {
                                        parts.push(entry.status);
                                }
                                return parts.join('/');
                        })
                        .join(', ');
                logger.warn(
                        `[RecruitmentProcessSync] Unable to reconcile onboarding records for ${onboardingSummary.unmatched.length} entries. Sample: ${sample}`
                );
        }

        logger.info(
                `[RecruitmentProcessSync] processed ${rows.length} recruitment processes, prepared ${candidateMap.size} candidate updates, affected ${updated} curriculum vitae rows, synced ${positionCount} recruitment positions, processed ${onboardingSummary.considered || 0} onboarding status entries (${onboardingSummary.confirmed || 0} confirmed, ${onboardingSummary.unconfirmed || 0} not confirmed, ${onboardingSummary.filledProcesses || 0} positions filled).`
        );

        return {
                totalProcesses: rows.length,
                candidates: candidateMap.size,
                updated,
                unknownStatuses: Array.from(unknownStatuses),
                unmatchedContacts: unmatchedContacts.map((entry) => entry.contact),
                positions: positionCount,
                onboarding: onboardingSummary,
        };
};

module.exports = {
	syncCurriculumVitaeStatus,
};