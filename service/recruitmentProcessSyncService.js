const {logger} = require('@/utils/log');
const recruitmentProcessRepo = require('@/repository/recruitment/recruitmentProcessRepo');
const curriculumVitaeRepo = require('@/repository/curriculumVitaeRepo');

const STATUS_TO_SHIP = new Map([
        ['未面试', 1],
        ['hr面', 2],
        ['初选通过', 2],
        ['一面', 3],
        ['二面', 3],
        ['三面', 3],
        ['四面', 3],
        ['面试通过', 4],
        ['面试通过-候选人考虑中', 6],
        ['offer', 5],
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

const extractCandidateEntries = (content, context = {}) => {
        if (!content) {
                return [];
        }
        let parsed;
        try {
                parsed = JSON.parse(content);
        } catch (error) {
                logger.warn(
                        `[RecruitmentProcessSync] Failed to parse content for process ${context.processId || 'unknown'}: ${error.message}`
                );
                return [];
        }

        if (!Array.isArray(parsed)) {
                return [];
        }

        return parsed.map((entry) => ({
                name: typeof entry['候选人'] === 'string' ? entry['候选人'].trim() : '',
                status: typeof entry['面试状态'] === 'string' ? entry['面试状态'].trim() : '',
                interviewComment: typeof entry['面试评价'] === 'string' ? entry['面试评价'].trim() : '',
                interviewRemark: typeof entry['备注'] === 'string' ? entry['备注'].trim() : '',
        })).filter((entry) => entry.name && entry.status);
};

const buildCandidateUpdates = (rows) => {
        const candidateMap = new Map();
        const unknownStatuses = new Set();

        rows.forEach((row) => {
                const candidates = extractCandidateEntries(row.content, {processId: row.processId});
                candidates.forEach((candidate) => {
                        const normalizedStatus = normalizeStatus(candidate.status);
                        const ship = STATUS_TO_SHIP.get(normalizedStatus);
                        if (!ship) {
                                unknownStatuses.add(candidate.status);
                        }
                        const resolvedShip = ship ?? DEFAULT_SHIP;
                        const payload = {
                                name: candidate.name,
                                ship: resolvedShip,
                                status: candidate.status,
                                interviewComment: candidate.interviewComment,
                                interviewRemark: candidate.interviewRemark,
                        };

                        const existing = candidateMap.get(candidate.name);
                        const currentPriority = SHIP_PRIORITY[resolvedShip] ?? 0;
                        const existingPriority = existing ? (SHIP_PRIORITY[existing.ship] ?? 0) : -Infinity;

                        if (!existing || currentPriority >= existingPriority) {
                                candidateMap.set(candidate.name, payload);
                        }
                });
        });

        return {
                candidateMap,
                unknownStatuses,
        };
};

const syncCurriculumVitaeStatus = async () => {
        const rows = await recruitmentProcessRepo.getRecruitmentProcessCandidates();
        if (!rows || rows.length === 0) {
                return {
                        totalProcesses: 0,
                        candidates: 0,
                        updated: 0,
                        unknownStatuses: [],
                };
        }

        const {candidateMap, unknownStatuses} = buildCandidateUpdates(rows);

        let updated = 0;
        for (const candidate of candidateMap.values()) {
                const affected = await curriculumVitaeRepo.updateShipByName(candidate.name, candidate.ship);
                if (affected > 0) {
                        updated += affected;
                }
                // if (affected > 0) {
                //         await curriculumVitaeRepo.updateShipByName(candidate.name, candidate.ship, {
                //                 interviewComment: candidate.interviewComment,
                //                 interviewRemark: candidate.interviewRemark,
                //         });
                // }
        }

        if (unknownStatuses.size > 0) {
                        logger.warn(`[RecruitmentProcessSync] Encountered unmapped statuses: ${Array.from(unknownStatuses).join(', ')}`);
        }

        logger.info(`[RecruitmentProcessSync] processed ${rows.length} processes, prepared ${candidateMap.size} candidate updates, affected ${updated} rows.`);

        return {
                totalProcesses: rows.length,
                candidates: candidateMap.size,
                updated,
                unknownStatuses: Array.from(unknownStatuses),
        };
};

module.exports = {
        syncCurriculumVitaeStatus,
};
