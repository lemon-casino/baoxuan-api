const recruitmentStatisticRepo = require('@/repository/recruitment/recruitmentStatisticRepo');
const curriculumVitaeRepo = require('@/repository/curriculumVitaeRepo');
const TARGET_SHIPS = [
        {label: '初选通过', ship: 1},
        {label: '面试通过', ship: 4},
        {label: '已发offer', ship: 5},
        {label: '面试淘汰', ship: 6},
	    {label: '简历淘汰', ship: 7},
	    {label: '未初始', ship: 8},
];
const CURRICULUM_VITAE_SHIPS = new Set([8]);
const parseDay = (value) => {
        if (typeof value !== 'string') {
                return null;
        }
        const trimmed = value.trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                return null;
        }
        const date = new Date(trimmed);
        if (Number.isNaN(date.getTime())) {
                return null;
        }
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const parseMonth = (value) => {
        if (typeof value !== 'string') {
                return null;
        }
        const trimmed = value.trim();
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

const resolveDateRange = (query = {}) => {
        const period = typeof query.period === 'string' ? query.period.trim().toLowerCase() : 'day';
        const now = new Date();

        if (period === 'month') {
                const monthStart = parseMonth(query.month) || new Date(now.getFullYear(), now.getMonth(), 1);
                const endDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
                return {
                        period: 'month',
                        startDate: monthStart,
                        endDate,
                };
        }

        const dayStart = parseDay(query.date) || new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endDate = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate() + 1);
        return {
                period: 'day',
                startDate: dayStart,
                endDate,
        };
};

const getCurriculumVitaeShipStatistics = async (query = {}) => {
        const {period, startDate, endDate} = resolveDateRange(query);
	const recruitmentShips = TARGET_SHIPS.filter((item) => !CURRICULUM_VITAE_SHIPS.has(item.ship));
	let rows = [];
	if (recruitmentShips.length > 0) {
		rows = await recruitmentStatisticRepo.getCurriculumVitaeShipStatistics({
			startDate,
			endDate,
			ships: recruitmentShips.map((item) => item.ship),
		});
	}
        const counts = new Map(rows.map((row) => [row.ship, row.count]));
	if (CURRICULUM_VITAE_SHIPS.size > 0) {
		const curriculumVitaeCounts = await curriculumVitaeRepo.countByShipValues({
			ships: Array.from(CURRICULUM_VITAE_SHIPS),
			startDate,
			endDate,
		});
		curriculumVitaeCounts.forEach((count, ship) => {
			counts.set(ship, count);
		});
	}
        return {
                period,
                startDate,
                endDate,
                items: TARGET_SHIPS.map((item) => ({
                        ...item,
                        count: counts.get(item.ship) ?? 0,
                })),
        };
};

module.exports = {
        getCurriculumVitaeShipStatistics,
};
