const curriculumVitaeRepo = require('../repository/curriculumVitaeRepo');
const recruitmentProcessRepo = require('../repository/recruitment/recruitmentProcessRepo');
const {FIELD_IDS} = recruitmentProcessRepo;
const {DEFAULT_SHIP, resolveShip} = require('./recruitmentProcessStatus');
const SHIP_SUMMARY_ITEMS = [
	{label: '初选通过', ship: 1},
	{label: '约面', ship: 2},
	{label: '面试中', ship: 3},
	{label: '面试通过', ship: 4},
	{label: 'Offer', ship: 5},
	{label: '面试淘汰', ship: 6},
	{label: '简历淘汰', ship: 7},
	{label: '未初始', ship: 8},
];

const allowedFields = [
        'hr',
        'date',
        'job',
        'jobSalary',
	'name',
	'latestCorp',
	'latestJob',
	'gender',
	'ship',
	'age',
	'location',
	'education',
	'seniority',
	'salary',
	'filename',
	'filesize',
        'filepath'
];

const parseCandidateDate = (value) => {
        if (typeof value !== 'string') {
                return null;
        }

        const trimmed = value.trim();
        if (!trimmed) {
                return null;
        }

        const normalized = trimmed.replace(/[./]/g, (match) => (match === '.' ? '-' : '/'));
        const directDate = new Date(normalized);
        if (!Number.isNaN(directDate.getTime())) {
                return directDate;
        }

        const fallbackMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
        if (fallbackMatch) {
                const [, year, month, day] = fallbackMatch;
                const candidate = new Date(Number(year), Number(month) - 1, Number(day));
                if (!Number.isNaN(candidate.getTime())) {
                        return candidate;
                }
        }

        return null;
};

const toFilterArray = (value) => {
        if (Array.isArray(value)) {
                return value
                        .map((item) => (typeof item === 'string' ? item.trim() : `${item}`.trim()))
                        .filter((item) => item.length > 0);
        }

        if (typeof value === 'string') {
                const trimmed = value.trim();
                return trimmed ? [trimmed] : [];
        }

        return [];
};

const hasTextFilter = (value) => toFilterArray(value).length > 0;

const matchesLikeFilter = (source, filterValue) => {
        const values = toFilterArray(filterValue);
        if (values.length === 0) {
                return true;
        }

        const normalizedSource = typeof source === 'string' ? source.toLowerCase() : '';
        return values.some((entry) => normalizedSource.includes(entry.toLowerCase()));
};

const matchesDateRange = (date, start, end) => {
        if (!start && !end) {
                return true;
        }

        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
                return false;
        }

        if (start && date < start) {
                return false;
        }

        if (end && date > end) {
                return false;
        }

        return true;
};

const extractCandidateEntries = (fieldMap = {}) => {
        const content = fieldMap[FIELD_IDS.candidateList];
        if (typeof content !== 'string' || !content.trim()) {
                return [];
        }

        let parsed;
        try {
                parsed = JSON.parse(content);
        } catch (error) {
                return [];
        }

        if (!Array.isArray(parsed)) {
                return [];
        }

        return parsed
                .map((entry) => {
                        const remark = typeof entry['备注'] === 'string' ? entry['备注'].trim() : '';
                        const candidateName = typeof entry['候选人'] === 'string' ? entry['候选人'].trim() : '';
                        const interviewStatus = typeof entry['面试状态'] === 'string' ? entry['面试状态'].trim() : '';
                        const resumeContact = typeof entry['简历联系方式'] === 'string' ? entry['简历联系方式'].trim() : '';
                        const contactField = typeof entry['联系方式'] === 'string' ? entry['联系方式'].trim() : '';
                        const customContact = typeof entry['Fcccmgz0icaudec'] === 'string' ? entry['Fcccmgz0icaudec'].trim() : '';
                        const interviewDate = typeof entry['时间'] === 'string' ? entry['时间'].trim() : '';

                        return {
                                name: candidateName || remark || null,
                                contact: resumeContact || contactField || customContact || null,
                                resumeContact: resumeContact || null,
                                status: interviewStatus,
                                date: parseCandidateDate(interviewDate),
                        };
                })
                .filter((entry) => entry.contact && entry.status);
};

const matchesFallbackFilters = (record, filters) => {
        if (!matchesLikeFilter(record.hr, filters.hr)) {
                return false;
        }

        if (!matchesLikeFilter(record.name, filters.name)) {
                return false;
        }

        if (!matchesLikeFilter(record.job, filters.job)) {
                return false;
        }

        if (hasTextFilter(filters.jobSalary) || hasTextFilter(filters.latestCorp) || hasTextFilter(filters.latestJob)) {
                return false;
        }

        if (hasTextFilter(filters.location) || hasTextFilter(filters.education) || hasTextFilter(filters.seniority)) {
                return false;
        }

        if (hasTextFilter(filters.salary)) {
                return false;
        }

        if (typeof filters.gender === 'number') {
                return false;
        }

        if (typeof filters.ship === 'number' && record.ship !== filters.ship) {
                return false;
        }

        if (!matchesDateRange(record.date, filters.dateStart, filters.dateEnd)) {
                return false;
        }

        return true;
};

const buildFallbackRecords = async (filters) => {
        const processes = await recruitmentProcessRepo.getRecruitmentProcesses();
        if (!Array.isArray(processes) || processes.length === 0) {
                return {records: [], statusByContact: new Map()};
        }

        const candidateEntries = [];

        processes.forEach((processRow) => {
                const fieldMap = processRow.fieldMap || {};
                const owner = typeof fieldMap[FIELD_IDS.owner] === 'string' ? fieldMap[FIELD_IDS.owner].trim() : fieldMap[FIELD_IDS.owner];
                const jobTitle = typeof fieldMap[FIELD_IDS.jobTitle] === 'string' ? fieldMap[FIELD_IDS.jobTitle].trim() : fieldMap[FIELD_IDS.jobTitle];
                const candidates = extractCandidateEntries(fieldMap);
                const processTimestamp = processRow.startTime ? new Date(processRow.startTime).getTime() : 0;

                candidates.forEach((candidate, index) => {
                        candidateEntries.push({
                                candidate,
                                owner,
                                jobTitle,
                                processTimestamp: Number.isNaN(processTimestamp) ? 0 : processTimestamp,
                                index,
                        });
                });
        });

        if (candidateEntries.length === 0) {
                return {records: [], statusByContact: new Map()};
        }

        const uniqueResumeContacts = Array.from(
                new Set(
                        candidateEntries
                                .map((entry) => entry.candidate.resumeContact)
                                .filter((value) => typeof value === 'string' && value.length > 0)
                )
        );

        const matchedResumeContacts = new Set();
        const statusByContact = new Map();
        if (uniqueResumeContacts.length > 0) {
                const results = await Promise.all(
                        uniqueResumeContacts.map(async (resumeContact) => ({
                                resumeContact,
                                matched: await curriculumVitaeRepo.hasContactMatch(resumeContact),
                        }))
                );

                results.forEach(({resumeContact, matched}) => {
                        if (matched) {
                                matchedResumeContacts.add(resumeContact);
                        }
                });
        }

        const fallbackRecords = [];

        candidateEntries.forEach(({candidate, owner, jobTitle, processTimestamp, index}) => {
                const ship = resolveShip(candidate.status) ?? DEFAULT_SHIP;
                const sortTimestamp = candidate.date instanceof Date && !Number.isNaN(candidate.date.getTime())
                        ? candidate.date.getTime()
                        : 0;

                if (candidate.resumeContact) {
                        const existing = statusByContact.get(candidate.resumeContact);
                        const shouldReplace = !existing
                                || existing.sortTimestamp < sortTimestamp
                                || (existing.sortTimestamp === sortTimestamp
                                        && (existing.processTimestamp < processTimestamp
                                                || (existing.processTimestamp === processTimestamp && existing.index > index)));

                        if (shouldReplace) {
                                statusByContact.set(candidate.resumeContact, {
                                        status: candidate.status,
                                        ship,
                                        sortTimestamp,
                                        processTimestamp,
                                        index,
                                });
                        }
                }

                if (candidate.resumeContact && matchedResumeContacts.has(candidate.resumeContact)) {
                        return;
                }

                const record = {
                        id: null,
                        hr: owner || null,
                        date: candidate.date,
                        job: jobTitle || null,
                        jobSalary: null,
                        name: candidate.name,
                        contact: candidate.contact,
                        latestCorp: null,
                        latestJob: null,
                        gender: null,
                        age: null,
                        location: null,
                        education: null,
                        seniority: null,
                        salary: null,
                        filename: null,
                        filesize: null,
                        filepath: null,
                        ship,
                        resumeContact: candidate.resumeContact || null,
                        interviewStatus: candidate.status || null,
                };

                if (!matchesFallbackFilters(record, filters)) {
                        return;
                }

                fallbackRecords.push({
                        record,
                        sortTimestamp,
                        processTimestamp,
                        index,
                });
        });

        fallbackRecords.sort((a, b) => {
                if (a.sortTimestamp !== b.sortTimestamp) {
                        return b.sortTimestamp - a.sortTimestamp;
                }

                if (a.processTimestamp !== b.processTimestamp) {
                        return b.processTimestamp - a.processTimestamp;
                }

                return a.index - b.index;
        });

        return {
                records: fallbackRecords.map((entry) => entry.record),
                statusByContact,
        };
};

const mergeWithFallback = (rows, fallback, count, page, pageSize) => {
        if (!Array.isArray(fallback) || fallback.length === 0) {
                return rows;
        }

        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        if (startIndex >= count) {
                const fallbackStart = startIndex - count;
                const fallbackEnd = Math.min(fallback.length, fallbackStart + pageSize);
                return fallback.slice(fallbackStart, fallbackEnd);
        }

        if (endIndex <= count) {
                return rows;
        }

        const fallbackCount = Math.min(fallback.length, endIndex - count);
        return [...rows, ...fallback.slice(0, fallbackCount)];
};

const toNumberOrNull = (value) => {
	if (value === undefined || value === null || value === '') {
		return null;
	}
	const numberValue = Number(value);
	return Number.isNaN(numberValue) ? null : numberValue;
};

const normalizePayload = (payload = {}) => {
	const normalized = {};

	for (const field of allowedFields) {
		if (payload[field] !== undefined) {
			const value = payload[field];
			if (value === '') {
				normalized[field] = null;
				continue;
			}
			if (['gender', 'age', 'filesize'].includes(field)) {
				normalized[field] = toNumberOrNull(value);
				continue;
			}
			if (field === 'date' && value) {
				const dateValue = new Date(value);
				normalized[field] = Number.isNaN(dateValue.getTime()) ? null : dateValue;
				continue;
			}
			normalized[field] = value;
		}
	}

	return normalized;
};

const normalizeFilters = (filters = {}) => {
	const normalized = {...filters};
	if (normalized.gender !== undefined && normalized.gender !== '') {
		const genderNumber = Number(normalized.gender);
		normalized.gender = Number.isNaN(genderNumber) ? undefined : genderNumber;
	} else {
		normalized.gender = undefined;
	}

	if (normalized.ship !== undefined && normalized.ship !== '') {
		const shipNumber = Number(normalized.ship);
		normalized.ship = Number.isNaN(shipNumber) ? undefined : shipNumber;
	} else {
		normalized.ship = undefined;
	}

	if (normalized.dateStart) {
		const start = new Date(normalized.dateStart);
		normalized.dateStart = Number.isNaN(start.getTime()) ? undefined : start;
	}

	if (normalized.dateEnd) {
		const end = new Date(normalized.dateEnd);
		normalized.dateEnd = Number.isNaN(end.getTime()) ? undefined : end;
	}

	return normalized;
};

const list = async (query = {}) => {
        const page = Math.max(parseInt(query.page, 10) || 1, 1);
        const pageSize = Math.max(parseInt(query.pageSize, 10) || 10, 1);
        const filters = normalizeFilters(query);
        const {count, rows} = await curriculumVitaeRepo.findAndCountAll(filters, {page, pageSize});
        let statusByContact = new Map();
        const normalizedRows = Array.isArray(rows)
                ? rows.map((row) => ({
                        ...row,
                        resumeContact: row.resumeContact ?? null,
                        interviewStatus: null,
                }))
                : [];

        let fallbackRecords = [];
        if (typeof filters.ship === 'number') {
                const {records, statusByContact: contactStatuses} = await buildFallbackRecords(filters);
                fallbackRecords = records;
                statusByContact = contactStatuses;
        }

        if (statusByContact.size > 0 && normalizedRows.length > 0) {
                normalizedRows.forEach((row) => {
                        if (row.interviewStatus) {
                                return;
                        }

                        const contactTokens = new Set();

                        if (row.resumeContact) {
                                curriculumVitaeRepo.extractContactTokens(row.resumeContact).forEach((token) => {
                                        contactTokens.add(token);
                                });
                        }

                        if (row.contact) {
                                curriculumVitaeRepo.extractContactTokens(row.contact).forEach((token) => {
                                        contactTokens.add(token);
                                });
                        }

                        for (const token of contactTokens) {
                                const statusInfo = statusByContact.get(token);
                                if (statusInfo) {
                                        row.interviewStatus = statusInfo.status || null;
                                        break;
                                }
                        }
                });
        }

        const total = count + fallbackRecords.length;
        const listRows = fallbackRecords.length > 0
                ? mergeWithFallback(normalizedRows, fallbackRecords, count, page, pageSize)
                : normalizedRows;

        return {
                list: listRows,
                pagination: {
                        page,
                        pageSize,
                        total,
                }
        };
};

const create = async (payload) => {
	const normalized = normalizePayload(payload);
	return curriculumVitaeRepo.create(normalized);
};

const getById = async (id) => {
	const record = await curriculumVitaeRepo.findById(id);
	if (!record) {
		const error = new Error('简历记录不存在');
		error.code = 404;
		throw error;
	}
	return record;
};

const update = async (id, payload) => {
	const normalized = normalizePayload(payload);
	if (Object.keys(normalized).length === 0) {
		return getById(id);
	}
	const record = await curriculumVitaeRepo.updateById(id, normalized);
	if (!record) {
		const error = new Error('简历记录不存在');
		error.code = 404;
		throw error;
	}
	return record;
};

const remove = async (id) => {
	const deleted = await curriculumVitaeRepo.deleteById(id);
	if (!deleted) {
		const error = new Error('简历记录不存在');
		error.code = 404;
		throw error;
	}
	return true;
};
const getFilters = async (query = {}) => {
	return curriculumVitaeRepo.getFilterOptions(query);
};

const parseMonth = (month) => {
	if (!month || typeof month !== 'string') {
		return null;
	}

	const trimmed = month.trim();
	if (!/^\d{4}-\d{2}$/.test(trimmed)) {
		return null;
	}

	const [yearString, monthString] = trimmed.split('-');
	const year = Number(yearString);
	const monthIndex = Number(monthString) - 1;

	if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
		return null;
	}

	return new Date(year, monthIndex, 1);
};

const getMonthlyShipSummary = async (query = {}) => {
	const referenceDate = parseMonth(query.month) || new Date();
	const startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
	const endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);

	const rows = await curriculumVitaeRepo.getShipCountsByPeriod(startDate, endDate);
	const counts = new Map(rows.map((row) => [row.ship, row.count]));

	return SHIP_SUMMARY_ITEMS.map((item) => ({
		...item,
		count: counts.get(item.ship) ?? 0,
	}));
};
module.exports = {
        list,
        create,
        getById,
        update,
        remove,
        getFilters,
        getMonthlyShipSummary,
};
